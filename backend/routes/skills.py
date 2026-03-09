from typing import List

from fastapi import APIRouter, Depends

from models.schemas import SkillGapRequest, SkillGapResponse
from services.auth import get_current_user
from ai_engine.ai_engine import (
    extract_skills,
    cluster_skills,
    recommend_skills,
)

router = APIRouter()


@router.post("/gap", response_model=SkillGapResponse)
async def skill_gap_analysis(
    payload: SkillGapRequest,
    current_user=Depends(get_current_user),
):
    resume_skills = extract_skills(payload.resume_text)
    job_skills = extract_skills(payload.job_description_text)

    resume_set = {s.lower() for s in resume_skills}
    job_set = {s.lower() for s in job_skills}

    matched_skills = list(resume_set.intersection(job_set))
    missing_skills = list(job_set - resume_set)

    recommended = recommend_skills(matched_skills, missing_skills, top_k=10)
    clusters = cluster_skills(resume_skills + job_skills, n_clusters=5)

    return SkillGapResponse(
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        recommended_skills=recommended,
        clusters=clusters,
    )
