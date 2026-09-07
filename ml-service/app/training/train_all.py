from __future__ import annotations

import argparse
import json
import re
import sys
from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from pathlib import Path

from app.training.training_registry import (
    get_training_plan,
)


# =========================================================
# PATHS
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

CURRICULUM_ROOT = (
    ML_SERVICE_ROOT
    / "data"
    / "curriculum"
)

OUTPUT_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "universal_training"
)

JOBS_PATH = (
    OUTPUT_ROOT
    / "training_jobs.json"
)

SUMMARY_PATH = (
    OUTPUT_ROOT
    / "training_jobs_summary.json"
)


# =========================================================
# CONFIG
# =========================================================

SUPPORTED_SOURCE_EXTENSIONS = {
    ".pdf",
    ".txt",
    ".json",
    ".jsonl",
    ".md",
}

SOURCE_MANIFEST_NAME = ".source.json"

MINIMUM_SOURCE_FILES = 1


# =========================================================
# STATUS
# =========================================================

STATUS_READY = "READY"

STATUS_EMPTY = "EMPTY_DATA"

STATUS_INVALID = "INVALID_ROUTE"

STATUS_BROKEN_SOURCE = "BROKEN_SOURCE"


# =========================================================
# SOURCE TYPES
# =========================================================

SOURCE_DIRECT = "DIRECT"

SOURCE_REFERENCE = "REFERENCE"

SOURCE_NONE = "NONE"


# =========================================================
# TRAINING JOB
# =========================================================

@dataclass
class TrainingJob:

    job_id: str

    class_level: int

    subject: str

    subject_family: str

    specialization_name: str

    backbone_key: str

    backbone_model: str

    adapter_strategy: str

    max_length: int

    use_layout_model: bool

    curriculum_training_stages: list[str]

    student_training_stages: list[str]

    source_type: str

    curriculum_directory: str

    resolved_source_directory: str | None

    source_file_count: int

    source_files: list[str]

    output_directory: str

    status: str

    error: str | None = None


# =========================================================
# NORMALIZE SUBJECT
# =========================================================

def normalize_folder_subject(
    name: str,
) -> str:

    value = (
        name
        .strip()
        .lower()
    )

    value = re.sub(
        r"[_\-]+",
        " ",
        value,
    )

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


# =========================================================
# CLASS PARSER
# =========================================================

def parse_class_level(
    folder_name: str,
) -> int | None:

    normalized = (
        folder_name
        .strip()
        .lower()
    )

    match = re.fullmatch(
        r"class[_\-\s]*(\d{1,2})",
        normalized,
    )

    if not match:
        return None

    class_level = int(
        match.group(1)
    )

    if not (
        1 <= class_level <= 12
    ):
        return None

    return class_level


# =========================================================
# PATH DISPLAY
# =========================================================

def relative_display_path(
    path: Path,
) -> str:

    try:

        return str(
            path.resolve()
            .relative_to(
                ML_SERVICE_ROOT.resolve()
            )
        )

    except ValueError:

        return str(
            path.resolve()
        )


# =========================================================
# FILE DISCOVERY
# =========================================================

def discover_source_files(
    source_directory: Path,
) -> list[Path]:

    if not source_directory.exists():
        return []

    if not source_directory.is_dir():
        return []

    files: list[Path] = []

    for path in source_directory.rglob("*"):

        if not path.is_file():
            continue

        # Do not treat our registration manifest
        # itself as curriculum content.
        if (
            path.name
            == SOURCE_MANIFEST_NAME
        ):
            continue

        if (
            path.suffix.lower()
            not in SUPPORTED_SOURCE_EXTENSIONS
        ):
            continue

        files.append(
            path.resolve()
        )

    files.sort(
        key=lambda path:
            str(path).lower()
    )

    return files


# =========================================================
# LOAD SOURCE MANIFEST
# =========================================================

def load_source_manifest(
    subject_directory: Path,
) -> dict | None:

    manifest_path = (
        subject_directory
        / SOURCE_MANIFEST_NAME
    )

    if not manifest_path.exists():
        return None

    try:

        payload = json.loads(
            manifest_path.read_text(
                encoding="utf-8"
            )
        )

    except json.JSONDecodeError as error:

        raise RuntimeError(
            (
                "Invalid source manifest:\n"
                f"{manifest_path}\n"
                f"{error}"
            )
        )

    if not isinstance(
        payload,
        dict,
    ):

        raise RuntimeError(
            (
                "Source manifest must contain "
                "a JSON object:\n"
                f"{manifest_path}"
            )
        )

    return payload


