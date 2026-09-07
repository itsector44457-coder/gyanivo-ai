from __future__ import annotations

import json
import math
import random
import time
from pathlib import Path

import torch
from torch.nn import functional as F
from torch.utils.data import DataLoader, Dataset as TorchDataset
from transformers import (
    AutoModelForMaskedLM,
    AutoTokenizer,
)


# =========================================================
# CONFIG
# =========================================================

BASE_MODEL = "tbs17/MathBERT"

MAX_LENGTH = 256

MASK_PROBABILITY = 0.15

SEED = 42

EVAL_RATIO = 0.10

BATCH_SIZE = 2


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

SOURCE_DATASET = (
    ML_SERVICE_ROOT
    / "data"
    / "processed"
    / "ncert"
    / "class_7"
    / "mathematics"
    / "layout_dataset"
    / "pages_with_images.jsonl"
)

ADAPTED_MODEL = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_mathbert_class7"
    / "final"
)

OUTPUT_PATH = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_mathbert_class7"
    / "benchmark.json"
)


# =========================================================
# DEVICE
# =========================================================

def get_device() -> torch.device:

    if torch.cuda.is_available():
        return torch.device("cuda")

    if (
        hasattr(torch, "xpu")
        and torch.xpu.is_available()
    ):
        return torch.device("xpu")

    return torch.device("cpu")


# =========================================================
# VERIFY TRAINED MODEL
# =========================================================

def verify_adapted_model():

    if not ADAPTED_MODEL.exists():
        raise FileNotFoundError(
            f"Adapted model folder missing:\n{ADAPTED_MODEL}"
        )

    possible_weight_files = [
        ADAPTED_MODEL
        / "model.safetensors",

        ADAPTED_MODEL
        / "pytorch_model.bin",
    ]

    single_weight_found = any(
        file.exists()
        for file in possible_weight_files
    )

    sharded_weights = list(
        ADAPTED_MODEL.glob(
            "*.safetensors"
        )
    )

    if not (
        single_weight_found
        or sharded_weights
    ):
        print()
        print(
            "Files found inside adapted model:"
        )

        for file in ADAPTED_MODEL.iterdir():
            print(
                f"   {file.name}"
            )

        raise FileNotFoundError(
            (
                "No trained model weight file found "
                f"inside:\n{ADAPTED_MODEL}"
            )
        )

    print()
    print(
        "✅ Adapted model files detected:"
    )

    for file in sorted(
        ADAPTED_MODEL.iterdir()
    ):
        print(
            f"   {file.name}"
        )


# =========================================================
# LOAD REAL NCERT PAGES
# =========================================================

def load_pages() -> list[dict]:

    if not SOURCE_DATASET.exists():
        raise FileNotFoundError(
            f"Dataset not found:\n{SOURCE_DATASET}"
        )

    pages = []

    with SOURCE_DATASET.open(
        "r",
        encoding="utf-8",
    ) as file:

        for line_number, line in enumerate(
            file,
            start=1,
        ):

            line = line.strip()

            if not line:
                continue

            try:
                page = json.loads(
                    line
                )

            except json.JSONDecodeError as error:
                raise RuntimeError(
                    (
                        f"Invalid JSON on line "
                        f"{line_number}: {error}"
                    )
                )

            text = str(
                page.get(
                    "text",
                    ""
                )
            ).strip()

            if len(text) < 100:
                continue

            pages.append(
                {
                    "id":
                        page.get(
                            "id"
                        ),

                    "pdf":
                        page.get(
                            "pdf"
                        ),

                    "pageNumber":
                        page.get(
                            "pageNumber"
                        ),

                    "text":
                        text,
                }
            )

    return pages


# =========================================================
# SAME VALIDATION SPLIT AS TRAINING
# =========================================================

def get_eval_pages(
    pages: list[dict],
) -> list[dict]:

    shuffled = pages.copy()

    random.Random(
        SEED
    ).shuffle(
        shuffled
    )

    eval_count = max(
        1,
        int(
            round(
                len(shuffled)
                * EVAL_RATIO
            )
        ),
    )

    eval_count = min(
        eval_count,
        len(shuffled) - 1,
    )

    return shuffled[
        :eval_count
    ]


# =========================================================
# BUILD TOKEN CHUNKS
# =========================================================

