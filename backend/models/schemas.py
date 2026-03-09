from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, EmailStr, Field


class UserBase(BaseModel):
    name: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(UserBase):
    id: str = Field(alias="_id")
    role: str
    created_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ResumeMeta(BaseModel):
    id: str = Field(alias="_id")
    user_id: str
    filename: str
    skills: List[str]
    upload_date: datetime
    job_fit_score: Optional[float] = None


class ResumeUploadResponse(BaseModel):
    resume: ResumeMeta


class JobDescription(BaseModel):
    job_description_text: str


class MatchResult(BaseModel):
    resume_id: str
    filename: str
    job_fit_score: float
    semantic_similarity: float
    skill_match_ratio: float


class SkillGapRequest(BaseModel):
    resume_text: str
    job_description_text: str


class SkillGapResponse(BaseModel):
    matched_skills: List[str]
    missing_skills: List[str]
    recommended_skills: List[str]
    clusters: List[dict]


class ATSCheckRequest(BaseModel):
    resume_text: str
    job_description_text: Optional[str] = None


class ATSCheckResponse(BaseModel):
    keyword_density: dict
    sections_found: List[str]
    formatting_issues: List[str]
    suggestions: List[str]


class RewriteRequest(BaseModel):
    bullet_points: List[str]


class RewriteResponse(BaseModel):
    improved_bullets: List[str]