# =========================================================
# RESOLVE MANIFEST SOURCE
# =========================================================

def resolve_manifest_source(
    subject_directory: Path,
    manifest: dict,
) -> Path:

    registration_type = str(
        manifest.get(
            "registrationType",
            ""
        )
    ).strip().upper()

    if (
        registration_type
        != SOURCE_REFERENCE
    ):

        raise RuntimeError(
            (
                "Unsupported registrationType "
                f"'{registration_type}'. "
                "Expected REFERENCE."
            )
        )

    absolute_source = manifest.get(
        "absoluteSourceDirectory"
    )

    relative_source = manifest.get(
        "sourceDirectory"
    )

    # -----------------------------------------------------
    # Prefer absolute path from registration time.
    # -----------------------------------------------------

    if absolute_source:

        candidate = Path(
            str(
                absolute_source
            )
        ).expanduser()

        if candidate.exists():
            return candidate.resolve()

    # -----------------------------------------------------
    # Fall back to path relative to ml-service root.
    # -----------------------------------------------------

    if relative_source:

        relative_candidate = (
            ML_SERVICE_ROOT
            / str(
                relative_source
            )
        )

        if relative_candidate.exists():
            return (
                relative_candidate
                .resolve()
            )

        # Also allow manifest-relative path.
        manifest_relative_candidate = (
            subject_directory
            / str(
                relative_source
            )
        )

        if (
            manifest_relative_candidate
            .exists()
        ):

            return (
                manifest_relative_candidate
                .resolve()
            )

    raise FileNotFoundError(
        (
            "Registered source directory "
            "could not be resolved."
        )
    )


# =========================================================
# RESOLVE SUBJECT DATA
# =========================================================

def resolve_subject_data(
    subject_directory: Path,
) -> tuple[
    str,
    Path | None,
    list[Path],
]:

    manifest = load_source_manifest(
        subject_directory
    )

    # =====================================================
    # REFERENCE MODE
    # =====================================================

    if manifest is not None:

        resolved_source = (
            resolve_manifest_source(
                subject_directory=
                    subject_directory,

                manifest=
                    manifest,
            )
        )

        source_files = (
            discover_source_files(
                resolved_source
            )
        )

        return (
            SOURCE_REFERENCE,
            resolved_source,
            source_files,
        )

    # =====================================================
    # DIRECT MODE
    #
    # PDFs are physically inside:
    #
    # data/curriculum/class_X/subject/
    # =====================================================

    source_files = (
        discover_source_files(
            subject_directory
        )
    )

    if source_files:

        return (
            SOURCE_DIRECT,
            subject_directory.resolve(),
            source_files,
        )

    return (
        SOURCE_NONE,
        None,
        [],
    )


# =========================================================
# INVALID JOB
# =========================================================

def create_invalid_job(
    class_level: int,
    requested_subject: str,
    subject_directory: Path,
    error: Exception | str,
) -> TrainingJob:

    return TrainingJob(

        job_id=(
            f"class_{class_level}"
            f"__{requested_subject.replace(' ', '_')}"
        ),

        class_level=
            class_level,

        subject=
            requested_subject,

        subject_family=
            "unknown",

        specialization_name=
            "unknown",

        backbone_key=
            "unknown",

        backbone_model=
            "unknown",

        adapter_strategy=
            "unknown",

        max_length=
            0,

        use_layout_model=
            False,

        curriculum_training_stages=
            [],

        student_training_stages=
            [],

        source_type=
            SOURCE_NONE,

        curriculum_directory=
            relative_display_path(
                subject_directory
            ),

        resolved_source_directory=
            None,

        source_file_count=
            0,

        source_files=
            [],

        output_directory=
            "",

        status=
            STATUS_INVALID,

        error=
            str(error),
    )


# =========================================================
# BUILD JOB
# =========================================================

