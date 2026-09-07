from __future__ import annotations

import inspect
import json
import math
import random
import time
from pathlib import Path

import torch
import transformers
from datasets import Dataset
from transformers import (
    AutoModelForMaskedLM,
    AutoTokenizer,
    DataCollatorForLanguageModeling,
    Trainer,
    TrainingArguments,
)


# =========================================================
# CONFIG
# =========================================================

BASE_MODEL = "tbs17/MathBERT"

MAX_LENGTH = 256

MLM_PROBABILITY = 0.15

TRAIN_EPOCHS = 1

LEARNING_RATE = 2e-5

TRAIN_BATCH_SIZE = 2

EVAL_BATCH_SIZE = 2

GRADIENT_ACCUMULATION_STEPS = 4

WEIGHT_DECAY = 0.01

EVAL_RATIO = 0.10

SEED = 42


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

MODEL_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "ncert_mathbert_class7"
)

CHECKPOINT_ROOT = (
    MODEL_ROOT
    / "checkpoints"
)

FINAL_MODEL_ROOT = (
    MODEL_ROOT
    / "final"
)

SUMMARY_PATH = (
    MODEL_ROOT
    / "training_summary.json"
)

ARGS_PATH = (
    MODEL_ROOT
    / "training_arguments_used.json"
)


# =========================================================
# DEVICE
# =========================================================

def get_device_name() -> str:

    if torch.cuda.is_available():
        return "cuda"

    if (
        hasattr(torch, "xpu")
        and torch.xpu.is_available()
    ):
        return "xpu"

    return "cpu"


# =========================================================
# LOAD REAL NCERT PAGES
# =========================================================

def load_ncert_pages() -> list[dict]:

    if not SOURCE_DATASET.exists():

        raise FileNotFoundError(
            (
                "NCERT dataset not found:\n"
                f"{SOURCE_DATASET}"
            )
        )

    pages: list[dict] = []

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
                        f"Invalid JSON at line "
                        f"{line_number}: {error}"
                    )
                )

            text = str(
                page.get(
                    "text",
                    ""
                )
            ).strip()

            # Ignore almost-empty pages.
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
# TRAIN / EVAL SPLIT AT PAGE LEVEL
# =========================================================

def split_pages(
    pages: list[dict],
) -> tuple[list[dict], list[dict]]:

    """
    Split BEFORE chunking.

    This avoids chunks from the exact same page appearing
    in both train and evaluation data.
    """

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

    # Always leave training data.
    eval_count = min(
        eval_count,
        len(shuffled) - 1,
    )

    eval_pages = shuffled[
        :eval_count
    ]

    train_pages = shuffled[
        eval_count:
    ]

    return (
        train_pages,
        eval_pages,
    )


# =========================================================
# BUILD MLM TOKEN CHUNKS
# =========================================================

def build_token_chunks(
    pages: list[dict],
    tokenizer,
) -> list[dict]:

    examples: list[dict] = []

    cls_token_id = (
        tokenizer.cls_token_id
    )

    sep_token_id = (
        tokenizer.sep_token_id
    )

    if cls_token_id is None:

        raise RuntimeError(
            "Tokenizer does not have CLS token."
        )

    if sep_token_id is None:

        raise RuntimeError(
            "Tokenizer does not have SEP token."
        )

    # [CLS] + content + [SEP]
    content_length = (
        MAX_LENGTH - 2
    )

    for page in pages:

        text = str(
            page.get(
                "text",
                ""
            )
        ).strip()

        if not text:
            continue

        encoded = tokenizer(
            text,
            add_special_tokens=False,
            truncation=False,
            return_attention_mask=False,
            return_token_type_ids=False,
        )

        token_ids = encoded[
            "input_ids"
        ]

        if not token_ids:
            continue

        for start in range(
            0,
            len(token_ids),
            content_length,
        ):

            chunk = token_ids[
                start:
                start + content_length
            ]

            # Don't train on tiny leftovers.
            if len(chunk) < 20:
                continue

            input_ids = [
                cls_token_id,
                *chunk,
                sep_token_id,
            ]

            attention_mask = [
                1
            ] * len(
                input_ids
            )

            token_type_ids = [
                0
            ] * len(
                input_ids
            )

            examples.append(
                {
                    "input_ids":
                        input_ids,

                    "attention_mask":
                        attention_mask,

                    "token_type_ids":
                        token_type_ids,
                }
            )

    return examples


