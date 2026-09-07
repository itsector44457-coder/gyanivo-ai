from __future__ import annotations

import argparse
import hashlib
import json
import math
import random
import shutil
import time
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

import torch
import torch.nn.functional as F
from torch.optim import AdamW
from torch.utils.data import DataLoader, Dataset
from transformers import AutoModelForMaskedLM, AutoTokenizer

from app.training.train_all import (
    STATUS_READY,
    TrainingJob,
    discover_training_jobs,
)
from app.training.training_registry import (
    BACKBONES,
    get_training_plan,
)


# =========================================================
# GLOBAL PATHS
# =========================================================

ROOT = Path(__file__).resolve().parents[2]

FOUNDATION_ROOT = ROOT / "models" / "foundations"

DOMAIN_STAGE = "curriculum_domain_adaptation"


# =========================================================
# DEFAULT TRAINING CONFIG
# =========================================================

DEFAULT_SEED = 42
DEFAULT_EVAL_RATIO = 0.10
DEFAULT_MLM_PROBABILITY = 0.15
DEFAULT_REPLAY_RATIO = 0.25
DEFAULT_MAX_TRAIN_CHUNKS = 6000
DEFAULT_MAX_EVAL_CHUNKS = 800
DEFAULT_MAX_REPLAY_CHUNKS = 1500
DEFAULT_BATCH_SIZE = 2
DEFAULT_GRADIENT_ACCUMULATION = 4
DEFAULT_EPOCHS = 1
DEFAULT_LEARNING_RATE = 2e-5
DEFAULT_WEIGHT_DECAY = 0.01
DEFAULT_MAX_RETENTION_DEGRADATION_PERCENT = 5.0

MIN_TEXT_CHARACTERS = 80
MIN_CHUNK_TOKENS = 16


# =========================================================
# DATA CLASSES
# =========================================================

@dataclass
class TextUnit:
    job_id: str
    source_file: str
    unit_id: str
    text: str


@dataclass
class BenchmarkResult:
    loss: float
    accuracy: float
    perplexity: float | None
    masked_tokens: int


@dataclass
class FoundationContext:
    backbone_key: str
    family: str
    base_model: str
    seed_model: str
    seed_origin: str
    absorbed_jobs: list[str]
    state_path: str
    current_version: int


# =========================================================
# BASIC HELPERS
# =========================================================


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def safe_timestamp() -> str:
    return datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


def relative_or_absolute(path: Path) -> str:
    try:
        return str(path.resolve().relative_to(ROOT.resolve()))
    except ValueError:
        return str(path.resolve())


def resolve_saved_path(value: str | Path) -> Path:
    path = Path(value)
    if path.is_absolute():
        return path.resolve()
    return (ROOT / path).resolve()


def job_source_path(value: str) -> Path:
    return resolve_saved_path(value)


def normalize_text(text: str) -> str:
    return " ".join(str(text).replace("\x00", " ").split()).strip()


def stable_hash(text: str) -> str:
    return hashlib.sha1(text.encode("utf-8", errors="ignore")).hexdigest()


# =========================================================
# DEVICE
# =========================================================


def get_device() -> torch.device:
    if torch.cuda.is_available():
        return torch.device("cuda")

    if hasattr(torch, "xpu") and torch.xpu.is_available():
        return torch.device("xpu")

    return torch.device("cpu")


# =========================================================
# UNIVERSAL JOB SCOPE
# =========================================================


def ready_jobs() -> list[TrainingJob]:
    jobs = discover_training_jobs()
    return [job for job in jobs if job.status == STATUS_READY]


def choose_scope(
    jobs: list[TrainingJob],
    class_level: int | None,
    subject: str | None,
    backbone_key: str | None,
    family: str | None,
) -> tuple[str, list[TrainingJob], list[TrainingJob]]:
    """
    Returns:
        selected_backbone_key,
        target_jobs,
        all_ready_jobs_for_same_backbone
    """

    if class_level is not None or subject is not None:
        if class_level is None or subject is None:
            raise ValueError("Use --class and --subject together.")

        plan = get_training_plan(
            class_level=class_level,
            subject=subject,
        )

        selected_key = plan.backbone_key

        target = [
            job
            for job in jobs
            if job.class_level == class_level
            and job.subject == plan.canonical_subject
            and job.backbone_key == selected_key
        ]

        pool = [job for job in jobs if job.backbone_key == selected_key]
        return selected_key, target, pool

    if backbone_key is not None:
        if backbone_key not in BACKBONES:
            raise ValueError(
                f"Unknown backbone key '{backbone_key}'. "
                f"Available: {', '.join(sorted(BACKBONES))}"
            )

        target = [job for job in jobs if job.backbone_key == backbone_key]
        return backbone_key, target, target.copy()

    if family is not None:
        family_jobs = [job for job in jobs if job.subject_family == family]

        keys = sorted({job.backbone_key for job in family_jobs})

        if not family_jobs:
            raise ValueError(f"No READY curriculum jobs found for family '{family}'.")

        if len(keys) != 1:
            raise ValueError(
                f"Family '{family}' maps to multiple backbones: {keys}. "
                "Use --backbone-key, or --class + --subject."
            )

        return keys[0], family_jobs, family_jobs.copy()

    raise ValueError(
        "Select training scope using --class + --subject, "
        "--backbone-key, or --family."
    )


# =========================================================
# EXISTING REGISTERED MODEL DISCOVERY
# =========================================================


def registered_stage_manifest(job: TrainingJob) -> Path:
    output_root = resolve_saved_path(job.output_directory)
    return output_root / "stages" / DOMAIN_STAGE / "stage_manifest.json"


def load_registered_candidate(job: TrainingJob) -> dict | None:
    path = registered_stage_manifest(job)

    if not path.exists():
        return None

    try:
        payload = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError:
        return None

    if payload.get("stageStatus") != "COMPLETED":
        return None

    model_value = payload.get("trainedModelReference")
    if not model_value:
        return None

    model_path = resolve_saved_path(model_value)
    if not model_path.exists():
        return None

    benchmark = payload.get("benchmarkSummary") or {}

    relative_improvement = benchmark.get("relativeLossImprovementPercent")
    try:
        relative_improvement = float(relative_improvement)
    except (TypeError, ValueError):
        relative_improvement = float("-inf")

    adapted_better = benchmark.get("adaptedModelBetter") is True

    return {
        "job": job,
        "manifest": payload,
        "manifest_path": path,
        "model_path": model_path,
        "adapted_better": adapted_better,
        "relative_improvement": relative_improvement,
    }