def build_job(
    class_level: int,
    subject_directory: Path,
) -> TrainingJob:

    requested_subject = (
        normalize_folder_subject(
            subject_directory.name
        )
    )

    # =====================================================
    # REGISTRY ROUTING
    # =====================================================

    try:

        plan = get_training_plan(
            class_level=
                class_level,

            subject=
                requested_subject,
        )

    except Exception as error:

        return create_invalid_job(
            class_level=
                class_level,

            requested_subject=
                requested_subject,

            subject_directory=
                subject_directory,

            error=
                error,
        )

    # =====================================================
    # SOURCE RESOLUTION
    # =====================================================

    try:

        (
            source_type,
            resolved_source,
            source_files,
        ) = resolve_subject_data(
            subject_directory
        )

    except Exception as error:

        return TrainingJob(

            job_id=(
                f"class_{class_level}"
                f"__{plan.canonical_subject}"
            ),

            class_level=
                class_level,

            subject=
                plan.canonical_subject,

            subject_family=
                plan.subject_family,

            specialization_name=
                plan.specialization_name,

            backbone_key=
                plan.backbone_key,

            backbone_model=
                plan.backbone_model,

            adapter_strategy=
                plan.adapter_strategy,

            max_length=
                plan.max_length,

            use_layout_model=
                plan.use_layout_model,

            curriculum_training_stages=
                plan.curriculum_training_stages,

            student_training_stages=
                plan.student_training_stages,

            source_type=
                SOURCE_REFERENCE,

            curriculum_directory=
                relative_display_path(
                    subject_directory
                ),

            resolved_source_directory=
                None,

            source_file_count=
                0,

            source_files=
                [],

            output_directory=
                relative_display_path(
                    Path(
                        plan.model_output_path
                    )
                ),

            status=
                STATUS_BROKEN_SOURCE,

            error=
                str(error),
        )

    # =====================================================
    # STATUS
    # =====================================================

    if (
        len(source_files)
        >= MINIMUM_SOURCE_FILES
    ):

        status = STATUS_READY

    else:

        status = STATUS_EMPTY

    # =====================================================
    # FILE LIST
    # =====================================================

    source_file_strings = [
        relative_display_path(
            file
        )
        for file
        in source_files
    ]

    resolved_source_string = (
        relative_display_path(
            resolved_source
        )
        if resolved_source
        is not None
        else None
    )

    # =====================================================
    # JOB
    # =====================================================

    return TrainingJob(

        job_id=(
            f"class_{class_level}"
            f"__{plan.canonical_subject}"
        ),

        class_level=
            class_level,

        subject=
            plan.canonical_subject,

        subject_family=
            plan.subject_family,

        specialization_name=
            plan.specialization_name,

        backbone_key=
            plan.backbone_key,

        backbone_model=
            plan.backbone_model,

        adapter_strategy=
            plan.adapter_strategy,

        max_length=
            plan.max_length,

        use_layout_model=
            plan.use_layout_model,

        curriculum_training_stages=
            plan.curriculum_training_stages,

        student_training_stages=
            plan.student_training_stages,

        source_type=
            source_type,

        curriculum_directory=
            relative_display_path(
                subject_directory
            ),

        resolved_source_directory=
            resolved_source_string,

        source_file_count=
            len(
                source_files
            ),

        source_files=
            source_file_strings,

        output_directory=
            relative_display_path(
                Path(
                    plan.model_output_path
                )
            ),

        status=
            status,

        error=
            None,
    )


# =========================================================
# DISCOVER JOBS
# =========================================================

def discover_training_jobs(
    only_class: int | None = None,
    only_subject: str | None = None,
) -> list[TrainingJob]:

    if not CURRICULUM_ROOT.exists():

        raise FileNotFoundError(
            (
                "Curriculum root does not exist:\n"
                f"{CURRICULUM_ROOT}"
            )
        )

    jobs: list[TrainingJob] = []

    class_directories = sorted(
        [
            path
            for path
            in CURRICULUM_ROOT.iterdir()
            if path.is_dir()
        ],

        key=lambda path:
            path.name.lower(),
    )

    for class_directory in (
        class_directories
    ):

        class_level = (
            parse_class_level(
                class_directory.name
            )
        )

        if class_level is None:

            print(
                "⚠ Ignoring invalid class folder:"
            )

            print(
                f"   {class_directory}"
            )

            continue

        if (
            only_class is not None
            and class_level
            != only_class
        ):

            continue

        subject_directories = sorted(
            [
                path
                for path
                in class_directory.iterdir()
                if path.is_dir()
            ],

            key=lambda path:
                path.name.lower(),
        )

        for subject_directory in (
            subject_directories
        ):

            normalized_subject = (
                normalize_folder_subject(
                    subject_directory.name
                )
            )

            if only_subject is not None:

                normalized_filter = (
                    normalize_folder_subject(
                        only_subject
                    )
                )

                if (
                    normalized_subject
                    != normalized_filter
                ):

                    continue

            jobs.append(
                build_job(
                    class_level=
                        class_level,

                    subject_directory=
                        subject_directory,
                )
            )

    return jobs