# =========================================================
# PARAMETER TRACKING
# =========================================================

def get_tracked_parameter(
    model,
):

    for name, parameter in (
        model.named_parameters()
    ):

        if (
            parameter.requires_grad
            and parameter.ndim >= 2
        ):

            return (
                name,
                parameter,
            )

    raise RuntimeError(
        "No trainable model parameter found."
    )


# =========================================================
# DATA COLLATOR
# =========================================================

def build_data_collator(
    tokenizer,
):

    """
    Build MLM collator while staying compatible with
    different Transformers versions.
    """

    parameters = inspect.signature(
        DataCollatorForLanguageModeling.__init__
    ).parameters

    kwargs = {
        "tokenizer":
            tokenizer,

        "mlm":
            True,

        "mlm_probability":
            MLM_PROBABILITY,
    }

    # Newer Transformers supports an explicit seed.
    if "seed" in parameters:

        kwargs[
            "seed"
        ] = SEED

    return DataCollatorForLanguageModeling(
        **kwargs
    )


# =========================================================
# TRAINING ARGUMENTS — VERSION SAFE
# =========================================================

def build_training_arguments(
    run_output_dir: Path,
    train_example_count: int,
):

    """
    Different Transformers versions expose slightly
    different TrainingArguments names.

    We inspect the installed version and only send
    supported arguments.
    """

    parameters = inspect.signature(
        TrainingArguments.__init__
    ).parameters

    kwargs = {}

    # -----------------------------------------------------
    # REQUIRED / COMMON
    # -----------------------------------------------------

    kwargs[
        "output_dir"
    ] = str(
        run_output_dir
    )

    kwargs[
        "num_train_epochs"
    ] = TRAIN_EPOCHS

    kwargs[
        "learning_rate"
    ] = LEARNING_RATE

    kwargs[
        "per_device_train_batch_size"
    ] = TRAIN_BATCH_SIZE

    kwargs[
        "per_device_eval_batch_size"
    ] = EVAL_BATCH_SIZE

    kwargs[
        "gradient_accumulation_steps"
    ] = (
        GRADIENT_ACCUMULATION_STEPS
    )

    kwargs[
        "weight_decay"
    ] = WEIGHT_DECAY

    # -----------------------------------------------------
    # ESTIMATE OPTIMIZER STEPS
    # -----------------------------------------------------

    batches_per_epoch = math.ceil(
        train_example_count
        / TRAIN_BATCH_SIZE
    )

    optimizer_steps_per_epoch = (
        math.ceil(
            batches_per_epoch
            / GRADIENT_ACCUMULATION_STEPS
        )
    )

    total_optimizer_steps = max(
        1,
        int(
            optimizer_steps_per_epoch
            * TRAIN_EPOCHS
        ),
    )

    # -----------------------------------------------------
    # WARMUP
    # -----------------------------------------------------

    if "warmup_ratio" in parameters:

        kwargs[
            "warmup_ratio"
        ] = 0.05

    elif "warmup_steps" in parameters:

        kwargs[
            "warmup_steps"
        ] = max(
            1,
            int(
                total_optimizer_steps
                * 0.05
            ),
        )

    # -----------------------------------------------------
    # EVALUATION STRATEGY
    # -----------------------------------------------------

    evaluation_enabled = False

    if "eval_strategy" in parameters:

        kwargs[
            "eval_strategy"
        ] = "epoch"

        evaluation_enabled = True

    elif (
        "evaluation_strategy"
        in parameters
    ):

        kwargs[
            "evaluation_strategy"
        ] = "epoch"

        evaluation_enabled = True

    # -----------------------------------------------------
    # SAVE STRATEGY
    # -----------------------------------------------------

    save_strategy_enabled = False

    if "save_strategy" in parameters:

        kwargs[
            "save_strategy"
        ] = "epoch"

        save_strategy_enabled = True

    # -----------------------------------------------------
    # CHECKPOINT LIMIT
    # -----------------------------------------------------

    if "save_total_limit" in parameters:

        kwargs[
            "save_total_limit"
        ] = 2

    # -----------------------------------------------------
    # LOGGING
    # -----------------------------------------------------

    if "logging_strategy" in parameters:

        kwargs[
            "logging_strategy"
        ] = "steps"

    if "logging_steps" in parameters:

        kwargs[
            "logging_steps"
        ] = 10

    if "logging_first_step" in parameters:

        kwargs[
            "logging_first_step"
        ] = True

    # -----------------------------------------------------
    # BEST MODEL
    # -----------------------------------------------------

    if (
        evaluation_enabled
        and save_strategy_enabled
        and "load_best_model_at_end"
        in parameters
    ):

        kwargs[
            "load_best_model_at_end"
        ] = True

        if (
            "metric_for_best_model"
            in parameters
        ):

            kwargs[
                "metric_for_best_model"
            ] = "eval_loss"

        if (
            "greater_is_better"
            in parameters
        ):

            kwargs[
                "greater_is_better"
            ] = False

    # -----------------------------------------------------
    # OPTIMIZER
    # -----------------------------------------------------

    if "optim" in parameters:

        kwargs[
            "optim"
        ] = "adamw_torch"

    # -----------------------------------------------------
    # PRECISION
    # -----------------------------------------------------

    if "fp16" in parameters:

        kwargs[
            "fp16"
        ] = False

    if "bf16" in parameters:

        kwargs[
            "bf16"
        ] = False

    # -----------------------------------------------------
    # CPU MODE
    # -----------------------------------------------------

    # Current laptop has no CUDA NVIDIA GPU.
    if "use_cpu" in parameters:

        kwargs[
            "use_cpu"
        ] = True

    elif "no_cuda" in parameters:

        kwargs[
            "no_cuda"
        ] = True

    # -----------------------------------------------------
    # OTHER SAFE OPTIONS
    # -----------------------------------------------------

    if (
        "dataloader_pin_memory"
        in parameters
    ):

        kwargs[
            "dataloader_pin_memory"
        ] = False

    if "report_to" in parameters:

        kwargs[
            "report_to"
        ] = "none"

    if "seed" in parameters:

        kwargs[
            "seed"
        ] = SEED

    if "data_seed" in parameters:

        kwargs[
            "data_seed"
        ] = SEED

    if (
        "remove_unused_columns"
        in parameters
    ):

        kwargs[
            "remove_unused_columns"
        ] = True

    print()
    print(
        "⚙ Compatible TrainingArguments:"
    )

    for key, value in kwargs.items():

        print(
            f"   {key} = {value}"
        )

    return (
        TrainingArguments(
            **kwargs
        ),
        kwargs,
    )