def choose_registered_seed(pool_jobs: list[TrainingJob]) -> dict | None:
    candidates = []

    for job in pool_jobs:
        candidate = load_registered_candidate(job)
        if candidate is not None:
            candidates.append(candidate)

    if not candidates:
        return None

    candidates.sort(
        key=lambda item: (
            1 if item["adapted_better"] else 0,
            item["relative_improvement"],
            item["job"].class_level,
        ),
        reverse=True,
    )

    return candidates[0]


# =========================================================
# FOUNDATION STATE
# =========================================================


def foundation_directory(backbone_key: str) -> Path:
    backbone = BACKBONES[backbone_key]
    return FOUNDATION_ROOT / backbone.family.value / backbone_key


def foundation_state_path(backbone_key: str) -> Path:
    return foundation_directory(backbone_key) / "foundation_state.json"


def load_foundation_context(
    backbone_key: str,
    pool_jobs: list[TrainingJob],
) -> FoundationContext:
    backbone = BACKBONES[backbone_key]
    state_path = foundation_state_path(backbone_key)

    if state_path.exists():
        payload = json.loads(state_path.read_text(encoding="utf-8"))

        current_model = payload.get("currentModelPath")
        if not current_model:
            raise RuntimeError(
                f"Foundation state exists but currentModelPath is missing:\n{state_path}"
            )

        resolved_model = resolve_saved_path(current_model)
        if not resolved_model.exists():
            raise FileNotFoundError(
                "Foundation state points to missing model:\n"
                f"{resolved_model}"
            )

        return FoundationContext(
            backbone_key=backbone_key,
            family=backbone.family.value,
            base_model=backbone.model_id,
            seed_model=str(resolved_model),
            seed_origin="FOUNDATION_STATE",
            absorbed_jobs=list(payload.get("absorbedJobs", [])),
            state_path=str(state_path),
            current_version=int(payload.get("currentVersion", 0)),
        )

    registered = choose_registered_seed(pool_jobs)

    if registered is not None:
        return FoundationContext(
            backbone_key=backbone_key,
            family=backbone.family.value,
            base_model=backbone.model_id,
            seed_model=str(registered["model_path"]),
            seed_origin="REGISTERED_EXISTING_MODEL",
            absorbed_jobs=[registered["job"].job_id],
            state_path=str(state_path),
            current_version=0,
        )

    return FoundationContext(
        backbone_key=backbone_key,
        family=backbone.family.value,
        base_model=backbone.model_id,
        seed_model=backbone.model_id,
        seed_origin="BASE_PRETRAINED_BACKBONE",
        absorbed_jobs=[],
        state_path=str(state_path),
        current_version=0,
    )


# =========================================================
# TEXT EXTRACTION
# =========================================================


def split_large_text(text: str, chunk_chars: int = 5000) -> list[str]:
    text = normalize_text(text)
    if len(text) < MIN_TEXT_CHARACTERS:
        return []

    if len(text) <= chunk_chars:
        return [text]

    parts = []
    start = 0

    while start < len(text):
        end = min(start + chunk_chars, len(text))
        part = normalize_text(text[start:end])
        if len(part) >= MIN_TEXT_CHARACTERS:
            parts.append(part)
        start = end

    return parts


def extract_strings_from_json(value) -> Iterable[str]:
    if isinstance(value, str):
        text = normalize_text(value)
        if len(text) >= MIN_TEXT_CHARACTERS:
            yield text
        return

    if isinstance(value, list):
        for item in value:
            yield from extract_strings_from_json(item)
        return

    if isinstance(value, dict):
        for item in value.values():
            yield from extract_strings_from_json(item)


def extract_file_units(job: TrainingJob, path: Path) -> list[TextUnit]:
    suffix = path.suffix.lower()
    units: list[TextUnit] = []
    display_path = relative_or_absolute(path)

    if suffix == ".pdf":
        from pypdf import PdfReader

        reader = PdfReader(str(path))

        for page_index, page in enumerate(reader.pages, start=1):
            try:
                text = normalize_text(page.extract_text() or "")
            except Exception:
                text = ""

            if len(text) < MIN_TEXT_CHARACTERS:
                continue

            units.append(
                TextUnit(
                    job_id=job.job_id,
                    source_file=display_path,
                    unit_id=f"{display_path}#page={page_index}",
                    text=text,
                )
            )

        return units

    if suffix in {".txt", ".md"}:
        text = path.read_text(encoding="utf-8", errors="ignore")

        for index, part in enumerate(split_large_text(text), start=1):
            units.append(
                TextUnit(
                    job_id=job.job_id,
                    source_file=display_path,
                    unit_id=f"{display_path}#part={index}",
                    text=part,
                )
            )

        return units

    if suffix == ".json":
        try:
            payload = json.loads(path.read_text(encoding="utf-8", errors="ignore"))
        except json.JSONDecodeError:
            return []

        for index, text in enumerate(extract_strings_from_json(payload), start=1):
            for sub_index, part in enumerate(split_large_text(text), start=1):
                units.append(
                    TextUnit(
                        job_id=job.job_id,
                        source_file=display_path,
                        unit_id=f"{display_path}#json={index}.{sub_index}",
                        text=part,
                    )
                )

        return units

    if suffix == ".jsonl":
        with path.open("r", encoding="utf-8", errors="ignore") as file:
            for line_number, line in enumerate(file, start=1):
                line = line.strip()
                if not line:
                    continue

                try:
                    payload = json.loads(line)
                except json.JSONDecodeError:
                    continue

                strings = list(extract_strings_from_json(payload))
                if not strings:
                    continue

                text = normalize_text(" ".join(strings))
                for sub_index, part in enumerate(split_large_text(text), start=1):
                    units.append(
                        TextUnit(
                            job_id=job.job_id,
                            source_file=display_path,
                            unit_id=f"{display_path}#line={line_number}.{sub_index}",
                            text=part,
                        )
                    )

        return units

    return units


