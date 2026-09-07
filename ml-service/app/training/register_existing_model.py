from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from app.training.training_registry import (
    get_training_plan,
)


# =========================================================
# ROOT
# =========================================================

ROOT = Path(__file__).resolve().parents[2]


# =========================================================
# HELPERS
# =========================================================

def relative_path(
    path: Path,
) -> str:

    try:

        return str(
            path.resolve().relative_to(
                ROOT.resolve()
            )
        )

    except ValueError:

        return str(
            path.resolve()
        )


def verify_model_directory(
    model_directory: Path,
):

    if not model_directory.exists():

        raise FileNotFoundError(
            (
                "Model directory not found:\n"
                f"{model_directory}"
            )
        )

    if not model_directory.is_dir():

        raise RuntimeError(
            (
                "Model path must be directory:\n"
                f"{model_directory}"
            )
        )

    config = (
        model_directory
        / "config.json"
    )

    if not config.exists():

        raise RuntimeError(
            (
                "config.json not found inside model:\n"
                f"{model_directory}"
            )
        )

    weight_candidates = [

        model_directory
        / "model.safetensors",

        model_directory
        / "pytorch_model.bin",
    ]

    sharded = list(
        model_directory.glob(
            "*.safetensors"
        )
    )

    weight_exists = (
        any(
            path.exists()
            for path
            in weight_candidates
        )
        or bool(
            sharded
        )
    )

    if not weight_exists:

        raise RuntimeError(
            (
                "No model weights found inside:\n"
                f"{model_directory}"
            )
        )


# =========================================================
# LOAD OPTIONAL BENCHMARK
# =========================================================

def load_benchmark(
    benchmark_path: Path | None,
) -> dict | None:

    if benchmark_path is None:

        return None

    if not benchmark_path.exists():

        raise FileNotFoundError(
            (
                "Benchmark file not found:\n"
                f"{benchmark_path}"
            )
        )

    try:

        return json.loads(
            benchmark_path.read_text(
                encoding="utf-8"
            )
        )

    except json.JSONDecodeError as error:

        raise RuntimeError(
            (
                "Invalid benchmark JSON:\n"
                f"{benchmark_path}\n"
                f"{error}"
            )
        )


# =========================================================
# REGISTER
# =========================================================

