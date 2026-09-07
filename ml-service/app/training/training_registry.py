from __future__ import annotations

import json
import re
from dataclasses import asdict, dataclass
from enum import Enum
from pathlib import Path
from typing import Optional


# =========================================================
# ROOT
# =========================================================

ML_SERVICE_ROOT = Path(__file__).resolve().parents[2]

MODEL_ROOT = (
    ML_SERVICE_ROOT
    / "models"
    / "universal_training"
)

REGISTRY_EXPORT_PATH = (
    MODEL_ROOT
    / "training_registry.json"
)


# =========================================================
# ENUMS
# =========================================================

class SubjectFamily(str, Enum):
    MATHEMATICS = "mathematics"
    SCIENCE = "science"
    LANGUAGE = "language"
    SOCIAL_SCIENCE = "social_science"


class AdapterStrategy(str, Enum):
    """
    How subject/class specialization will eventually happen.

    SHARED:
        One shared model for the whole family.

    SUBJECT_ADAPTER:
        Shared family backbone + lightweight subject-specific adapter.

    CLASS_CONDITIONED:
        Shared model receives class-level information.

    SUBJECT_AND_CLASS:
        Shared family model + subject specialization + class conditioning.
    """

    SHARED = "shared"
    SUBJECT_ADAPTER = "subject_adapter"
    CLASS_CONDITIONED = "class_conditioned"
    SUBJECT_AND_CLASS = "subject_and_class"


class TrainingStage(str, Enum):
    CURRICULUM_DOMAIN_ADAPTATION = "curriculum_domain_adaptation"

    SEMANTIC_CONTRASTIVE = "semantic_contrastive"

    CONTEXTUAL_CONTRASTIVE = "contextual_contrastive"

    CONCEPT_DISCOVERY = "concept_discovery"

    CURRICULUM_GRAPH = "curriculum_graph"

    STUDENT_DIFFICULTY = "student_difficulty"

    KNOWLEDGE_TRACING = "knowledge_tracing"

    MISTAKE_CLASSIFICATION = "mistake_classification"


# =========================================================
# BACKBONE CONFIG
# =========================================================

@dataclass(frozen=True)
class BackboneConfig:
    key: str

    model_id: str

    family: SubjectFamily

    description: str

    max_length: int

    adapter_strategy: AdapterStrategy

    use_layout_model: bool

    curriculum_training_stages: tuple[TrainingStage, ...]

    student_training_stages: tuple[TrainingStage, ...]


# =========================================================
# SUBJECT ROUTE
# =========================================================

@dataclass(frozen=True)
class SubjectRoute:
    canonical_subject: str

    aliases: tuple[str, ...]

    family: SubjectFamily

    backbone_key: str

    minimum_class: int

    maximum_class: int

    specialization_name: str


# =========================================================
# TRAINING PLAN
# =========================================================

@dataclass
class TrainingPlan:
    class_level: int

    requested_subject: str

    canonical_subject: str

    subject_family: str

    specialization_name: str

    backbone_key: str

    backbone_model: str

    max_length: int

    adapter_strategy: str

    use_layout_model: bool

    curriculum_training_stages: list[str]

    student_training_stages: list[str]

    curriculum_data_path: str

    model_output_path: str


# =========================================================
# BACKBONES
# =========================================================