def load_text_units(jobs: list[TrainingJob]) -> list[TextUnit]:
    units: list[TextUnit] = []
    seen_text_hashes: set[str] = set()

    for job in jobs:
        print(f"   📚 Extracting {job.job_id} ({job.source_file_count} source files)")

        for saved_path in job.source_files:
            path = job_source_path(saved_path)

            if not path.exists() or not path.is_file():
                print(f"      ⚠ Missing file skipped: {saved_path}")
                continue

            try:
                file_units = extract_file_units(job, path)
            except Exception as error:
                print(f"      ⚠ Failed to extract {saved_path}: {error}")
                continue

            for unit in file_units:
                digest = stable_hash(normalize_text(unit.text).lower())
                if digest in seen_text_hashes:
                    continue

                seen_text_hashes.add(digest)
                units.append(unit)

    return units


# =========================================================
# SPLITTING + TOKEN CHUNKING
# =========================================================


def split_units(
    units: list[TextUnit],
    eval_ratio: float,
    seed: int,
) -> tuple[list[TextUnit], list[TextUnit]]:
    if len(units) < 2:
        raise RuntimeError("At least two usable text units are required.")

    shuffled = units.copy()
    random.Random(seed).shuffle(shuffled)

    eval_count = max(1, int(round(len(shuffled) * eval_ratio)))
    eval_count = min(eval_count, len(shuffled) - 1)

    eval_units = shuffled[:eval_count]
    train_units = shuffled[eval_count:]

    return train_units, eval_units


def tokenizer_special_tokens(tokenizer) -> tuple[int, int]:
    start_id = tokenizer.cls_token_id
    if start_id is None:
        start_id = tokenizer.bos_token_id

    end_id = tokenizer.sep_token_id
    if end_id is None:
        end_id = tokenizer.eos_token_id

    if start_id is None or end_id is None:
        raise RuntimeError(
            "Tokenizer must provide CLS/BOS and SEP/EOS tokens for MLM chunking."
        )

    return int(start_id), int(end_id)


def build_token_chunks(
    units: list[TextUnit],
    tokenizer,
    max_length: int,
) -> list[list[int]]:
    start_id, end_id = tokenizer_special_tokens(tokenizer)
    content_length = max_length - 2

    chunks: list[list[int]] = []

    for unit in units:
        encoded = tokenizer(
            unit.text,
            add_special_tokens=False,
            truncation=False,
            return_attention_mask=False,
            return_token_type_ids=False,
        )

        token_ids = encoded["input_ids"]

        for start in range(0, len(token_ids), content_length):
            content = token_ids[start : start + content_length]

            if len(content) < MIN_CHUNK_TOKENS:
                continue

            chunks.append([start_id, *content, end_id])

    return chunks


def deterministic_sample(
    items: list,
    maximum: int,
    seed: int,
) -> list:
    if len(items) <= maximum:
        return items

    indices = list(range(len(items)))
    random.Random(seed).shuffle(indices)
    selected = sorted(indices[:maximum])
    return [items[index] for index in selected]


# =========================================================
# DATASETS + MASKING
# =========================================================


class ChunkDataset(Dataset):
    def __init__(self, chunks: list[list[int]]):
        self.chunks = chunks

    def __len__(self):
        return len(self.chunks)

    def __getitem__(self, index: int):
        return self.chunks[index]


class FixedMLMDataset(Dataset):
    def __init__(self, examples: list[dict]):
        self.examples = examples

    def __len__(self):
        return len(self.examples)

    def __getitem__(self, index: int):
        return self.examples[index]


def special_token_ids(tokenizer) -> set[int]:
    values = {
        tokenizer.cls_token_id,
        tokenizer.sep_token_id,
        tokenizer.pad_token_id,
        tokenizer.mask_token_id,
        tokenizer.bos_token_id,
        tokenizer.eos_token_id,
    }
    return {int(value) for value in values if value is not None}


def create_fixed_mask_example(
    token_ids: list[int],
    tokenizer,
    probability: float,
    seed: int,
) -> dict:
    rng = random.Random(seed)

    input_ids = token_ids.copy()
    labels = [-100] * len(token_ids)

    specials = special_token_ids(tokenizer)

    candidates = [
        index
        for index, token_id in enumerate(token_ids)
        if token_id not in specials
    ]

    if not candidates:
        raise RuntimeError("No maskable tokens found in evaluation chunk.")

    selected = [position for position in candidates if rng.random() < probability]

    if not selected:
        selected = [rng.choice(candidates)]

    mask_token_id = tokenizer.mask_token_id
    if mask_token_id is None:
        raise RuntimeError("Tokenizer has no mask token.")

    vocab_size = int(tokenizer.vocab_size)

    for position in selected:
        labels[position] = token_ids[position]
        roll = rng.random()

        if roll < 0.80:
            input_ids[position] = int(mask_token_id)
        elif roll < 0.90:
            input_ids[position] = rng.randrange(vocab_size)

    return {"input_ids": input_ids, "labels": labels}


def make_fixed_examples(
    chunks: list[list[int]],
    tokenizer,
    probability: float,
    seed: int,
) -> list[dict]:
    return [
        create_fixed_mask_example(
            chunk,
            tokenizer=tokenizer,
            probability=probability,
            seed=seed + index,
        )
        for index, chunk in enumerate(chunks)
    ]


def pad_id(tokenizer) -> int:
    if tokenizer.pad_token_id is not None:
        return int(tokenizer.pad_token_id)

    if tokenizer.eos_token_id is not None:
        return int(tokenizer.eos_token_id)

    return 0


def make_fixed_collate(tokenizer):
    padding_id = pad_id(tokenizer)

    def collate(batch: list[dict]):
        max_len = max(len(item["input_ids"]) for item in batch)

        input_rows = []
        attention_rows = []
        label_rows = []

        for item in batch:
            length = len(item["input_ids"])
            pad_len = max_len - length

            input_rows.append(item["input_ids"] + [padding_id] * pad_len)
            attention_rows.append([1] * length + [0] * pad_len)
            label_rows.append(item["labels"] + [-100] * pad_len)

        return {
            "input_ids": torch.tensor(input_rows, dtype=torch.long),
            "attention_mask": torch.tensor(attention_rows, dtype=torch.long),
            "labels": torch.tensor(label_rows, dtype=torch.long),
        }

    return collate


