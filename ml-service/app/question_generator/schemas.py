from pydantic import BaseModel


class GenerateQuestionRequest(BaseModel):
    classLevel: int = 7

    subject: str = "MATH"

    chapter: str = "Simple Equations"

    difficulty: int | None = None

    targetSkill: str | None = None


class GeneratedQuestion(BaseModel):
    question: str

    answer: str

    steps: list[str]

    difficulty: int

    predictedDifficulty: int

    skillCodes: list[str]

    targetSkill: str | None = None

    verified: bool