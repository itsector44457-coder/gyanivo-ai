from pydantic import BaseModel


class StepValidationRequest(BaseModel):
    equation: str
    previousStep: str
    studentStep: str


class StepValidationResponse(BaseModel):
    correct: bool
    mistakeType: str
    skill: str | None = None
    retry: bool
    message: str