def make_dynamic_mlm_collate(tokenizer, probability: float):
    padding_id = pad_id(tokenizer)
    mask_token_id = tokenizer.mask_token_id

    if mask_token_id is None:
        raise RuntimeError("Tokenizer has no mask token.")

    specials = special_token_ids(tokenizer)
    vocab_size = int(tokenizer.vocab_size)

    def collate(batch: list[list[int]]):
        max_len = max(len(item) for item in batch)

        input_rows = []
        attention_rows = []

        for item in batch:
            pad_len = max_len - len(item)
            input_rows.append(item + [padding_id] * pad_len)
            attention_rows.append([1] * len(item) + [0] * pad_len)

        input_ids = torch.tensor(input_rows, dtype=torch.long)
        attention_mask = torch.tensor(attention_rows, dtype=torch.long)
        labels = input_ids.clone()

        candidate_mask = attention_mask.bool()

        for token_id in specials:
            candidate_mask &= input_ids.ne(token_id)

        selection = torch.rand(input_ids.shape) < probability
        selection &= candidate_mask

        for row in range(selection.shape[0]):
            if selection[row].sum().item() == 0:
                positions = candidate_mask[row].nonzero(as_tuple=False).flatten()
                if len(positions) > 0:
                    chosen = positions[torch.randint(0, len(positions), (1,)).item()]
                    selection[row, chosen] = True

        labels[~selection] = -100

        replacement_roll = torch.rand(input_ids.shape)

        mask_positions = selection & (replacement_roll < 0.80)
        random_positions = (
            selection
            & (replacement_roll >= 0.80)
            & (replacement_roll < 0.90)
        )

        input_ids[mask_positions] = int(mask_token_id)

        if random_positions.any():
            random_tokens = torch.randint(
                low=0,
                high=vocab_size,
                size=input_ids.shape,
                dtype=torch.long,
            )
            input_ids[random_positions] = random_tokens[random_positions]

        return {
            "input_ids": input_ids,
            "attention_mask": attention_mask,
            "labels": labels,
        }

    return collate


# =========================================================
# MODEL TRAINABILITY
# =========================================================


def get_transformer_layers(model):
    candidates = []

    if hasattr(model, "bert") and hasattr(model.bert, "encoder"):
        candidates.append(model.bert.encoder)

    if hasattr(model, "deberta") and hasattr(model.deberta, "encoder"):
        candidates.append(model.deberta.encoder)

    if hasattr(model, "roberta") and hasattr(model.roberta, "encoder"):
        candidates.append(model.roberta.encoder)

    for encoder in candidates:
        if hasattr(encoder, "layer"):
            return encoder.layer

    return None


def configure_trainability(model, unfreeze_last_n: int):
    if unfreeze_last_n <= 0:
        for parameter in model.parameters():
            parameter.requires_grad = True
        return "FULL_MODEL"

    for parameter in model.parameters():
        parameter.requires_grad = False

    layers = get_transformer_layers(model)
    if layers is None:
        raise RuntimeError(
            "Could not locate transformer layers for partial unfreezing. "
            "Use --unfreeze-last-n 0 for full-model training."
        )

    count = min(unfreeze_last_n, len(layers))

    for layer in layers[-count:]:
        for parameter in layer.parameters():
            parameter.requires_grad = True

    for name, parameter in model.named_parameters():
        lowered = name.lower()
        if (
            "lm_head" in lowered
            or "predictions" in lowered
            or lowered.startswith("cls.")
        ):
            parameter.requires_grad = True

    return f"LAST_{count}_LAYERS_PLUS_MLM_HEAD"


def tracked_parameter_snapshot(model):
    selected_name = None
    selected_parameter = None

    for name, parameter in model.named_parameters():
        if parameter.requires_grad and parameter.ndim >= 2:
            selected_name = name
            selected_parameter = parameter

    if selected_parameter is None:
        raise RuntimeError("No trainable matrix parameter found for weight tracking.")

    flat = selected_parameter.detach().cpu().flatten()
    count = min(4096, flat.numel())

    return selected_name, selected_parameter, flat[:count].clone()


# =========================================================
# EVALUATION
# =========================================================


def evaluate_model(
    model,
    loader: DataLoader,
    device: torch.device,
) -> BenchmarkResult:
    model.eval()

    total_loss = 0.0
    total_correct = 0
    total_tokens = 0

    with torch.inference_mode():
        for batch in loader:
            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
            )

            logits = outputs.logits

            loss_sum = F.cross_entropy(
                logits.reshape(-1, logits.shape[-1]),
                labels.reshape(-1),
                ignore_index=-100,
                reduction="sum",
            )

            masked = labels.ne(-100)
            count = int(masked.sum().item())

            if count == 0:
                continue

            predictions = logits.argmax(dim=-1)
            correct = int((predictions[masked] == labels[masked]).sum().item())

            total_loss += float(loss_sum.item())
            total_correct += correct
            total_tokens += count

    if total_tokens == 0:
        raise RuntimeError("Evaluation contained zero masked tokens.")

    average_loss = total_loss / total_tokens
    accuracy = total_correct / total_tokens

    try:
        perplexity = math.exp(average_loss)
    except OverflowError:
        perplexity = None

    return BenchmarkResult(
        loss=average_loss,
        accuracy=accuracy,
        perplexity=perplexity,
        masked_tokens=total_tokens,
    )


# =========================================================
# TRAINING
# =========================================================


