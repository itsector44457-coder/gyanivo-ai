from fastapi import (
    FastAPI,
    HTTPException,
)

from app.math_engine.schemas import (
    StepValidationRequest,
    StepValidationResponse,
)

from app.math_engine.validator import (
    validate_student_step,
)

from app.question_generator.schemas import (
    GenerateQuestionRequest,
    GeneratedQuestion,
)

from app.question_generator.generator import (
    generate_question,
)

from app.question_generator.difficulty_model import (
    predict_difficulty,
)

from app.knowledge_tracing.schemas import (
    KnowledgeUpdateRequest,
    KnowledgeUpdateResponse,
    CompetencyBKTUpdateRequest,
    CompetencyBKTUpdateResponse,
)

from app.knowledge_tracing.bkt import (
    update_knowledge,
    update_competency_knowledge,
)


app = FastAPI(
    title="Gyanivo AI ML Service",
    version="1.3.0",
)


@app.get("/")
def root():

    return {
        "service":
            "Gyanivo AI ML Service",

        "status":
            "running",

        "version":
            "1.3.0",

        "engines": [
            "math_validation",
            "question_generation",
            "difficulty_prediction",
            "knowledge_tracing",
        ],
    }


@app.get("/health")
def health():

    return {
        "status":
            "healthy",
    }


# =========================================================
# STEP VALIDATION
# =========================================================


@app.post(
    "/validate-step",
    response_model=StepValidationResponse,
)
def validate_step(
    request: StepValidationRequest,
):

    return validate_student_step(
        equation=
            request.equation,

        previous_step=
            request.previousStep,

        student_step=
            request.studentStep,
    )


# =========================================================
# QUESTION GENERATION
# =========================================================


@app.post(
    "/generate-question",
    response_model=GeneratedQuestion,
)
def create_question(
    request: GenerateQuestionRequest,
):

    if (
        request.subject.upper()
        != "MATH"
    ):

        raise HTTPException(
            status_code=400,

            detail=(
                "Current generator "
                "supports Mathematics only."
            ),
        )

    difficulty = (
        request.difficulty
        if request.difficulty
        else 2
    )

    if difficulty not in [
        1,
        2,
        3,
    ]:

        raise HTTPException(
            status_code=400,

            detail=(
                "Difficulty must be "
                "1, 2 or 3."
            ),
        )

    try:

        generated = (
            generate_question(
                difficulty=
                    difficulty,

                target_skill=
                    request.targetSkill,
            )
        )

        predicted = (
            predict_difficulty(
                generated[
                    "equation"
                ]
            )
        )

        return {
            "question":
                generated[
                    "question"
                ],

            "answer":
                generated[
                    "answer"
                ],

            "steps":
                generated[
                    "steps"
                ],

            "difficulty":
                generated[
                    "difficulty"
                ],

            "predictedDifficulty":
                predicted,

            "skillCodes":
                generated[
                    "skillCodes"
                ],

            "targetSkill":
                generated[
                    "targetSkill"
                ],

            "verified":
                generated[
                    "verified"
                ],
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=str(error),
        )


# =========================================================
# KNOWLEDGE TRACING
# =========================================================


@app.post(
    "/knowledge-tracing/update",
    response_model=KnowledgeUpdateResponse,
)
def update_student_knowledge(
    request: KnowledgeUpdateRequest,
):

    return update_knowledge(
        current_mastery=
            request.currentMastery,

        correct=
            request.correct,

        hint_used=
            request.hintUsed,

        attempt_number=
            request.attemptNumber,

        difficulty=
            request.difficulty,

        skill_weight=
            request.skillWeight,

        time_taken_sec=
            request.timeTakenSec,
    )


@app.post(
    "/knowledge-tracing/competency-update",
    response_model=CompetencyBKTUpdateResponse,
)
def update_competency_mastery(
    request: CompetencyBKTUpdateRequest,
):
    return update_competency_knowledge(
        prior_mastery=request.priorMastery,
        correct=request.correct,
        difficulty=request.difficulty,
        guess=request.guess,
        slip=request.slip,
        learn=request.learn,
        time_taken_sec=request.timeTakenSec,
    )


# =========================================================
# PHASE 4: AUTOMATIC SEMANTIC COMPETENCY MAPPING & EMBEDDINGS
# =========================================================

from app.course_mapping.schemas import (
    CourseMappingRequest,
    CourseMappingResponse,
    BatchCourseMappingRequest,
    TextEmbeddingRequest,
    TextEmbeddingResponse,
)
from app.course_mapping.semantic_mapper import mapper_instance


@app.post(
    "/courses/map-competencies",
    response_model=CourseMappingResponse,
)
def map_course_competencies(
    request: CourseMappingRequest,
):
    """
    Automatic semantic mapping: encodes course metadata and calculates
    cosine similarity against enterprise competency catalog vectors.
    """
    return mapper_instance.map_course(
        course=request.course,
        competencies=request.competencies,
        min_threshold=request.minSimilarityThreshold,
        top_k=request.topK,
    )


@app.post(
    "/courses/batch-map",
    response_model=list[CourseMappingResponse],
)
def batch_map_courses(
    request: BatchCourseMappingRequest,
):
    """
    Batch semantic mapping for syncing full course catalogs.
    """
    results = []
    for c in request.courses:
        res = mapper_instance.map_course(
            course=c,
            competencies=request.competencies,
            min_threshold=request.minSimilarityThreshold,
            top_k=request.topK,
        )
        results.append(res)
    return results


@app.post(
    "/embeddings/text",
    response_model=TextEmbeddingResponse,
)
def generate_text_embedding(
    request: TextEmbeddingRequest,
):
    """
    Generates deterministic 384-dimensional unit vector embedding.
    """
    vec = mapper_instance.encode_text(request.text)
    return TextEmbeddingResponse(
        text=request.text[:200],
        dimension=len(vec),
        embedding=vec.tolist(),
        modelUsed=mapper_instance.model_name,
    )