# =========================================================
# VERSION-SAFE TRAINER
# =========================================================

def build_trainer(
    model,
    training_args,
    train_dataset,
    eval_dataset,
    data_collator,
    tokenizer,
):

    parameters = inspect.signature(
        Trainer.__init__
    ).parameters

    kwargs = {
        "model":
            model,

        "args":
            training_args,

        "train_dataset":
            train_dataset,

        "eval_dataset":
            eval_dataset,

        "data_collator":
            data_collator,
    }

    # New Transformers API.
    if (
        "processing_class"
        in parameters
    ):

        kwargs[
            "processing_class"
        ] = tokenizer

    # Older Transformers API.
    elif "tokenizer" in parameters:

        kwargs[
            "tokenizer"
        ] = tokenizer

    return Trainer(
        **kwargs
    )


# =========================================================
# MAIN
# =========================================================

def main():

    print(
        "🧠 Gyanivo NCERT MathBERT "
        "Domain Training"
    )

    print(
        "REAL NCERT self-supervised learning"
    )

    print()

    print(
        f"🤗 Transformers: "
        f"{transformers.__version__}"
    )

    print(
        f"🔥 PyTorch: "
        f"{torch.__version__}"
    )

    device_name = (
        get_device_name()
    )

    print(
        f"⚙ Device: {device_name}"
    )

    print()

    print(
        f"📄 Source:\n{SOURCE_DATASET}"
    )

    # =====================================================
    # LOAD REAL NCERT
    # =====================================================

    print()
    print(
        "📚 Loading real NCERT pages..."
    )

    pages = (
        load_ncert_pages()
    )

    print(
        f"✅ Usable pages: {len(pages)}"
    )

    if len(pages) < 20:

        raise RuntimeError(
            "Not enough usable NCERT pages."
        )

    # =====================================================
    # PAGE-LEVEL SPLIT
    # =====================================================

    (
        train_pages,
        eval_pages,
    ) = split_pages(
        pages
    )

    print()
    print(
        "📑 PAGE-LEVEL SPLIT"
    )

    print(
        f"📘 Train pages: "
        f"{len(train_pages)}"
    )

    print(
        f"📗 Eval pages: "
        f"{len(eval_pages)}"
    )

    # =====================================================
    # LOAD TOKENIZER
    # =====================================================

    print()
    print(
        "📥 Loading MathBERT tokenizer..."
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
    # CREATE REAL MLM CHUNKS
    # =====================================================

    print()
    print(
        "🔨 Building training chunks..."
    )

    train_examples = (
        build_token_chunks(
            pages=train_pages,
            tokenizer=tokenizer,
        )
    )

    print(
        "🔨 Building evaluation chunks..."
    )

    eval_examples = (
        build_token_chunks(
            pages=eval_pages,
            tokenizer=tokenizer,
        )
    )

    print()
    print(
        f"📘 Train chunks: "
        f"{len(train_examples)}"
    )

    print(
        f"📗 Eval chunks: "
        f"{len(eval_examples)}"
    )

    print(
        f"🧩 Total chunks: "
        f"{len(train_examples) + len(eval_examples)}"
    )

    if len(train_examples) < 20:

        raise RuntimeError(
            "Too few training chunks."
        )

    if not eval_examples:

        raise RuntimeError(
            "No evaluation chunks generated."
        )

    train_dataset = (
        Dataset.from_list(
            train_examples
        )
    )

    eval_dataset = (
        Dataset.from_list(
            eval_examples
        )
    )

    # =====================================================
    # LOAD MATHBERT
    # =====================================================

    print()
    print(
        "📥 Loading pretrained MathBERT..."
    )

    # Force PyTorch .bin checkpoint because it has already
    # been downloaded on this machine. This also avoids an
    # unnecessary second safetensors download if the Hub
    # repository exposes both formats.
    model = (
        AutoModelForMaskedLM
        .from_pretrained(
            BASE_MODEL,
            use_safetensors=False,
        )
    )

    print(
        "✅ MathBERT loaded"
    )

    total_parameters = sum(
        parameter.numel()
        for parameter
        in model.parameters()
    )

    trainable_parameters = sum(
        parameter.numel()
        for parameter
        in model.parameters()
        if parameter.requires_grad
    )

    print(
        f"🧠 Total parameters: "
        f"{total_parameters:,}"
    )

    print(
        f"🎯 Trainable parameters: "
        f"{trainable_parameters:,}"
    )

    # =====================================================
    # TRACK WEIGHT CHANGES
    # =====================================================

    (
        tracked_name,
        tracked_parameter,
    ) = (
        get_tracked_parameter(
            model
        )
    )

    rows = min(
        64,
        tracked_parameter.shape[0],
    )

    cols = min(
        64,
        tracked_parameter.shape[1],
    )

    before_training = (
        tracked_parameter[
            :rows,
            :cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    print()
    print(
        "🔬 Tracking model parameter:"
    )

    print(
        f"   {tracked_name}"
    )

    # =====================================================
    # MLM COLLATOR
    # =====================================================

    data_collator = (
        build_data_collator(
            tokenizer
        )
    )

    # =====================================================
    # CREATE UNIQUE TRAINING RUN
    # =====================================================

    run_id = time.strftime(
        "%Y%m%d_%H%M%S"
    )

    run_output_dir = (
        CHECKPOINT_ROOT
        / run_id
    )

    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    run_output_dir.mkdir(
        parents=True,
        exist_ok=True,
    )

    # =====================================================
    # TRAINING ARGUMENTS
    # =====================================================

    (
        training_args,
        training_kwargs,
    ) = build_training_arguments(
        run_output_dir=
            run_output_dir,

        train_example_count=
            len(
                train_examples
            ),
    )

    # Save arguments we actually used.
    serializable_args = {
        key:
            (
                value
                if isinstance(
                    value,
                    (
                        str,
                        int,
                        float,
                        bool,
                        type(None),
                    ),
                )
                else str(
                    value
                )
            )
        for key, value
        in training_kwargs.items()
    }

    ARGS_PATH.write_text(
        json.dumps(
            {
                "transformersVersion":
                    transformers.__version__,

                "arguments":
                    serializable_args,
            },
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # TRAINER
    # =====================================================

    trainer = build_trainer(
        model=model,

        training_args=
            training_args,

        train_dataset=
            train_dataset,

        eval_dataset=
            eval_dataset,

        data_collator=
            data_collator,

        tokenizer=
            tokenizer,
    )

    # =====================================================
    # ACTUAL SELF-SUPERVISED TRAINING
    # =====================================================

    print()
    print(
        "=" * 70
    )

    print(
        "🚀 REAL NCERT MODEL TRAINING STARTING"
    )

    print(
        "Dataset: Official NCERT Class 7 Mathematics"
    )

    print(
        "Learning method: Masked Language Modelling"
    )

    print(
        f"Automatic masking: "
        f"{MLM_PROBABILITY * 100:.0f}%"
    )

    print(
        "Manual answer labels: NO"
    )

    print(
        "Backpropagation: YES"
    )

    print(
        "Model weights will update: YES"
    )

    print(
        "=" * 70
    )

    print()

    start_time = time.time()

    train_result = (
        trainer.train()
    )

    elapsed_seconds = (
        time.time()
        - start_time
    )

    # =====================================================
    # EVALUATION
    # =====================================================

    print()
    print(
        "📊 Running final evaluation..."
    )

    evaluation = (
        trainer.evaluate()
    )

    if (
        "eval_loss"
        not in evaluation
    ):

        raise RuntimeError(
            (
                "Trainer evaluation did not "
                "return eval_loss."
            )
        )

    eval_loss = float(
        evaluation[
            "eval_loss"
        ]
    )

    train_loss = float(
        train_result.training_loss
    )

    try:

        mlm_perplexity = float(
            math.exp(
                eval_loss
            )
        )

    except OverflowError:

        mlm_perplexity = None

    # =====================================================
    # VERIFY REAL WEIGHT CHANGE
    # =====================================================

    current_parameters = dict(
        model.named_parameters()
    )

    if (
        tracked_name
        not in current_parameters
    ):

        raise RuntimeError(
            (
                "Tracked model parameter disappeared "
                "after training."
            )
        )

    after_training = (
        current_parameters[
            tracked_name
        ][
            :rows,
            :cols
        ]
        .detach()
        .cpu()
        .clone()
    )

    absolute_difference = (
        after_training
        - before_training
    ).abs()

    mean_weight_change = float(
        absolute_difference
        .mean()
        .item()
    )

    max_weight_change = float(
        absolute_difference
        .max()
        .item()
    )

    changed_values = int(
        (
            absolute_difference
            > 0
        )
        .sum()
        .item()
    )

    total_tracked_values = int(
        absolute_difference
        .numel()
    )

    weights_changed = (
        changed_values > 0
    )

    # =====================================================
    # SAVE FINAL ADAPTED MODEL
    # =====================================================

    print()
    print(
        "💾 Saving NCERT-adapted MathBERT..."
    )

    FINAL_MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    trainer.save_model(
        str(
            FINAL_MODEL_ROOT
        )
    )

    tokenizer.save_pretrained(
        str(
            FINAL_MODEL_ROOT
        )
    )

    print(
        "✅ Adapted model saved"
    )

    # =====================================================
    # SUMMARY
    # =====================================================

    total_chunks = (
        len(
            train_examples
        )
        + len(
            eval_examples
        )
    )

    summary = {
        "trainingType":
            "SELF_SUPERVISED_DOMAIN_ADAPTATION",

        "task":
            "MASKED_LANGUAGE_MODELING",

        "dataSource":
            "Official NCERT Class 7 Mathematics",

        "baseModel":
            BASE_MODEL,

        "transformersVersion":
            transformers.__version__,

        "pytorchVersion":
            torch.__version__,

        "device":
            device_name,

        "usablePages":
            len(
                pages
            ),

        "trainPages":
            len(
                train_pages
            ),

        "evalPages":
            len(
                eval_pages
            ),

        "totalChunks":
            total_chunks,

        "trainChunks":
            len(
                train_examples
            ),

        "evalChunks":
            len(
                eval_examples
            ),

        "maxLength":
            MAX_LENGTH,

        "mlmProbability":
            MLM_PROBABILITY,

        "epochs":
            TRAIN_EPOCHS,

        "learningRate":
            LEARNING_RATE,

        "trainBatchSize":
            TRAIN_BATCH_SIZE,

        "evalBatchSize":
            EVAL_BATCH_SIZE,

        "gradientAccumulationSteps":
            GRADIENT_ACCUMULATION_STEPS,

        "trainLoss":
            train_loss,

        "evalLoss":
            eval_loss,

        "mlmPerplexityDiagnostic":
            mlm_perplexity,

        "totalModelParameters":
            total_parameters,

        "trainableParameters":
            trainable_parameters,

        "trackedParameter":
            tracked_name,

        "trackedValues":
            total_tracked_values,

        "changedTrackedValues":
            changed_values,

        "meanWeightChange":
            mean_weight_change,

        "maxWeightChange":
            max_weight_change,

        "weightsChanged":
            weights_changed,

        "elapsedSeconds":
            round(
                elapsed_seconds,
                2,
            ),

        "runId":
            run_id,

        "checkpointPath":
            str(
                run_output_dir.relative_to(
                    ML_SERVICE_ROOT
                )
            ),

        "modelPath":
            str(
                FINAL_MODEL_ROOT.relative_to(
                    ML_SERVICE_ROOT
                )
            ),
    }

    SUMMARY_PATH.write_text(
        json.dumps(
            summary,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # FINAL OUTPUT
    # =====================================================

    print()
    print(
        "=" * 70
    )

    print(
        "✅ REAL NCERT MATHBERT TRAINING COMPLETE"
    )

    print(
        "=" * 70
    )

    print(
        f"📚 Usable NCERT pages: "
        f"{len(pages)}"
    )

    print(
        f"📘 Train pages: "
        f"{len(train_pages)}"
    )

    print(
        f"📗 Eval pages: "
        f"{len(eval_pages)}"
    )

    print(
        f"🧩 Total chunks: "
        f"{total_chunks}"
    )

    print(
        f"📘 Train chunks: "
        f"{len(train_examples)}"
    )

    print(
        f"📗 Eval chunks: "
        f"{len(eval_examples)}"
    )

    print()

    print(
        f"📉 Train loss: "
        f"{train_loss:.6f}"
    )

    print(
        f"📊 Eval loss: "
        f"{eval_loss:.6f}"
    )

    if mlm_perplexity is not None:

        print(
            f"📐 MLM perplexity diagnostic: "
            f"{mlm_perplexity:.4f}"
        )

    print()
    print(
        "🧬 MODEL WEIGHT UPDATE CHECK"
    )

    print(
        f"Tracked parameter: "
        f"{tracked_name}"
    )

    print(
        f"Tracked values: "
        f"{total_tracked_values}"
    )

    print(
        f"Changed values: "
        f"{changed_values}"
    )

    print(
        f"Mean change: "
        f"{mean_weight_change:.12f}"
    )

    print(
        f"Max change: "
        f"{max_weight_change:.12f}"
    )

    print(
        f"Weights changed: "
        f"{weights_changed}"
    )

    print()
    print(
        f"⏱ Training time: "
        f"{elapsed_seconds / 60:.2f} minutes"
    )

    print()

    print(
        "💾 FINAL MODEL:"
    )

    print(
        FINAL_MODEL_ROOT
    )

    print()

    print(
        "📄 TRAINING SUMMARY:"
    )

    print(
        SUMMARY_PATH
    )

    print(
        "=" * 70
    )

    if not weights_changed:

        raise RuntimeError(
            (
                "Training finished but tracked "
                "weights did not change."
            )
        )


if __name__ == "__main__":
    main()