def train_model(
    model,
    train_loader: DataLoader,
    device: torch.device,
    epochs: int,
    learning_rate: float,
    weight_decay: float,
    gradient_accumulation: int,
) -> dict:
    trainable_parameters = [
        parameter
        for parameter in model.parameters()
        if parameter.requires_grad
    ]

    if not trainable_parameters:
        raise RuntimeError("Model has no trainable parameters.")

    optimizer = AdamW(
        trainable_parameters,
        lr=learning_rate,
        weight_decay=weight_decay,
    )

    global_optimizer_step = 0
    batch_step = 0
    total_logged_loss = 0.0
    logged_batches = 0
    started = time.time()

    model.train()
    optimizer.zero_grad(set_to_none=True)

    for epoch in range(epochs):
        print(f"\n📘 Epoch {epoch + 1}/{epochs}")

        for batch in train_loader:
            batch_step += 1

            input_ids = batch["input_ids"].to(device)
            attention_mask = batch["attention_mask"].to(device)
            labels = batch["labels"].to(device)

            outputs = model(
                input_ids=input_ids,
                attention_mask=attention_mask,
                labels=labels,
            )

            raw_loss = outputs.loss
            loss = raw_loss / gradient_accumulation
            loss.backward()

            total_logged_loss += float(raw_loss.item())
            logged_batches += 1

            should_step = (
                batch_step % gradient_accumulation == 0
                or batch_step == len(train_loader) * (epoch + 1)
            )

            if should_step:
                torch.nn.utils.clip_grad_norm_(trainable_parameters, max_norm=1.0)
                optimizer.step()
                optimizer.zero_grad(set_to_none=True)

                global_optimizer_step += 1

                if global_optimizer_step == 1 or global_optimizer_step % 25 == 0:
                    print(
                        f"Step {global_optimizer_step} "
                        f"| MLM loss {raw_loss.item():.4f}"
                    )

    elapsed = time.time() - started

    return {
        "optimizerSteps": global_optimizer_step,
        "trainingBatches": batch_step,
        "averageObservedBatchLoss": (
            total_logged_loss / logged_batches if logged_batches else None
        ),
        "elapsedSeconds": elapsed,
    }


# =========================================================
# VERSIONING + STATE
# =========================================================


def next_version_number(context: FoundationContext) -> int:
    return context.current_version + 1