BACKBONES: dict[str, BackboneConfig] = {

    # -----------------------------------------------------
    # MATHEMATICS
    # -----------------------------------------------------

    "math_foundation": BackboneConfig(
        key="math_foundation",

        model_id="tbs17/MathBERT",

        family=SubjectFamily.MATHEMATICS,

        description=(
            "Shared mathematical language foundation "
            "for school mathematics."
        ),

        max_length=256,

        adapter_strategy=
            AdapterStrategy.CLASS_CONDITIONED,

        use_layout_model=True,

        curriculum_training_stages=(
            TrainingStage.CURRICULUM_DOMAIN_ADAPTATION,

            TrainingStage.SEMANTIC_CONTRASTIVE,

            TrainingStage.CONTEXTUAL_CONTRASTIVE,

            TrainingStage.CONCEPT_DISCOVERY,

            TrainingStage.CURRICULUM_GRAPH,
        ),

        student_training_stages=(
            TrainingStage.STUDENT_DIFFICULTY,

            TrainingStage.KNOWLEDGE_TRACING,

            TrainingStage.MISTAKE_CLASSIFICATION,
        ),
    ),

    # -----------------------------------------------------
    # SCIENCE
    # -----------------------------------------------------

    "science_foundation": BackboneConfig(
        key="science_foundation",

        model_id="allenai/scibert_scivocab_uncased",

        family=SubjectFamily.SCIENCE,

        description=(
            "Shared science encoder for school science, "
            "physics, chemistry and biology."
        ),

        max_length=256,

        adapter_strategy=
            AdapterStrategy.SUBJECT_AND_CLASS,

        use_layout_model=True,

        curriculum_training_stages=(
            TrainingStage.CURRICULUM_DOMAIN_ADAPTATION,

            TrainingStage.SEMANTIC_CONTRASTIVE,

            TrainingStage.CONTEXTUAL_CONTRASTIVE,

            TrainingStage.CONCEPT_DISCOVERY,

            TrainingStage.CURRICULUM_GRAPH,
        ),

        student_training_stages=(
            TrainingStage.STUDENT_DIFFICULTY,

            TrainingStage.KNOWLEDGE_TRACING,

            TrainingStage.MISTAKE_CLASSIFICATION,
        ),
    ),

    # -----------------------------------------------------
    # ENGLISH
    # -----------------------------------------------------

    "english_foundation": BackboneConfig(
        key="english_foundation",

        model_id="microsoft/deberta-v3-base",

        family=SubjectFamily.LANGUAGE,

        description=(
            "English language foundation for reading, "
            "grammar, comprehension and vocabulary."
        ),

        max_length=256,

        adapter_strategy=
            AdapterStrategy.CLASS_CONDITIONED,

        use_layout_model=True,

        curriculum_training_stages=(
            TrainingStage.CURRICULUM_DOMAIN_ADAPTATION,

            TrainingStage.SEMANTIC_CONTRASTIVE,

            TrainingStage.CONTEXTUAL_CONTRASTIVE,

            TrainingStage.CONCEPT_DISCOVERY,

            TrainingStage.CURRICULUM_GRAPH,
        ),

        student_training_stages=(
            TrainingStage.STUDENT_DIFFICULTY,

            TrainingStage.KNOWLEDGE_TRACING,

            TrainingStage.MISTAKE_CLASSIFICATION,
        ),
    ),

    # -----------------------------------------------------
    # MULTILINGUAL / INDIAN LANGUAGES
    # -----------------------------------------------------

    "multilingual_foundation": BackboneConfig(
        key="multilingual_foundation",

        model_id="google/muril-base-cased",

        family=SubjectFamily.LANGUAGE,

        description=(
            "Multilingual Indian-language foundation "
            "for Hindi and additional supported languages."
        ),

        max_length=256,

        adapter_strategy=
            AdapterStrategy.SUBJECT_AND_CLASS,

        use_layout_model=True,

        curriculum_training_stages=(
            TrainingStage.CURRICULUM_DOMAIN_ADAPTATION,

            TrainingStage.SEMANTIC_CONTRASTIVE,

            TrainingStage.CONTEXTUAL_CONTRASTIVE,

            TrainingStage.CONCEPT_DISCOVERY,

            TrainingStage.CURRICULUM_GRAPH,
        ),

        student_training_stages=(
            TrainingStage.STUDENT_DIFFICULTY,

            TrainingStage.KNOWLEDGE_TRACING,

            TrainingStage.MISTAKE_CLASSIFICATION,
        ),
    ),

    # -----------------------------------------------------
    # SOCIAL SCIENCE
    # -----------------------------------------------------

    "social_science_foundation": BackboneConfig(
        key="social_science_foundation",

        model_id="microsoft/deberta-v3-base",

        family=SubjectFamily.SOCIAL_SCIENCE,

        description=(
            "Shared language-semantic foundation for "
            "history, geography, civics and economics."
        ),

        max_length=256,

        adapter_strategy=
            AdapterStrategy.SUBJECT_AND_CLASS,

        use_layout_model=True,

        curriculum_training_stages=(
            TrainingStage.CURRICULUM_DOMAIN_ADAPTATION,

            TrainingStage.SEMANTIC_CONTRASTIVE,

            TrainingStage.CONTEXTUAL_CONTRASTIVE,

            TrainingStage.CONCEPT_DISCOVERY,

            TrainingStage.CURRICULUM_GRAPH,
        ),

        student_training_stages=(
            TrainingStage.STUDENT_DIFFICULTY,

            TrainingStage.KNOWLEDGE_TRACING,

            TrainingStage.MISTAKE_CLASSIFICATION,
        ),
    ),
}