def register_existing_model(
    class_level: int,
    subject: str,
    stage: str,
    model_directory: Path,
    benchmark_path: Path | None,
):

    # =====================================================
    # TRAINING PLAN
    # =====================================================

    plan = get_training_plan(
        class_level=
            class_level,

        subject=
            subject,
    )

    if (
        stage
        not in plan.curriculum_training_stages
    ):

        raise ValueError(
            (
                f"Stage '{stage}' is not registered "
                "for this curriculum pipeline."
            )
        )

    # =====================================================
    # MODEL VERIFY
    # =====================================================

    model_directory = (
        model_directory.resolve()
    )

    verify_model_directory(
        model_directory
    )

    # =====================================================
    # BENCHMARK
    # =====================================================

    benchmark = load_benchmark(
        benchmark_path
    )

    # =====================================================
    # UNIVERSAL OUTPUT LOCATION
    # =====================================================

    universal_model_root = Path(
        plan.model_output_path
    )

    stage_root = (
        universal_model_root
        / "stages"
        / stage
    )

    stage_root.mkdir(
        parents=True,
        exist_ok=True,
    )

    manifest_path = (
        stage_root
        / "stage_manifest.json"
    )

    # =====================================================
    # BENCHMARK SUMMARY
    # =====================================================

    benchmark_summary = None

    if benchmark is not None:

        base_result = (
            benchmark.get(
                "baseModel",
                {}
            )
        )

        adapted_result = (
            benchmark.get(
                "adaptedModel",
                {}
            )
        )

        benchmark_summary = {

            "baseLoss":
                base_result.get(
                    "loss"
                ),

            "adaptedLoss":
                adapted_result.get(
                    "loss"
                ),

            "baseAccuracy":
                base_result.get(
                    "accuracy"
                ),

            "adaptedAccuracy":
                adapted_result.get(
                    "accuracy"
                ),

            "lossImprovement":
                benchmark.get(
                    "lossImprovement"
                ),

            "relativeLossImprovementPercent":
                benchmark.get(
                    "relativeLossImprovementPercent"
                ),

            "accuracyImprovementPercentagePoints":
                benchmark.get(
                    "accuracyImprovementPercentagePoints"
                ),

            "adaptedModelBetter":
                benchmark.get(
                    "adaptedModelBetter"
                ),
        }

    # =====================================================
    # STAGE MANIFEST
    # =====================================================

    manifest = {

        "schemaVersion":
            1,

        "registeredAtUTC":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "registrationType":
            "EXISTING_REAL_TRAINED_MODEL",

        "stageStatus":
            "COMPLETED",

        "classLevel":
            class_level,

        "subject":
            plan.canonical_subject,

        "subjectFamily":
            plan.subject_family,

        "specialization":
            plan.specialization_name,

        "trainingStage":
            stage,

        "backboneKey":
            plan.backbone_key,

        "baseBackbone":
            plan.backbone_model,

        "adapterStrategy":
            plan.adapter_strategy,

        "trainedModelReference":
            relative_path(
                model_directory
            ),

        "absoluteTrainedModelReference":
            str(
                model_directory
            ),

        "modelCopied":
            False,

        "realTraining":
            True,

        "benchmarkAvailable":
            benchmark
            is not None,

        "benchmarkFile":
            (
                relative_path(
                    benchmark_path
                )
                if benchmark_path
                is not None
                else None
            ),

        "benchmarkSummary":
            benchmark_summary,

        "importantNote":
            (
                "This model was trained before the "
                "universal orchestration layer was introduced. "
                "The universal registry references the existing "
                "trained weights instead of retraining or "
                "duplicating them."
            ),
    }

    manifest_path.write_text(
        json.dumps(
            manifest,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # CLASS MODEL STATUS
    # =====================================================

    status_path = (
        universal_model_root
        / "model_status.json"
    )

    existing_status = {}

    if status_path.exists():

        try:

            existing_status = json.loads(
                status_path.read_text(
                    encoding="utf-8"
                )
            )

        except json.JSONDecodeError:

            existing_status = {}

    completed_stages = set(
        existing_status.get(
            "completedStages",
            []
        )
    )

    completed_stages.add(
        stage
    )

    status_payload = {

        "schemaVersion":
            1,

        "updatedAtUTC":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "classLevel":
            class_level,

        "subject":
            plan.canonical_subject,

        "subjectFamily":
            plan.subject_family,

        "backbone":
            plan.backbone_model,

        "completedStages":
            sorted(
                completed_stages
            ),

        "pipelineStages":
            plan.curriculum_training_stages,

        "studentStages":
            plan.student_training_stages,

        "readyForNextCurriculumStage":
            True,
    }

    status_path.write_text(
        json.dumps(
            status_payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # =====================================================
    # OUTPUT
    # =====================================================

    print()
    print(
        "=" * 72
    )

    print(
        "✅ EXISTING REAL ML MODEL "
        "REGISTERED"
    )

    print(
        "=" * 72
    )

    print(
        f"Class: "
        f"{class_level}"
    )

    print(
        f"Subject: "
        f"{plan.canonical_subject}"
    )

    print(
        f"Family: "
        f"{plan.subject_family}"
    )

    print(
        f"Stage: "
        f"{stage}"
    )

    print()

    print(
        "Trained model:"
    )

    print(
        model_directory
    )

    print()

    print(
        "Universal manifest:"
    )

    print(
        manifest_path
    )

    print()

    print(
        f"Model copied: NO"
    )

    print(
        f"Real trained weights reused: YES"
    )

    if benchmark_summary:

        print()

        print(
            "BENCHMARK"
        )

        print(
            f"Base loss: "
            f"{benchmark_summary['baseLoss']}"
        )

        print(
            f"Adapted loss: "
            f"{benchmark_summary['adaptedLoss']}"
        )

        print(
            f"Relative improvement: "
            f"{benchmark_summary['relativeLossImprovementPercent']}%"
        )

        print(
            f"Adapted model better: "
            f"{benchmark_summary['adaptedModelBetter']}"
        )

    print()
    print(
        "=" * 72
    )


# =========================================================
# CLI
# =========================================================

def parse_arguments():

    parser = argparse.ArgumentParser(
        description=(
            "Register an already-trained real ML model "
            "inside Gyanivo universal training system."
        )
    )

    parser.add_argument(
        "--class",
        dest="class_level",
        required=True,
        type=int,
    )

    parser.add_argument(
        "--subject",
        required=True,
        type=str,
    )

    parser.add_argument(
        "--stage",
        required=True,
        type=str,
    )

    parser.add_argument(
        "--model",
        required=True,
        type=str,
    )

    parser.add_argument(
        "--benchmark",
        required=False,
        default=None,
        type=str,
    )

    return parser.parse_args()


# =========================================================
# MAIN
# =========================================================

def main():

    args = parse_arguments()

    benchmark_path = (
        Path(
            args.benchmark
        )
        if args.benchmark
        else None
    )

    register_existing_model(
        class_level=
            args.class_level,

        subject=
            args.subject,

        stage=
            args.stage,

        model_directory=
            Path(
                args.model
            ),

        benchmark_path=
            benchmark_path,
    )


if __name__ == "__main__":
    main()