def write_foundation_state(
    context: FoundationContext,
    promoted_model_path: Path,
    promoted_version: int,
    absorbed_jobs: list[str],
    benchmark_payload: dict,
):
    root = foundation_directory(context.backbone_key)
    root.mkdir(parents=True, exist_ok=True)

    state_path = foundation_state_path(context.backbone_key)

    previous_history = []
    if state_path.exists():
        try:
            previous_history = json.loads(
                state_path.read_text(encoding="utf-8")
            ).get("history", [])
        except Exception:
            previous_history = []

    history_item = {
        "version": promoted_version,
        "promotedAtUTC": utc_now(),
        "modelPath": relative_or_absolute(promoted_model_path),
        "newlyAbsorbedJobs": benchmark_payload.get("newJobs", []),
        "benchmark": benchmark_payload,
    }

    payload = {
        "schemaVersion": 1,
        "updatedAtUTC": utc_now(),
        "family": context.family,
        "backboneKey": context.backbone_key,
        "baseBackbone": context.base_model,
        "currentVersion": promoted_version,
        "currentModelPath": relative_or_absolute(promoted_model_path),
        "absorbedJobs": sorted(set(absorbed_jobs)),
        "history": [*previous_history, history_item],
    }

    state_path.write_text(
        json.dumps(payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )


# =========================================================
# REPORTING
# =========================================================


def print_plan(
    context: FoundationContext,
    target_jobs: list[TrainingJob],
    pool_jobs: list[TrainingJob],
):
    absorbed = set(context.absorbed_jobs)
    new_jobs = [job for job in target_jobs if job.job_id not in absorbed]

    print("\n" + "=" * 76)
    print("🧠 GYANIVO GENERIC DOMAIN-ADAPTATION PLAN")
    print("=" * 76)
    print(f"Backbone key: {context.backbone_key}")
    print(f"Family: {context.family}")
    print(f"Base backbone: {context.base_model}")
    print(f"Seed origin: {context.seed_origin}")
    print(f"Seed model: {context.seed_model}")
    print(f"Current foundation version: {context.current_version}")

    print("\nREADY jobs using this backbone:")
    for job in pool_jobs:
        marker = "✅ absorbed" if job.job_id in absorbed else "🆕 available"
        print(f"   {marker}  {job.job_id}  ({job.source_file_count} files)")

    print("\nSelected target jobs:")
    for job in target_jobs:
        marker = "SKIP" if job.job_id in absorbed else "TRAIN"
        print(f"   {marker:5s}  {job.job_id}")

    print("\nNew curriculum jobs to train:", len(new_jobs))

    if not new_jobs:
        print("✅ Nothing new to train. Existing trained knowledge will be reused.")
    else:
        print("REAL MLM training will run on:")
        for job in new_jobs:
            print(f"   → {job.job_id}")

        if context.absorbed_jobs:
            print("\nReplay protection will sample previously absorbed curriculum:")
            for job_id in context.absorbed_jobs:
                print(f"   ↺ {job_id}")

    print("=" * 76)


# =========================================================
# MAIN TRAINING PIPELINE
# =========================================================


def run_adaptation(
    context: FoundationContext,
    target_jobs: list[TrainingJob],
    pool_jobs: list[TrainingJob],
    args,
):
    absorbed = set(context.absorbed_jobs)
    new_jobs = [job for job in target_jobs if job.job_id not in absorbed]

    if not new_jobs:
        print("\n✅ No new curriculum jobs. Neural training skipped.")
        return

    pool_by_id = {job.job_id: job for job in pool_jobs}

    replay_jobs = [
        pool_by_id[job_id]
        for job_id in context.absorbed_jobs
        if job_id in pool_by_id
    ]

    missing_replay_jobs = [
        job_id
        for job_id in context.absorbed_jobs
        if job_id not in pool_by_id
    ]

    if missing_replay_jobs:
        print("\n⚠ Some absorbed jobs are not currently resolvable for replay:")
        for job_id in missing_replay_jobs:
            print(f"   {job_id}")

    device = get_device()

    print("\n" + "=" * 76)
    print("🚀 REAL GENERIC CURRICULUM DOMAIN ADAPTATION")
    print("=" * 76)
    print(f"Device: {device}")
    print(f"Seed model: {context.seed_model}")
    print(f"New jobs: {[job.job_id for job in new_jobs]}")
    print(f"Replay jobs: {[job.job_id for job in replay_jobs]}")
    print("Backpropagation: YES")
    print("Optimizer updates: YES")
    print("Fixed old-vs-new benchmark: YES")
    print("Automatic promote/reject: YES")
    print("=" * 76)

    # -----------------------------------------------------
    # Load tokenizer first so we can build chunks.
    # -----------------------------------------------------

    print("\n📥 Loading tokenizer...")
    tokenizer = AutoTokenizer.from_pretrained(context.seed_model)
    print("✅ Tokenizer loaded")

    backbone = BACKBONES[context.backbone_key]
    max_length = int(args.max_length or backbone.max_length)

    # -----------------------------------------------------
    # Extract real curriculum text.
    # -----------------------------------------------------

    print("\n📚 Extracting NEW real curriculum text...")
    new_units = load_text_units(new_jobs)

    if len(new_units) < 2:
        raise RuntimeError(
            f"Only {len(new_units)} usable new text units were extracted."
        )

    new_train_units, new_eval_units = split_units(
        new_units,
        eval_ratio=args.eval_ratio,
        seed=args.seed,
    )

    print(f"✅ New usable units: {len(new_units)}")
    print(f"📘 New train units: {len(new_train_units)}")
    print(f"📗 New eval units: {len(new_eval_units)}")

    new_train_chunks = build_token_chunks(
        new_train_units,
        tokenizer=tokenizer,
        max_length=max_length,
    )

    new_eval_chunks = build_token_chunks(
        new_eval_units,
        tokenizer=tokenizer,
        max_length=max_length,
    )

    new_train_chunks = deterministic_sample(
        new_train_chunks,
        maximum=args.max_train_chunks,
        seed=args.seed + 10,
    )

    new_eval_chunks = deterministic_sample(
        new_eval_chunks,
        maximum=args.max_eval_chunks,
        seed=args.seed + 20,
    )

    if not new_train_chunks or not new_eval_chunks:
        raise RuntimeError("New curriculum did not produce enough token chunks.")

    # -----------------------------------------------------
    # Replay + retention validation from absorbed data.
    # -----------------------------------------------------

    replay_train_chunks: list[list[int]] = []
    old_eval_chunks: list[list[int]] = []

    if replay_jobs:
        print("\n↺ Extracting replay curriculum...")
        old_units = load_text_units(replay_jobs)

        if len(old_units) >= 2:
            old_train_units, old_eval_units = split_units(
                old_units,
                eval_ratio=args.eval_ratio,
                seed=args.seed + 1000,
            )

            replay_all_chunks = build_token_chunks(
                old_train_units,
                tokenizer=tokenizer,
                max_length=max_length,
            )

            old_eval_chunks = build_token_chunks(
                old_eval_units,
                tokenizer=tokenizer,
                max_length=max_length,
            )

            desired_replay = min(
                args.max_replay_chunks,
                max(1, int(round(len(new_train_chunks) * args.replay_ratio))),
            )

            replay_train_chunks = deterministic_sample(
                replay_all_chunks,
                maximum=desired_replay,
                seed=args.seed + 1010,
            )

            old_eval_chunks = deterministic_sample(
                old_eval_chunks,
                maximum=args.max_eval_chunks,
                seed=args.seed + 1020,
            )

    training_chunks = [*new_train_chunks, *replay_train_chunks]
    random.Random(args.seed + 2000).shuffle(training_chunks)

    print("\n🧩 TOKEN DATASET")
    print(f"New train chunks: {len(new_train_chunks)}")
    print(f"Replay train chunks: {len(replay_train_chunks)}")
    print(f"Combined train chunks: {len(training_chunks)}")
    print(f"New fixed eval chunks: {len(new_eval_chunks)}")
    print(f"Old retention eval chunks: {len(old_eval_chunks)}")

    # -----------------------------------------------------
    # Fixed validation masks shared by before/after models.
    # -----------------------------------------------------

    new_fixed_examples = make_fixed_examples(
        new_eval_chunks,
        tokenizer=tokenizer,
        probability=args.mlm_probability,
        seed=args.seed + 3000,
    )

    old_fixed_examples = (
        make_fixed_examples(
            old_eval_chunks,
            tokenizer=tokenizer,
            probability=args.mlm_probability,
            seed=args.seed + 4000,
        )
        if old_eval_chunks
        else []
    )

    fixed_collate = make_fixed_collate(tokenizer)

    new_eval_loader = DataLoader(
        FixedMLMDataset(new_fixed_examples),
        batch_size=args.batch_size,
        shuffle=False,
        num_workers=0,
        collate_fn=fixed_collate,
    )

    old_eval_loader = (
        DataLoader(
            FixedMLMDataset(old_fixed_examples),
            batch_size=args.batch_size,
            shuffle=False,
            num_workers=0,
            collate_fn=fixed_collate,
        )
        if old_fixed_examples
        else None
    )

    train_loader = DataLoader(
        ChunkDataset(training_chunks),
        batch_size=args.batch_size,
        shuffle=True,
        num_workers=0,
        collate_fn=make_dynamic_mlm_collate(
            tokenizer,
            probability=args.mlm_probability,
        ),
        drop_last=False,
    )

    # -----------------------------------------------------
    # Load seed model.
    # -----------------------------------------------------

    print("\n📥 Loading seed MLM model...")
    model = AutoModelForMaskedLM.from_pretrained(context.seed_model)
    model.to(device)

    trainability_mode = configure_trainability(
        model,
        unfreeze_last_n=args.unfreeze_last_n,
    )

    trainable_count = sum(
        parameter.numel()
        for parameter in model.parameters()
        if parameter.requires_grad
    )

    total_count = sum(parameter.numel() for parameter in model.parameters())

    print("✅ Seed model loaded")
    print(f"Total parameters: {total_count:,}")
    print(f"Trainable parameters: {trainable_count:,}")
    print(f"Trainability: {trainability_mode}")

    tracked_name, tracked_parameter, weight_before = tracked_parameter_snapshot(model)

    # -----------------------------------------------------
    # Baseline benchmark.
    # -----------------------------------------------------

    print("\n🔬 BASELINE FIXED BENCHMARK")
    baseline_new = evaluate_model(model, new_eval_loader, device)

    print(
        f"NEW curriculum | loss {baseline_new.loss:.6f} "
        f"| accuracy {baseline_new.accuracy * 100:.2f}%"
    )

    baseline_old = None
    if old_eval_loader is not None:
        baseline_old = evaluate_model(model, old_eval_loader, device)
        print(
            f"OLD retention | loss {baseline_old.loss:.6f} "
            f"| accuracy {baseline_old.accuracy * 100:.2f}%"
        )

    # -----------------------------------------------------
    # Real training.
    # -----------------------------------------------------

    torch.manual_seed(args.seed)
    random.seed(args.seed)

    training_metrics = train_model(
        model=model,
        train_loader=train_loader,
        device=device,
        epochs=args.epochs,
        learning_rate=args.learning_rate,
        weight_decay=args.weight_decay,
        gradient_accumulation=args.gradient_accumulation,
    )

    # -----------------------------------------------------
    # Weight-change proof.
    # -----------------------------------------------------

    weight_after = tracked_parameter.detach().cpu().flatten()[: weight_before.numel()].clone()
    difference = (weight_after - weight_before).abs()

    changed_values = int((difference > 0).sum().item())
    weights_changed = changed_values > 0
    mean_weight_change = float(difference.mean().item())
    max_weight_change = float(difference.max().item())

    # -----------------------------------------------------
    # Candidate benchmark using exact same masked tokens.
    # -----------------------------------------------------

    print("\n🔬 CANDIDATE FIXED BENCHMARK")
    candidate_new = evaluate_model(model, new_eval_loader, device)

    print(
        f"NEW curriculum | loss {candidate_new.loss:.6f} "
        f"| accuracy {candidate_new.accuracy * 100:.2f}%"
    )

    candidate_old = None
    if old_eval_loader is not None:
        candidate_old = evaluate_model(model, old_eval_loader, device)
        print(
            f"OLD retention | loss {candidate_old.loss:.6f} "
            f"| accuracy {candidate_old.accuracy * 100:.2f}%"
        )

    new_loss_improvement = baseline_new.loss - candidate_new.loss
    new_relative_improvement_percent = (
        new_loss_improvement / baseline_new.loss * 100
        if baseline_new.loss > 0
        else 0.0
    )

    retention_degradation_percent = None
    retention_ok = True

    if baseline_old is not None and candidate_old is not None:
        retention_degradation_percent = (
            (candidate_old.loss - baseline_old.loss) / baseline_old.loss * 100
            if baseline_old.loss > 0
            else 0.0
        )

        retention_ok = (
            retention_degradation_percent
            <= args.max_retention_loss_degradation_percent
        )

    new_data_better = candidate_new.loss < baseline_new.loss

    promoted = bool(weights_changed and new_data_better and retention_ok)

    # -----------------------------------------------------
    # Save candidate before promotion decision.
    # -----------------------------------------------------

    foundation_root = foundation_directory(context.backbone_key)
    candidate_root = foundation_root / "candidates" / safe_timestamp()
    candidate_root.mkdir(parents=True, exist_ok=True)

    model.save_pretrained(candidate_root)
    tokenizer.save_pretrained(candidate_root)

    next_version = next_version_number(context)

    benchmark_payload = {
        "createdAtUTC": utc_now(),
        "backboneKey": context.backbone_key,
        "family": context.family,
        "seedOrigin": context.seed_origin,
        "seedModel": context.seed_model,
        "newJobs": [job.job_id for job in new_jobs],
        "replayJobs": [job.job_id for job in replay_jobs],
        "newTrainChunks": len(new_train_chunks),
        "replayTrainChunks": len(replay_train_chunks),
        "newEvalChunks": len(new_eval_chunks),
        "oldEvalChunks": len(old_eval_chunks),
        "beforeNew": asdict(baseline_new),
        "afterNew": asdict(candidate_new),
        "beforeOldRetention": asdict(baseline_old) if baseline_old else None,
        "afterOldRetention": asdict(candidate_old) if candidate_old else None,
        "newLossImprovement": new_loss_improvement,
        "newRelativeLossImprovementPercent": new_relative_improvement_percent,
        "retentionLossDegradationPercent": retention_degradation_percent,
        "maximumAllowedRetentionLossDegradationPercent": (
            args.max_retention_loss_degradation_percent
        ),
        "trackedParameter": tracked_name,
        "trackedValues": int(weight_before.numel()),
        "changedTrackedValues": changed_values,
        "meanWeightChange": mean_weight_change,
        "maxWeightChange": max_weight_change,
        "weightsChanged": weights_changed,
        "newDataBetter": new_data_better,
        "retentionOK": retention_ok,
        "promoted": promoted,
        "training": training_metrics,
        "trainabilityMode": trainability_mode,
        "trainableParameters": trainable_count,
        "totalParameters": total_count,
        "importantNote": (
            "The fixed new-curriculum split is a validation benchmark used for "
            "promotion decisions, not an independent final test set."
        ),
    }

    (candidate_root / "benchmark.json").write_text(
        json.dumps(benchmark_payload, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )

    # -----------------------------------------------------
    # Promote or reject.
    # -----------------------------------------------------

    if promoted:
        versions_root = foundation_root / "versions"
        versions_root.mkdir(parents=True, exist_ok=True)

        version_root = versions_root / f"v{next_version:04d}"

        if version_root.exists():
            raise RuntimeError(f"Version destination already exists: {version_root}")

        shutil.move(str(candidate_root), str(version_root))

        absorbed_after = sorted(
            set(context.absorbed_jobs)
            | {job.job_id for job in new_jobs}
        )

        write_foundation_state(
            context=context,
            promoted_model_path=version_root,
            promoted_version=next_version,
            absorbed_jobs=absorbed_after,
            benchmark_payload=benchmark_payload,
        )

        final_model_location = version_root
        decision = "PROMOTED"
    else:
        rejected_root = foundation_root / "rejected"
        rejected_root.mkdir(parents=True, exist_ok=True)

        rejected_path = rejected_root / candidate_root.name
        shutil.move(str(candidate_root), str(rejected_path))
        final_model_location = rejected_path
        decision = "REJECTED"

    # -----------------------------------------------------
    # Final output.
    # -----------------------------------------------------

    print("\n" + "=" * 76)
    print("📊 DOMAIN-ADAPTATION RESULT")
    print("=" * 76)
    print(f"Seed origin: {context.seed_origin}")
    print(f"New jobs: {[job.job_id for job in new_jobs]}")
    print(f"Replay jobs: {[job.job_id for job in replay_jobs]}")
    print()
    print("NEW CURRICULUM")
    print(f"Before loss: {baseline_new.loss:.6f}")
    print(f"After loss:  {candidate_new.loss:.6f}")
    print(f"Relative improvement: {new_relative_improvement_percent:.2f}%")
    print(f"Before accuracy: {baseline_new.accuracy * 100:.2f}%")
    print(f"After accuracy:  {candidate_new.accuracy * 100:.2f}%")

    if baseline_old is not None and candidate_old is not None:
        print()
        print("OLD CURRICULUM RETENTION")
        print(f"Before loss: {baseline_old.loss:.6f}")
        print(f"After loss:  {candidate_old.loss:.6f}")
        print(
            "Loss degradation: "
            f"{retention_degradation_percent:.2f}% "
            f"(allowed <= {args.max_retention_loss_degradation_percent:.2f}%)"
        )

    print()
    print("WEIGHT UPDATE PROOF")
    print(f"Tracked: {tracked_name}")
    print(f"Changed values: {changed_values}/{weight_before.numel()}")
    print(f"Mean change: {mean_weight_change:.12f}")
    print(f"Max change: {max_weight_change:.12f}")
    print(f"Weights changed: {weights_changed}")
    print()
    print(f"New data better: {new_data_better}")
    print(f"Retention OK: {retention_ok}")
    print(f"Decision: {decision}")
    print(f"Model location: {final_model_location}")

    if promoted:
        print(f"Foundation state: {foundation_state_path(context.backbone_key)}")

    print("=" * 76)


# =========================================================
# CLI
# =========================================================


def parse_arguments():
    parser = argparse.ArgumentParser(
        description=(
            "Gyanivo generic real-ML curriculum domain adaptation with replay, "
            "fixed benchmarking, versioning, and automatic promotion."
        )
    )

    scope = parser.add_argument_group("scope")
    scope.add_argument("--class", dest="class_level", type=int, default=None)
    scope.add_argument("--subject", type=str, default=None)
    scope.add_argument("--backbone-key", type=str, default=None)
    scope.add_argument("--family", type=str, default=None)

    mode = parser.add_mutually_exclusive_group()
    mode.add_argument("--plan", action="store_true")
    mode.add_argument("--run", action="store_true")

    parser.add_argument("--epochs", type=int, default=DEFAULT_EPOCHS)
    parser.add_argument("--batch-size", type=int, default=DEFAULT_BATCH_SIZE)
    parser.add_argument(
        "--gradient-accumulation",
        type=int,
        default=DEFAULT_GRADIENT_ACCUMULATION,
    )
    parser.add_argument("--learning-rate", type=float, default=DEFAULT_LEARNING_RATE)
    parser.add_argument("--weight-decay", type=float, default=DEFAULT_WEIGHT_DECAY)
    parser.add_argument("--eval-ratio", type=float, default=DEFAULT_EVAL_RATIO)
    parser.add_argument(
        "--mlm-probability",
        type=float,
        default=DEFAULT_MLM_PROBABILITY,
    )
    parser.add_argument("--replay-ratio", type=float, default=DEFAULT_REPLAY_RATIO)
    parser.add_argument(
        "--max-train-chunks",
        type=int,
        default=DEFAULT_MAX_TRAIN_CHUNKS,
    )
    parser.add_argument(
        "--max-eval-chunks",
        type=int,
        default=DEFAULT_MAX_EVAL_CHUNKS,
    )
    parser.add_argument(
        "--max-replay-chunks",
        type=int,
        default=DEFAULT_MAX_REPLAY_CHUNKS,
    )
    parser.add_argument(
        "--max-retention-loss-degradation-percent",
        type=float,
        default=DEFAULT_MAX_RETENTION_DEGRADATION_PERCENT,
    )
    parser.add_argument(
        "--unfreeze-last-n",
        type=int,
        default=0,
        help=(
            "0 = train full MLM model. Positive N = train only final N transformer "
            "layers plus MLM head."
        ),
    )
    parser.add_argument("--max-length", type=int, default=None)
    parser.add_argument("--seed", type=int, default=DEFAULT_SEED)

    args = parser.parse_args()

    if args.epochs < 1:
        parser.error("--epochs must be >= 1")

    if args.batch_size < 1:
        parser.error("--batch-size must be >= 1")

    if args.gradient_accumulation < 1:
        parser.error("--gradient-accumulation must be >= 1")

    if not 0 < args.eval_ratio < 0.5:
        parser.error("--eval-ratio must be between 0 and 0.5")

    if not 0 < args.mlm_probability < 1:
        parser.error("--mlm-probability must be between 0 and 1")

    if args.replay_ratio < 0:
        parser.error("--replay-ratio must be >= 0")

    return args


# =========================================================
# MAIN
# =========================================================


def main():
    args = parse_arguments()

    print("🧠 Gyanivo Generic Domain Adaptation")
    print("Shared family/backbone foundation + real continual MLM training")

    jobs = ready_jobs()

    if not jobs:
        raise RuntimeError(
            "No READY curriculum jobs found. Add/register curriculum PDFs first."
        )

    selected_key, target_jobs, pool_jobs = choose_scope(
        jobs=jobs,
        class_level=args.class_level,
        subject=args.subject,
        backbone_key=args.backbone_key,
        family=args.family,
    )

    if not target_jobs:
        raise RuntimeError("No READY curriculum jobs matched the selected scope.")

    context = load_foundation_context(
        backbone_key=selected_key,
        pool_jobs=pool_jobs,
    )

    print_plan(
        context=context,
        target_jobs=target_jobs,
        pool_jobs=pool_jobs,
    )

    # Default behavior is plan-only unless --run is explicit.
    if not args.run:
        print("\nPLAN ONLY: no neural-network weights were changed.")
        print("Use --run only when new curriculum jobs are listed as TRAIN.")
        return

    run_adaptation(
        context=context,
        target_jobs=target_jobs,
        pool_jobs=pool_jobs,
        args=args,
    )


if __name__ == "__main__":
    main()