# =========================================================
# SUBJECT ROUTES
# =========================================================

SUBJECT_ROUTES: tuple[SubjectRoute, ...] = (

    # =====================================================
    # MATHEMATICS
    # =====================================================

    SubjectRoute(
        canonical_subject="mathematics",

        aliases=(
            "math",
            "maths",
            "mathematics",
            "ganit",
            "ganita",
        ),

        family=SubjectFamily.MATHEMATICS,

        backbone_key="math_foundation",

        minimum_class=1,

        maximum_class=12,

        specialization_name="mathematics",
    ),

    # =====================================================
    # GENERAL SCIENCE
    # =====================================================

    SubjectRoute(
        canonical_subject="science",

        aliases=(
            "science",
            "general science",
        ),

        family=SubjectFamily.SCIENCE,

        backbone_key="science_foundation",

        minimum_class=1,

        maximum_class=10,

        specialization_name="general_science",
    ),

    # =====================================================
    # PHYSICS
    # =====================================================

    SubjectRoute(
        canonical_subject="physics",

        aliases=(
            "physics",
            "physical science",
        ),

        family=SubjectFamily.SCIENCE,

        backbone_key="science_foundation",

        minimum_class=9,

        maximum_class=12,

        specialization_name="physics",
    ),

    # =====================================================
    # CHEMISTRY
    # =====================================================

    SubjectRoute(
        canonical_subject="chemistry",

        aliases=(
            "chemistry",
            "chemical science",
        ),

        family=SubjectFamily.SCIENCE,

        backbone_key="science_foundation",

        minimum_class=9,

        maximum_class=12,

        specialization_name="chemistry",
    ),

    # =====================================================
    # BIOLOGY
    # =====================================================

    SubjectRoute(
        canonical_subject="biology",

        aliases=(
            "biology",
            "biological science",
            "life science",
        ),

        family=SubjectFamily.SCIENCE,

        backbone_key="science_foundation",

        minimum_class=9,

        maximum_class=12,

        specialization_name="biology",
    ),

    # =====================================================
    # ENGLISH
    # =====================================================

    SubjectRoute(
        canonical_subject="english",

        aliases=(
            "english",
            "english language",
            "english literature",
        ),

        family=SubjectFamily.LANGUAGE,

        backbone_key="english_foundation",

        minimum_class=1,

        maximum_class=12,

        specialization_name="english",
    ),

    # =====================================================
    # HINDI
    # =====================================================

    SubjectRoute(
        canonical_subject="hindi",

        aliases=(
            "hindi",
            "हिंदी",
        ),

        family=SubjectFamily.LANGUAGE,

        backbone_key="multilingual_foundation",

        minimum_class=1,

        maximum_class=12,

        specialization_name="hindi",
    ),

    # =====================================================
    # SANSKRIT
    # =====================================================

    SubjectRoute(
        canonical_subject="sanskrit",

        aliases=(
            "sanskrit",
            "संस्कृत",
        ),

        family=SubjectFamily.LANGUAGE,

        backbone_key="multilingual_foundation",

        minimum_class=1,

        maximum_class=12,

        specialization_name="sanskrit",
    ),

    # =====================================================
    # SOCIAL SCIENCE
    # =====================================================

    SubjectRoute(
        canonical_subject="social_science",

        aliases=(
            "social science",
            "social studies",
            "sst",
        ),

        family=SubjectFamily.SOCIAL_SCIENCE,

        backbone_key="social_science_foundation",

        minimum_class=1,

        maximum_class=10,

        specialization_name="social_science",
    ),

    # =====================================================
    # HISTORY
    # =====================================================

    SubjectRoute(
        canonical_subject="history",

        aliases=(
            "history",
        ),

        family=SubjectFamily.SOCIAL_SCIENCE,

        backbone_key="social_science_foundation",

        minimum_class=6,

        maximum_class=12,

        specialization_name="history",
    ),

    # =====================================================
    # GEOGRAPHY
    # =====================================================

    SubjectRoute(
        canonical_subject="geography",

        aliases=(
            "geography",
        ),

        family=SubjectFamily.SOCIAL_SCIENCE,

        backbone_key="social_science_foundation",

        minimum_class=6,

        maximum_class=12,

        specialization_name="geography",
    ),

    # =====================================================
    # CIVICS
    # =====================================================

    SubjectRoute(
        canonical_subject="civics",

        aliases=(
            "civics",
            "political science",
        ),

        family=SubjectFamily.SOCIAL_SCIENCE,

        backbone_key="social_science_foundation",

        minimum_class=6,

        maximum_class=12,

        specialization_name="civics",
    ),

    # =====================================================
    # ECONOMICS
    # =====================================================

    SubjectRoute(
        canonical_subject="economics",

        aliases=(
            "economics",
        ),

        family=SubjectFamily.SOCIAL_SCIENCE,

        backbone_key="social_science_foundation",

        minimum_class=6,

        maximum_class=12,

        specialization_name="economics",
    ),
)