# =========================================================
# SAVE JOBS
# =========================================================

def save_jobs(
    jobs: list[TrainingJob],
):

    OUTPUT_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    payload = {

        "schemaVersion":
            2,

        "generatedAtUTC":
            datetime.now(
                timezone.utc
            ).isoformat(),

        "curriculumRoot":
            relative_display_path(
                CURRICULUM_ROOT
            ),

        "jobCount":
            len(jobs),

        "jobs": [
            asdict(job)
            for job
            in jobs
        ],
    }

    JOBS_PATH.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


# =========================================================
# SAVE SUMMARY
# =========================================================

def save_summary(
    jobs: list[TrainingJob],
):

    statuses = {}

    source_types = {}

    family_counts = {}

    for job in jobs:

        statuses[
            job.status
        ] = (
            statuses.get(
                job.status,
                0,
            )
            + 1
        )

        source_types[
            job.source_type
        ] = (
            source_types.get(
                job.source_type,
                0,
            )
            + 1
        )

        if (
            job.status
            == STATUS_READY
        ):

            family_counts[
                job.subject_family
            ] = (
                family_counts.get(
                    job.subject_family,
                    0,
                )
                + 1
            )

    summary = {

        "totalJobs":
            len(jobs),

        "statusCounts":
            statuses,

        "sourceTypeCounts":
            source_types,

        "readyJobsByFamily":
            family_counts,

        "readyJobs": [
            job.job_id
            for job
            in jobs
            if job.status
            == STATUS_READY
        ],

        "importantNote":
            (
                "READY means curriculum data "
                "was successfully resolved. "
                "No neural training is executed "
                "by this discovery command yet."
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


# =========================================================
# PRINT JOB
# =========================================================

def print_job(
    job: TrainingJob,
):

    icon = {

        STATUS_READY:
            "✅",

        STATUS_EMPTY:
            "⚠",

        STATUS_INVALID:
            "❌",

        STATUS_BROKEN_SOURCE:
            "❌",

    }.get(
        job.status,
        "•",
    )

    print()
    print(
        "-" * 72
    )

    print(
        f"{icon} {job.job_id}"
    )

    print(
        f"Status: "
        f"{job.status}"
    )

    print(
        f"Class: "
        f"{job.class_level}"
    )

    print(
        f"Subject: "
        f"{job.subject}"
    )

    if (
        job.status
        != STATUS_INVALID
    ):

        print(
            f"Family: "
            f"{job.subject_family}"
        )

        print(
            f"Backbone: "
            f"{job.backbone_model}"
        )

        print(
            f"Strategy: "
            f"{job.adapter_strategy}"
        )

        print(
            f"Source type: "
            f"{job.source_type}"
        )

        if (
            job.resolved_source_directory
        ):

            print(
                f"Resolved source:"
            )

            print(
                f"   "
                f"{job.resolved_source_directory}"
            )

        print(
            f"Source files: "
            f"{job.source_file_count}"
        )

        print(
            "Stages:"
        )

        for stage in (
            job.curriculum_training_stages
        ):

            print(
                f"   → {stage}"
            )

    if job.error:

        print(
            f"Error: "
            f"{job.error}"
        )


# =========================================================
# PRINT SUMMARY
# =========================================================

def print_summary(
    jobs: list[TrainingJob],
):

    ready = sum(
        job.status
        == STATUS_READY
        for job
        in jobs
    )

    empty = sum(
        job.status
        == STATUS_EMPTY
        for job
        in jobs
    )

    invalid = sum(
        job.status
        == STATUS_INVALID
        for job
        in jobs
    )

    broken = sum(
        job.status
        == STATUS_BROKEN_SOURCE
        for job
        in jobs
    )

    reference = sum(
        job.source_type
        == SOURCE_REFERENCE
        for job
        in jobs
    )

    direct = sum(
        job.source_type
        == SOURCE_DIRECT
        for job
        in jobs
    )

    print()
    print(
        "=" * 72
    )

    print(
        "🧠 GYANIVO UNIVERSAL "
        "TRAINING ORCHESTRATOR"
    )

    print(
        "=" * 72
    )

    print(
        f"Total discovered jobs: "
        f"{len(jobs)}"
    )

    print(
        f"✅ Ready: "
        f"{ready}"
    )

    print(
        f"⚠ Empty data: "
        f"{empty}"
    )

    print(
        f"❌ Invalid routes: "
        f"{invalid}"
    )

    print(
        f"❌ Broken references: "
        f"{broken}"
    )

    print()

    print(
        f"🔗 Reference sources: "
        f"{reference}"
    )

    print(
        f"📂 Direct sources: "
        f"{direct}"
    )

    print()

    print(
        "Training manifest:"
    )

    print(
        JOBS_PATH
    )

    print()

    print(
        "Summary:"
    )

    print(
        SUMMARY_PATH
    )

    print(
        "=" * 72
    )


# =========================================================
# CREATE FOLDER TEMPLATE
# =========================================================

def create_directory_template():

    print(
        "📁 Creating curriculum "
        "directory template..."
    )

    # -----------------------------------------------------
    # Keep this only as storage convenience.
    #
    # Empty directories do not trigger training.
    # -----------------------------------------------------

    base_subjects = {
        1: [
            "mathematics",
            "english",
            "hindi",
        ],

        2: [
            "mathematics",
            "english",
            "hindi",
        ],

        3: [
            "mathematics",
            "english",
            "hindi",
        ],

        4: [
            "mathematics",
            "english",
            "hindi",
        ],

        5: [
            "mathematics",
            "english",
            "hindi",
        ],

        6: [
            "mathematics",
            "science",
            "english",
            "hindi",
            "social_science",
        ],

        7: [
            "mathematics",
            "science",
            "english",
            "hindi",
            "social_science",
        ],

        8: [
            "mathematics",
            "science",
            "english",
            "hindi",
            "social_science",
        ],

        9: [
            "mathematics",
            "science",
            "english",
            "hindi",
            "social_science",
        ],

        10: [
            "mathematics",
            "science",
            "english",
            "hindi",
            "social_science",
        ],

        11: [
            "mathematics",
            "physics",
            "chemistry",
            "biology",
            "english",
            "hindi",
            "history",
            "geography",
            "economics",
        ],

        12: [
            "mathematics",
            "physics",
            "chemistry",
            "biology",
            "english",
            "hindi",
            "history",
            "geography",
            "economics",
        ],
    }

    created = 0

    for (
        class_level,
        subjects,
    ) in base_subjects.items():

        for subject in subjects:

            directory = (
                CURRICULUM_ROOT
                / f"class_{class_level}"
                / subject
            )

            if directory.exists():
                continue

            directory.mkdir(
                parents=True,
                exist_ok=True,
            )

            created += 1

    print(
        f"✅ New folders created: "
        f"{created}"
    )

    print()

    print(
        CURRICULUM_ROOT
    )


# =========================================================
# CLI
# =========================================================

def parse_arguments():

    parser = argparse.ArgumentParser(
        description=(
            "Gyanivo universal curriculum "
            "training orchestrator."
        )
    )

    parser.add_argument(
        "--create-template",

        action="store_true",
    )

    parser.add_argument(
        "--class",

        dest="class_level",

        type=int,

        default=None,
    )

    parser.add_argument(
        "--subject",

        type=str,

        default=None,
    )

    return parser.parse_args()


# =========================================================
# MAIN
# =========================================================

def main():

    args = parse_arguments()

    print(
        "🧠 Gyanivo Universal "
        "Training Orchestrator"
    )

    print(
        "Direct + referenced curriculum sources"
    )

    # =====================================================
    # TEMPLATE
    # =====================================================

    if args.create_template:

        create_directory_template()

        print()

    if not CURRICULUM_ROOT.exists():

        print(
            "❌ Curriculum root missing:"
        )

        print(
            CURRICULUM_ROOT
        )

        sys.exit(1)

    # =====================================================
    # SCAN
    # =====================================================

    print()
    print(
        "🔍 Resolving curriculum sources..."
    )

    jobs = discover_training_jobs(
        only_class=
            args.class_level,

        only_subject=
            args.subject,
    )

    if not jobs:

        print(
            "⚠ No jobs discovered."
        )

        return

    for job in jobs:

        print_job(
            job
        )

    save_jobs(
        jobs
    )

    save_summary(
        jobs
    )

    print_summary(
        jobs
    )

    print()
    print(
        "NOTE:"
    )

    print(
        (
            "READY means real curriculum "
            "files were resolved successfully."
        )
    )

    print(
        (
            "No neural-network training "
            "was executed by this command yet."
        )
    )


if __name__ == "__main__":
    main()