def build_chunks(
    pages: list[dict],
    tokenizer,
) -> list[list[int]]:

    chunks = []

    cls_id = (
        tokenizer.cls_token_id
    )

    sep_id = (
        tokenizer.sep_token_id
    )

    if cls_id is None:
        raise RuntimeError(
            "Tokenizer CLS token missing."
        )

    if sep_id is None:
        raise RuntimeError(
            "Tokenizer SEP token missing."
        )

    content_length = (
        MAX_LENGTH - 2
    )

    for page in pages:

        encoded = tokenizer(
            page["text"],
            add_special_tokens=False,
            truncation=False,
            return_attention_mask=False,
            return_token_type_ids=False,
        )

        token_ids = encoded[
            "input_ids"
        ]

        for start in range(
            0,
            len(token_ids),
            content_length,
        ):

            chunk = token_ids[
                start:
                start + content_length
            ]

            if len(chunk) < 20:
                continue

            sequence = [
                cls_id,
                *chunk,
                sep_id,
            ]

            chunks.append(
                sequence
            )

    return chunks


# =========================================================
# FIXED MASKING
# =========================================================

def create_fixed_example(
    token_ids: list[int],
    tokenizer,
    seed: int,
) -> dict:

    """
    Deterministic BERT-style masking.

    Same sequence + same seed means both models
    receive exactly the same corrupted tokens.

    80% -> [MASK]
    10% -> random normal vocabulary token
    10% -> unchanged
    """

    rng = random.Random(
        seed
    )

    input_ids = (
        token_ids.copy()
    )

    labels = [
        -100
    ] * len(
        token_ids
    )

    special_ids = {
        token_id
        for token_id in [
            tokenizer.cls_token_id,
            tokenizer.sep_token_id,
            tokenizer.pad_token_id,
            tokenizer.mask_token_id,
        ]
        if token_id is not None
    }

    candidate_positions = [
        index
        for index, token_id
        in enumerate(
            token_ids
        )
        if token_id
        not in special_ids
    ]

    if not candidate_positions:
        raise RuntimeError(
            "No maskable tokens found."
        )

    selected_positions = [
        position
        for position
        in candidate_positions
        if rng.random()
        < MASK_PROBABILITY
    ]

    # Guarantee at least one target token.
    if not selected_positions:
        selected_positions = [
            rng.choice(
                candidate_positions
            )
        ]

    # Build valid random replacement IDs.
    valid_random_ids = [
        token_id
        for token_id
        in range(
            tokenizer.vocab_size
        )
        if token_id
        not in special_ids
    ]

    for position in selected_positions:

        original_token = (
            token_ids[
                position
            ]
        )

        labels[
            position
        ] = original_token

        probability = (
            rng.random()
        )

        # 80% -> [MASK]
        if probability < 0.80:

            if tokenizer.mask_token_id is None:
                raise RuntimeError(
                    "Tokenizer MASK token missing."
                )

            input_ids[
                position
            ] = (
                tokenizer.mask_token_id
            )

        # 10% -> random token
        elif probability < 0.90:

            input_ids[
                position
            ] = rng.choice(
                valid_random_ids
            )

        # Remaining 10%
        # original token remains unchanged.

    return {
        "input_ids":
            input_ids,

        "labels":
            labels,
    }


# =========================================================
# PYTORCH DATASET
# =========================================================

class FixedMLMDataset(
    TorchDataset
):

    def __init__(
        self,
        examples: list[dict],
    ):

        self.examples = (
            examples
        )

    def __len__(
        self,
    ):

        return len(
            self.examples
        )

    def __getitem__(
        self,
        index: int,
    ):

        return self.examples[
            index
        ]


# =========================================================
# COLLATE FUNCTION
# =========================================================

def make_collate_fn(
    tokenizer,
):

    if tokenizer.pad_token_id is None:
        raise RuntimeError(
            "Tokenizer PAD token missing."
        )

    def collate(
        batch: list[dict],
    ):

        max_length = max(
            len(
                item[
                    "input_ids"
                ]
            )
            for item
            in batch
        )

        input_batch = []

        attention_batch = []

        labels_batch = []

        token_type_batch = []

        for item in batch:

            input_ids = (
                item[
                    "input_ids"
                ]
            )

            labels = (
                item[
                    "labels"
                ]
            )

            padding_length = (
                max_length
                - len(
                    input_ids
                )
            )

            padded_inputs = (
                input_ids
                + [
                    tokenizer.pad_token_id
                ]
                * padding_length
            )

            attention_mask = (
                [1]
                * len(
                    input_ids
                )
                + [0]
                * padding_length
            )

            padded_labels = (
                labels
                + [-100]
                * padding_length
            )

            token_type_ids = (
                [0]
                * max_length
            )

            input_batch.append(
                padded_inputs
            )

            attention_batch.append(
                attention_mask
            )

            labels_batch.append(
                padded_labels
            )

            token_type_batch.append(
                token_type_ids
            )

        return {
            "input_ids":
                torch.tensor(
                    input_batch,
                    dtype=torch.long,
                ),

            "attention_mask":
                torch.tensor(
                    attention_batch,
                    dtype=torch.long,
                ),

            "token_type_ids":
                torch.tensor(
                    token_type_batch,
                    dtype=torch.long,
                ),

            "labels":
                torch.tensor(
                    labels_batch,
                    dtype=torch.long,
                ),
        }

    return collate


