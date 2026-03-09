from typing import List

import numpy as np
from fastapi import APIRouter, Depends

from models.schemas import JobDescription, MatchResult
from services.auth import get_current_user
from services.db import get_database
from ai_engine.ai_engine import (
    generate_embedding,
    calculate_cosine_similarity,
    calculate_skill_match_ratio,
    extract_skills,
)

router = APIRouter()


@router.post("/job-description", response_model=List[MatchResult])
async def match_job_description(
    payload: JobDescription,
    current_user=Depends(get_current_user),
):
    db = get_database()
    resumes = list(db.resumes.find({"user_id": str(current_user["_id"])}))
    if not resumes:
        return []

    job_emb = generate_embedding(payload.job_description_text)
    job_skills = extract_skills(payload.job_description_text)

    ranked: List[MatchResult] = []
    for r in resumes:
        emb = np.array(r.get("embedding", []), dtype=float)
        semantic_similarity = calculate_cosine_similarity(job_emb, emb)
        resume_skills = r.get("skills", [])
        skill_match_ratio = calculate_skill_match_ratio(resume_skills, job_skills)
        job_fit_score = (semantic_similarity * 0.7 + skill_match_ratio * 0.3) * 100.0

        ranked.append(
            MatchResult(
                resume_id=str(r["_id"]),
                filename=r.get("filename", ""),
                job_fit_score=round(job_fit_score, 2),
                semantic_similarity=round(semantic_similarity, 4),
                skill_match_ratio=round(skill_match_ratio, 4),
            )
        )

    ranked.sort(key=lambda x: x.job_fit_score, reverse=True)
    return ranked

