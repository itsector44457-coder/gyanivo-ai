from __future__ import annotations
from typing import Optional
from pydantic import BaseModel, Field


class CompetencyItem(BaseModel):
    id: int
    code: str
    name: str
    description: Optional[str] = None
    domain: Optional[str] = None


class CourseMappingItem(BaseModel):
    courseId: Optional[int] = None
    externalId: Optional[str] = None
    title: str
    description: Optional[str] = None
    learningOutcomes: Optional[list[str]] = Field(default_factory=list)
    tags: Optional[list[str]] = Field(default_factory=list)


class CourseMappingRequest(BaseModel):
    course: CourseMappingItem
    competencies: list[CompetencyItem]
    minSimilarityThreshold: float = 0.35
    topK: int = 3


class BatchCourseMappingRequest(BaseModel):
    courses: list[CourseMappingItem]
    competencies: list[CompetencyItem]
    minSimilarityThreshold: float = 0.35
    topK: int = 3


class CompetencyMatchResult(BaseModel):
    competencyId: int
    competencyCode: str
    competencyName: str
    domain: str
    semanticSimilarity: float  # Cosine similarity (0.0 - 1.0)
    mappingReliability: float  # Calibrated reliability score (0.0 - 1.0)
    mappingStatus: str         # "APPROVED", "PENDING_REVIEW", "REJECTED"
    evidence: str              # Explainable match reason


class CourseMappingResponse(BaseModel):
    courseTitle: str
    externalId: Optional[str] = None
    topMatches: list[CompetencyMatchResult]
    modelUsed: str = "sentence-transformers/all-MiniLM-L6-v2"
    embeddingDimension: int = 384


class TextEmbeddingRequest(BaseModel):
    text: str


class TextEmbeddingResponse(BaseModel):
    text: str
    dimension: int
    embedding: list[float]
    modelUsed: str = "sentence-transformers/all-MiniLM-L6-v2"