# =========================================================
# MODEL LOADING
# =========================================================

def load_model(
    model_source,
    model_name: str,
):

    print()
    print(
        f"📥 Loading {model_name}..."
    )

    print(
        f"Source: {model_source}"
    )

    # IMPORTANT:
    #
    # Do NOT force:
    #
    # use_safetensors=False
    #
    # The NCERT-trained model was saved as
    # model.safetensors.
    #
    # Transformers automatically chooses the available
    # compatible weight format.
    #

    model = (
        AutoModelForMaskedLM
        .from_pretrained(
            model_source
        )
    )

    print(
        f"✅ {model_name} loaded"
    )

    return model


# =========================================================
# EVALUATE ONE MODEL
# =========================================================

def evaluate_model(
    model_source,
    model_name: str,
    dataloader,
    device: torch.device,
) -> dict:

    print()
    print(
        "=" * 60
    )

    print(
        f"🧠 Evaluating: {model_name}"
    )

    print(
        "=" * 60
    )

    model = load_model(
        model_source=
            model_source,

        model_name=
            model_name,
    )

    model.to(
        device
    )

    model.eval()

    total_loss = 0.0

    total_masked_tokens = 0

    total_correct = 0

    total_top5_correct = 0

    start_time = (
        time.time()
    )

    with torch.inference_mode():

        for batch in dataloader:

            batch = {
                key:
                    value.to(
                        device
                    )
                for key, value
                in batch.items()
            }

            outputs = model(
                input_ids=
                    batch[
                        "input_ids"
                    ],

                attention_mask=
                    batch[
                        "attention_mask"
                    ],

                token_type_ids=
                    batch[
                        "token_type_ids"
                    ],
            )

            logits = (
                outputs.logits
            )

            labels = (
                batch[
                    "labels"
                ]
            )

            # =============================================
            # LOSS ONLY ON SELECTED MLM TARGETS
            # =============================================

            loss = F.cross_entropy(
                logits.reshape(
                    -1,
                    logits.size(
                        -1
                    ),
                ),

                labels.reshape(
                    -1
                ),

                ignore_index=-100,

                reduction="sum",
            )

            masked_positions = (
                labels != -100
            )

            masked_count = int(
                masked_positions
                .sum()
                .item()
            )

            predictions = (
                logits.argmax(
                    dim=-1
                )
            )

            correct = int(
                (
                    predictions[
                        masked_positions
                    ]
                    ==
                    labels[
                        masked_positions
                    ]
                )
                .sum()
                .item()
            )

            # =============================================
            # TOP-5 ACCURACY
            # =============================================

            masked_logits = (
                logits[
                    masked_positions
                ]
            )

            masked_labels = (
                labels[
                    masked_positions
                ]
            )

            top5_predictions = (
                masked_logits
                .topk(
                    k=5,
                    dim=-1,
                )
                .indices
            )

            top5_correct = int(
                (
                    top5_predictions
                    ==
                    masked_labels
                    .unsqueeze(
                        -1
                    )
                )
                .any(
                    dim=-1
                )
                .sum()
                .item()
            )

            total_loss += float(
                loss.item()
            )

            total_masked_tokens += (
                masked_count
            )

            total_correct += (
                correct
            )

            total_top5_correct += (
                top5_correct
            )

    elapsed_seconds = (
        time.time()
        - start_time
    )

    if total_masked_tokens == 0:
        raise RuntimeError(
            "No masked tokens evaluated."
        )

    average_loss = (
        total_loss
        / total_masked_tokens
    )

    accuracy = (
        total_correct
        / total_masked_tokens
    )

    top5_accuracy = (
        total_top5_correct
        / total_masked_tokens
    )

    try:

        perplexity = (
            math.exp(
                average_loss
            )
        )

    except OverflowError:

        perplexity = None

    print()
    print(
        f"📉 Loss: "
        f"{average_loss:.6f}"
    )

    print(
        f"🎯 Top-1 accuracy: "
        f"{accuracy * 100:.2f}%"
    )

    print(
        f"🎯 Top-5 accuracy: "
        f"{top5_accuracy * 100:.2f}%"
    )

    if perplexity is not None:

        print(
            f"📐 Perplexity: "
            f"{perplexity:.4f}"
        )

    print(
        f"🔤 Masked tokens: "
        f"{total_masked_tokens}"
    )

    print(
        f"⏱ Time: "
        f"{elapsed_seconds:.2f}s"
    )

    result = {
        "name":
            model_name,

        "loss":
            average_loss,

        "accuracy":
            accuracy,

        "top5Accuracy":
            top5_accuracy,

        "perplexity":
            perplexity,

        "maskedTokens":
            total_masked_tokens,

        "correctTokens":
            total_correct,

        "top5CorrectTokens":
            total_top5_correct,

        "elapsedSeconds":
            round(
                elapsed_seconds,
                2,
            ),
    }

    del model

    # Optional memory cleanup.
    if torch.cuda.is_available():
        torch.cuda.empty_cache()

    return result


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🔬 Gyanivo MathBERT Controlled Validation"
    )

    print(
        "Original MathBERT VS NCERT-adapted MathBERT"
    )

    print()

    device = get_device()

    print(
        f"⚙ Device: {device}"
    )

    # =====================================================
    # VERIFY TRAINED MODEL EXISTS
    # =====================================================

    verify_adapted_model()

    # =====================================================
    # TOKENIZER
    # =====================================================

    print()
    print(
        "📥 Loading tokenizer..."
    )

    tokenizer = (
        AutoTokenizer
        .from_pretrained(
            BASE_MODEL
        )
    )

    print(
        "✅ Tokenizer loaded"
    )

    # =====================================================
    # SAME NCERT VALIDATION PAGES
    # =====================================================

    pages = load_pages()

    eval_pages = (
        get_eval_pages(
            pages
        )
    )

    print()
    print(
        f"📚 Total usable pages: "
        f"{len(pages)}"
    )

    print(
        f"📗 Validation pages: "
        f"{len(eval_pages)}"
    )

    # =====================================================
    # TOKEN CHUNKS
    # =====================================================

    chunks = build_chunks(
        pages=
            eval_pages,

        tokenizer=
            tokenizer,
    )

    print(
        f"🧩 Validation chunks: "
        f"{len(chunks)}"
    )

    if not chunks:
        raise RuntimeError(
            "No validation chunks generated."
        )

    # =====================================================
    # CREATE MASKS ONCE
    # =====================================================

    fixed_examples = []

    for index, chunk in enumerate(
        chunks
    ):

        example = (
            create_fixed_example(
                token_ids=
                    chunk,

                tokenizer=
                    tokenizer,

                seed=
                    SEED
                    + index,
            )
        )

        fixed_examples.append(
            example
        )

    dataset = (
        FixedMLMDataset(
            fixed_examples
        )
    )

    dataloader = DataLoader(
        dataset,

        batch_size=
            BATCH_SIZE,

        shuffle=
            False,

        collate_fn=
            make_collate_fn(
                tokenizer
            ),
    )

    print()
    print(
        "🔒 FIXED MASKING READY"
    )

    print(
        "Both models receive the exact same:"
    )

    print(
        "   ✅ pages"
    )

    print(
        "   ✅ chunks"
    )

    print(
        "   ✅ masked positions"
    )

    print(
        "   ✅ corrupted input tokens"
    )

    print(
        "   ✅ expected target tokens"
    )

    # =====================================================
    # ORIGINAL MODEL
    # =====================================================

    base_result = (
        evaluate_model(
            model_source=
                BASE_MODEL,

            model_name=
                "Original MathBERT",

            dataloader=
                dataloader,

            device=
                device,
        )
    )

    # =====================================================
    # NCERT MODEL
    # =====================================================

    adapted_result = (
        evaluate_model(
            model_source=
                str(
                    ADAPTED_MODEL
                ),

            model_name=
                "NCERT-adapted MathBERT",

            dataloader=
                dataloader,

            device=
                device,
        )
    )

    # =====================================================
    # COMPARE
    # =====================================================

    loss_improvement = (
        base_result[
            "loss"
        ]
        -
        adapted_result[
            "loss"
        ]
    )

    relative_loss_improvement = (
        (
            loss_improvement
            /
            base_result[
                "loss"
            ]
        )
        * 100
    )

    accuracy_improvement = (
        adapted_result[
            "accuracy"
        ]
        -
        base_result[
            "accuracy"
        ]
    )

    top5_improvement = (
        adapted_result[
            "top5Accuracy"
        ]
        -
        base_result[
            "top5Accuracy"
        ]
    )

    loss_better = (
        adapted_result[
            "loss"
        ]
        <
        base_result[
            "loss"
        ]
    )

    accuracy_better = (
        adapted_result[
            "accuracy"
        ]
        >
        base_result[
            "accuracy"
        ]
    )

    adapted_better = (
        loss_better
        and accuracy_better
    )

    # =====================================================
    # SAVE RESULT
    # =====================================================

    result = {
        "benchmarkType":
            "FIXED_MASK_NCERT_VALIDATION",

        "importantNote":
            (
                "These pages were held out from gradient "
                "updates but were used as the validation "
                "split during training. This is a validation "
                "A/B comparison, not a final independent "
                "generalization test."
            ),

        "source":
            "Official NCERT Class 7 Mathematics",

        "totalUsablePages":
            len(
                pages
            ),

        "validationPages":
            len(
                eval_pages
            ),

        "validationChunks":
            len(
                chunks
            ),

        "maskProbability":
            MASK_PROBABILITY,

        "baseModel":
            base_result,

        "adaptedModel":
            adapted_result,

        "lossImprovement":
            loss_improvement,

        "relativeLossImprovementPercent":
            relative_loss_improvement,

        "accuracyImprovement":
            accuracy_improvement,

        "accuracyImprovementPercentagePoints":
            accuracy_improvement
            * 100,

        "top5AccuracyImprovementPercentagePoints":
            top5_improvement
            * 100,

        "lossBetter":
            loss_better,

        "accuracyBetter":
            accuracy_better,

        "adaptedModelBetter":
            adapted_better,
    }

    OUTPUT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    OUTPUT_PATH.write_text(
        json.dumps(
            result,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # FINAL RESULT
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "📊 CONTROLLED VALIDATION RESULT"
    )

    print(
        "=" * 72
    )

    print()

    print(
        "ORIGINAL MATHBERT"
    )

    print(
        f"Loss: "
        f"{base_result['loss']:.6f}"
    )

    print(
        f"Top-1 Accuracy: "
        f"{base_result['accuracy'] * 100:.2f}%"
    )

    print(
        f"Top-5 Accuracy: "
        f"{base_result['top5Accuracy'] * 100:.2f}%"
    )

    print()

    print(
        "NCERT-ADAPTED MATHBERT"
    )

    print(
        f"Loss: "
        f"{adapted_result['loss']:.6f}"
    )

    print(
        f"Top-1 Accuracy: "
        f"{adapted_result['accuracy'] * 100:.2f}%"
    )

    print(
        f"Top-5 Accuracy: "
        f"{adapted_result['top5Accuracy'] * 100:.2f}%"
    )

    print()

    print(
        "IMPROVEMENT"
    )

    print(
        f"Loss improvement: "
        f"{loss_improvement:.6f}"
    )

    print(
        f"Relative loss improvement: "
        f"{relative_loss_improvement:.2f}%"
    )

    print(
        f"Top-1 accuracy improvement: "
        f"{accuracy_improvement * 100:.2f} "
        f"percentage points"
    )

    print(
        f"Top-5 accuracy improvement: "
        f"{top5_improvement * 100:.2f} "
        f"percentage points"
    )

    print()

    print(
        f"Loss better: "
        f"{loss_better}"
    )

    print(
        f"Accuracy better: "
        f"{accuracy_better}"
    )

    print(
        f"Adapted model better: "
        f"{adapted_better}"
    )

    print()

    print(
        "NOTE:"
    )

    print(
        (
            "This is a validation comparison. "
            "The model received no gradient updates "
            "from these pages, but this split was used "
            "for validation during training. Later we "
            "will make a completely independent test set."
        )
    )

    print()

    print(
        f"💾 Result:\n{OUTPUT_PATH}"
    )

    print(
        "=" * 72
    )


if __name__ == "__main__":
    main()