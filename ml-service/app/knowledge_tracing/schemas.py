from pydantic import BaseModel, Field


class KnowledgeUpdateRequest(BaseModel):
    currentMastery: float = Field(
        ge=0,
        le=100,
    )

    correct: bool

    hintUsed: bool = False

    attemptNumber: int = Field(
        default=1,
        ge=1,
    )

    difficulty: int = Field(
        default=2,
        ge=1,
        le=3,
    )

    skillWeight: float = Field(
        default=1.0,
        gt=0,
    )

    timeTakenSec: int | None = Field(
        default=None,
        ge=0,
    )


class KnowledgeUpdateResponse(BaseModel):
    previousMastery: float

    mastery: float

    probabilityKnown: float

    observation: str

    parameters: dict[str, float]


class CompetencyBKTUpdateRequest(BaseModel):
    priorMastery: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
    )

    correct: bool

    difficulty: str = Field(
        default="MEDIUM",
    )

    guess: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    slip: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    learn: float | None = Field(
        default=None,
        ge=0.0,
        le=1.0,
    )

    timeTakenSec: int | None = Field(
        default=None,
        ge=0,
    )


class CompetencyBKTUpdateResponse(BaseModel):
    previousMastery: float

    updatedMastery: float

    probabilityKnown: float

    observation: str

    parameters: dict[str, float]