# =========================================================
# NORMALIZATION
# =========================================================

def normalize_subject(
    value: str,
) -> str:

    value = (
        value
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
# FIND SUBJECT ROUTE
# =========================================================

def find_subject_route(
    class_level: int,
    subject: str,
) -> SubjectRoute:

    if not (
        1 <= class_level <= 12
    ):
        raise ValueError(
            (
                "class_level must be "
                "between 1 and 12."
            )
        )

    normalized = normalize_subject(
        subject
    )

    matching_routes = []

    for route in SUBJECT_ROUTES:

        normalized_aliases = {
            normalize_subject(alias)
            for alias
            in route.aliases
        }

        normalized_aliases.add(
            normalize_subject(
                route.canonical_subject
            )
        )

        if (
            normalized
            not in normalized_aliases
        ):
            continue

        if not (
            route.minimum_class
            <= class_level
            <= route.maximum_class
        ):
            continue

        matching_routes.append(
            route
        )

    if not matching_routes:

        raise ValueError(
            (
                "No training route found for:\n"
                f"Class: {class_level}\n"
                f"Subject: {subject}"
            )
        )

    # More-specific subject entries win.
    matching_routes.sort(
        key=lambda item: (
            item.maximum_class
            - item.minimum_class
        )
    )

    return matching_routes[0]


# =========================================================
# DATA PATH
# =========================================================

def get_curriculum_data_path(
    class_level: int,
    canonical_subject: str,
) -> Path:

    return (
        ML_SERVICE_ROOT
        / "data"
        / "curriculum"
        / f"class_{class_level}"
        / canonical_subject
    )


# =========================================================
# MODEL OUTPUT PATH
# =========================================================

def get_model_output_path(
    class_level: int,
    route: SubjectRoute,
) -> Path:

    return (
        ML_SERVICE_ROOT
        / "models"
        / "curriculum"
        / route.family.value
        / route.specialization_name
        / f"class_{class_level}"
    )


# =========================================================
# BUILD TRAINING PLAN
# =========================================================

def get_training_plan(
    class_level: int,
    subject: str,
) -> TrainingPlan:

    route = find_subject_route(
        class_level=
            class_level,

        subject=
            subject,
    )

    backbone = BACKBONES.get(
        route.backbone_key
    )

    if backbone is None:

        raise RuntimeError(
            (
                "Backbone missing from registry: "
                f"{route.backbone_key}"
            )
        )

    if (
        backbone.family
        != route.family
    ):

        raise RuntimeError(
            (
                "Registry family mismatch.\n"
                f"Route family: {route.family.value}\n"
                f"Backbone family: "
                f"{backbone.family.value}"
            )
        )

    curriculum_path = (
        get_curriculum_data_path(
            class_level=
                class_level,

            canonical_subject=
                route.canonical_subject,
        )
    )

    output_path = (
        get_model_output_path(
            class_level=
                class_level,

            route=
                route,
        )
    )

    return TrainingPlan(
        class_level=
            class_level,

        requested_subject=
            subject,

        canonical_subject=
            route.canonical_subject,

        subject_family=
            route.family.value,

        specialization_name=
            route.specialization_name,

        backbone_key=
            backbone.key,

        backbone_model=
            backbone.model_id,

        max_length=
            backbone.max_length,

        adapter_strategy=
            backbone
            .adapter_strategy
            .value,

        use_layout_model=
            backbone.use_layout_model,

        curriculum_training_stages=[
            stage.value
            for stage
            in backbone
            .curriculum_training_stages
        ],

        student_training_stages=[
            stage.value
            for stage
            in backbone
            .student_training_stages
        ],

        curriculum_data_path=
            str(
                curriculum_path
            ),

        model_output_path=
            str(
                output_path
            ),
    )


# =========================================================
# EXPORT COMPLETE REGISTRY
# =========================================================

def export_registry():

    MODEL_ROOT.mkdir(
        parents=True,
        exist_ok=True,
    )

    payload = {

        "backbones": {
            key: {
                **asdict(config),

                "family":
                    config.family.value,

                "adapter_strategy":
                    config
                    .adapter_strategy
                    .value,

                "curriculum_training_stages": [
                    stage.value
                    for stage
                    in config
                    .curriculum_training_stages
                ],

                "student_training_stages": [
                    stage.value
                    for stage
                    in config
                    .student_training_stages
                ],
            }

            for key, config
            in BACKBONES.items()
        },

        "subjectRoutes": [
            {
                **asdict(route),

                "family":
                    route.family.value,
            }

            for route
            in SUBJECT_ROUTES
        ],
    }

    REGISTRY_EXPORT_PATH.write_text(
        json.dumps(
            payload,
            indent=2,
            ensure_ascii=False,
        ),
        encoding="utf-8",
    )


# =========================================================
# PRINT PLAN
# =========================================================

def print_training_plan(
    plan: TrainingPlan,
):

    print()
    print(
        "=" * 72
    )

    print(
        "🧠 GYANIVO UNIVERSAL TRAINING PLAN"
    )

    print(
        "=" * 72
    )

    print(
        f"Class: "
        f"{plan.class_level}"
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
        f"Specialization: "
        f"{plan.specialization_name}"
    )

    print()

    print(
        "MODEL"
    )

    print(
        f"Backbone key: "
        f"{plan.backbone_key}"
    )

    print(
        f"Backbone model: "
        f"{plan.backbone_model}"
    )

    print(
        f"Adapter strategy: "
        f"{plan.adapter_strategy}"
    )

    print(
        f"Max length: "
        f"{plan.max_length}"
    )

    print(
        f"Layout understanding: "
        f"{plan.use_layout_model}"
    )

    print()

    print(
        "CURRICULUM ML PIPELINE"
    )

    for index, stage in enumerate(
        plan.curriculum_training_stages,
        start=1,
    ):

        print(
            f"{index}. {stage}"
        )

    print()

    print(
        "STUDENT-DATA ML PIPELINE"
    )

    for index, stage in enumerate(
        plan.student_training_stages,
        start=1,
    ):

        print(
            f"{index}. {stage}"
        )

    print()

    print(
        "DATA"
    )

    print(
        plan.curriculum_data_path
    )

    print()

    print(
        "MODEL OUTPUT"
    )

    print(
        plan.model_output_path
    )

    print(
        "=" * 72
    )


# =========================================================
# SELF TEST
# =========================================================

def run_registry_self_test():

    print(
        "🧠 Gyanivo Universal Training Registry"
    )

    test_cases = [

        (7, "Math"),

        (8, "Science"),

        (11, "Physics"),

        (11, "Chemistry"),

        (12, "Biology"),

        (7, "English"),

        (7, "Hindi"),

        (9, "History"),
    ]

    successful = 0

    for (
        class_level,
        subject,
    ) in test_cases:

        try:

            plan = get_training_plan(
                class_level=
                    class_level,

                subject=
                    subject,
            )

            successful += 1

            print()
            print(
                "✅ "
                f"Class {class_level} "
                f"{subject}"
            )

            print(
                f"   → Family: "
                f"{plan.subject_family}"
            )

            print(
                f"   → Backbone: "
                f"{plan.backbone_key}"
            )

            print(
                f"   → Model: "
                f"{plan.backbone_model}"
            )

            print(
                f"   → Strategy: "
                f"{plan.adapter_strategy}"
            )

        except Exception as error:

            print()
            print(
                "❌ "
                f"Class {class_level} "
                f"{subject}"
            )

            print(
                f"   {error}"
            )

    export_registry()

    print()
    print(
        "=" * 72
    )

    print(
        f"Registry tests: "
        f"{successful}/"
        f"{len(test_cases)} passed"
    )

    print()

    print(
        "Registry exported:"
    )

    print(
        REGISTRY_EXPORT_PATH
    )

    print(
        "=" * 72
    )

    # -----------------------------------------------------
    # Show our current Class 7 Math route
    # -----------------------------------------------------

    current_plan = (
        get_training_plan(
            class_level=7,
            subject="Mathematics",
        )
    )

    print_training_plan(
        current_plan
    )


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    run_registry_self_test()