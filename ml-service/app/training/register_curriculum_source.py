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

CURRICULUM_ROOT = (
    ROOT
    / "data"
    / "curriculum"
)


# =========================================================
# SUPPORTED FILES
# =========================================================

SUPPORTED_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".json",
    ".jsonl",
    ".md",
}


# =========================================================
# FIND REAL SOURCE FILES
# =========================================================

def discover_source_files(
    source_directory: Path,
) -> list[Path]:

    files = []

    for path in source_directory.rglob("*"):

        if not path.is_file():
            continue

        if (
            path.suffix.lower()
            not in SUPPORTED_EXTENSIONS
        ):
            continue

        files.append(path)

    files.sort()

    return files


# =========================================================
# DISPLAY RELATIVE PATH
# =========================================================

def relative_path(
    path: Path,
) -> str:

    try:

        return str(
            path.relative_to(ROOT)
        )

    except ValueError:

        return str(
            path.resolve()
        )


# =========================================================
# REGISTER
# =========================================================

def register_source(
    class_level: int,
    subject: str,
    source_directory: Path,
):

    # -----------------------------------------------------
    # Validate subject using universal registry
    # -----------------------------------------------------

    plan = get_training_plan(
        class_level=
            class_level,

        subject=
            subject,
    )

    source_directory = (
        source_directory
        .resolve()
    )

    if not source_directory.exists():

        raise FileNotFoundError(
            (
                "Source directory does not exist:\n"
                f"{source_directory}"
            )
        )

    if not source_directory.is_dir():

        raise RuntimeError(
            (
                "Source must be a directory:\n"
                f"{source_directory}"
            )
        )

    # -----------------------------------------------------
    # Discover REAL files
    # -----------------------------------------------------

    source_files = (
        discover_source_files(
            source_directory
        )
    )

    if not source_files:

        raise RuntimeError(
            (
                "No supported curriculum files found in:\n"
                f"{source_directory}"
            )
        )

    # -----------------------------------------------------
    # Universal destination
    # -----------------------------------------------------

    destination = (
        CURRICULUM_ROOT
        / f"class_{class_level}"
        / plan.canonical_subject
    )

    destination.mkdir(
        parents=True,
        exist_ok=True,
    )

    manifest_path = (
        destination
        / ".source.json"
    )

    # -----------------------------------------------------
    # Manifest
    # -----------------------------------------------------

    payload = {
        "schemaVersion":
            1,

        "registrationType":
            "REFERENCE",

        "registeredAtUTC":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "classLevel":
            class_level,

        "subject":
            plan.canonical_subject,

        "subjectFamily":
            plan.subject_family,

        "specialization":
            plan.specialization_name,

        "backboneKey":
            plan.backbone_key,

        "backboneModel":
            plan.backbone_model,

        "sourceDirectory":
            relative_path(
                source_directory
            ),

        "absoluteSourceDirectory":
            str(
                source_directory
            ),

        "recursive":
            True,

        "sourceFileCount":
            len(
                source_files
            ),

        "sourceFiles": [
            relative_path(file)
            for file
            in source_files
        ],

        "importantNote":
            (
                "Files are referenced from their original "
                "location. No curriculum PDFs were copied."
            ),
    }

    manifest_path.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )

    # -----------------------------------------------------
    # OUTPUT
    # -----------------------------------------------------

    print()
    print(
        "=" * 72
    )

    print(
        "✅ CURRICULUM SOURCE REGISTERED"
    )

    print(
        "=" * 72
    )

    print(
        f"Class: {class_level}"
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
        f"Backbone: "
        f"{plan.backbone_model}"
    )

    print()

    print(
        f"📚 Real source files: "
        f"{len(source_files)}"
    )

    print()

    print(
        "Original data:"
    )

    print(
        source_directory
    )

    print()

    print(
        "Universal registration:"
    )

    print(
        manifest_path
    )

    print()

    print(
        "✅ PDFs copied: NO"
    )

    print(
        "✅ Existing data reused: YES"
    )

    print(
        "✅ Universal routing: YES"
    )

    print(
        "=" * 72
    )


# =========================================================
# ARGUMENTS
# =========================================================

def parse_arguments():

    parser = argparse.ArgumentParser(
        description=(
            "Register an existing curriculum source "
            "inside Gyanivo universal training system."
        )
    )

    parser.add_argument(
        "--class",
        dest="class_level",
        type=int,
        required=True,
    )

    parser.add_argument(
        "--subject",
        type=str,
        required=True,
    )

    parser.add_argument(
        "--source",
        type=str,
        required=True,
    )

    return parser.parse_args()


# =========================================================
# MAIN
# =========================================================

def main():

    args = parse_arguments()

    register_source(
        class_level=
            args.class_level,

        subject=
            args.subject,

        source_directory=
            Path(
                args.source
            ),
    )


if __name__ == "__main__":

    main()