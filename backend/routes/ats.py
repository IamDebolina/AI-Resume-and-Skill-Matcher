import re
from typing import List, Optional

from fastapi import APIRouter, Depends

from models.schemas import ATSCheckRequest, ATSCheckResponse
from services.auth import get_current_user
from ai_engine.ai_engine import extract_skills

router = APIRouter()


def detect_sections(text: str) -> List[str]:
    sections = []
    section_keywords = [
        "experience", "work experience", "employment", "education",
        "skills", "technical skills", "summary", "objective",
        "projects", "certifications", "achievements", "qualifications",
    ]
    lower = text.lower()
    for kw in section_keywords:
        if kw in lower:
            sections.append(kw.title())
    return sections


def analyze_keyword_density(text: str, job_keywords: Optional[List[str]] = None) -> dict:
    skills = extract_skills(text)
    word_count = len(text.split())
    density = {}
    for skill in skills[:30]:
        count = len(re.findall(rf"\b{re.escape(skill)}\b", text, re.I))
        if count > 0:
            density[skill] = round(count / max(word_count, 1) * 100, 2)
    if job_keywords:
        for kw in job_keywords[:20]:
            if kw not in density:
                count = len(re.findall(rf"\b{re.escape(kw)}\b", text, re.I))
                density[kw] = round(count / max(word_count, 1) * 100, 2)
    return density


@router.post("/ats-check", response_model=ATSCheckResponse)
async def ats_check(
    payload: ATSCheckRequest,
    current_user=Depends(get_current_user),
):
    text = payload.resume_text
    job_keywords = extract_skills(payload.job_description_text) if payload.job_description_text else None

    keyword_density = analyze_keyword_density(text, job_keywords)
    sections_found = detect_sections(text)

    formatting_issues: List[str] = []
    suggestions: List[str] = []

    if len(text) < 200:
        formatting_issues.append("Resume appears too short")
        suggestions.append("Add more detail to your experience and skills")

    if "experience" not in [s.lower() for s in sections_found]:
        formatting_issues.append("Experience section not detected")
        suggestions.append("Add a clear Experience or Work History section")

    if "skills" not in [s.lower() for s in sections_found]:
        formatting_issues.append("Skills section not detected")
        suggestions.append("Include a dedicated Skills section")

    if job_keywords:
        missing = [kw for kw in job_keywords[:15] if kw.lower() not in text.lower()]
        if missing:
            suggestions.append(f"Include missing keywords like {', '.join(missing[:5])}")

    suggestions.append("Add more quantified achievements (e.g., 'improved X by 30%')")

    return ATSCheckResponse(
        keyword_density=keyword_density,
        sections_found=sections_found,
        formatting_issues=formatting_issues,
        suggestions=suggestions,
    )
