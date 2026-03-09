from datetime import datetime
from typing import List

import pdfplumber  # type: ignore
from bson import ObjectId  # type: ignore
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status

from models.schemas import ResumeUploadResponse, ResumeMeta, RewriteRequest, RewriteResponse
from services.auth import get_current_user
from services.db import get_database
from ai_engine.ai_engine import extract_skills, generate_embedding

router = APIRouter()


def extract_text_from_pdf_file(file: UploadFile) -> str:
    try:
        with pdfplumber.open(file.file) as pdf:
            pages = [page.extract_text() or "" for page in pdf.pages]
        return "\n".join(pages)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to parse PDF: {e}",
        )


@router.get("/list")
async def list_resumes(current_user=Depends(get_current_user)):
    db = get_database()
    cursor = db.resumes.find({"user_id": str(current_user["_id"])})
    resumes = []
    for r in cursor:
        r["_id"] = str(r["_id"])
        r.pop("embedding", None)
        r.pop("resume_text", None)
        resumes.append(r)
    return {"resumes": resumes}


@router.get("/{resume_id}")
async def get_resume(resume_id: str, current_user=Depends(get_current_user)):
    from bson import ObjectId

    db = get_database()
    r = db.resumes.find_one({
        "_id": ObjectId(resume_id),
        "user_id": str(current_user["_id"]),
    })
    if not r:
        raise HTTPException(status_code=404, detail="Resume not found")
    r["_id"] = str(r["_id"])
    r.pop("embedding", None)
    return r


@router.post("/upload", response_model=ResumeUploadResponse)
async def upload_resume(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported",
        )

    text = extract_text_from_pdf_file(file)
    skills: List[str] = extract_skills(text)
    embedding = generate_embedding(text).tolist()

    db = get_database()
    doc = {
        "user_id": str(current_user["_id"]),
        "filename": file.filename,
        "resume_text": text,
        "skills": skills,
        "embedding": embedding,
        "upload_date": datetime.utcnow(),
    }
    result = db.resumes.insert_one(doc)
    doc["_id"] = str(result.inserted_id)

    return {"resume": ResumeMeta(**doc)}


@router.post("/rewrite", response_model=RewriteResponse)
async def rewrite_resume(
    payload: RewriteRequest,
    current_user=Depends(get_current_user),
):
    improved = []
    for bullet in payload.bullet_points:
        # Simple action-impact enhancement (in production, use LLM)
        bullet_lower = bullet.lower()
        if "worked" in bullet_lower or "developed" in bullet_lower:
            improved.append(
                f"{bullet.rstrip('.')} improving efficiency and delivery quality."
            )
        else:
            improved.append(
                f"Developed and delivered {bullet.lower().rstrip('.')} with measurable impact."
            )
    return RewriteResponse(improved_bullets=improved)

