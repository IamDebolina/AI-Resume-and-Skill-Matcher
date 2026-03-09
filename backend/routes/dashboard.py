from typing import List, Optional

from fastapi import APIRouter, Depends, Query

from services.auth import get_current_user
from services.db import get_database

router = APIRouter()


@router.get("/user")
async def user_dashboard(current_user=Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    role = current_user.get("role", "user")

    resumes = list(db.resumes.find({"user_id": user_id}))
    total_resumes = len(resumes)

    best_score = 0.0
    for r in resumes:
        # Use last match if stored, else 0
        best_score = max(best_score, r.get("last_job_fit_score", 0) or 0)

    all_skills = []
    for r in resumes:
        all_skills.extend(r.get("skills", []))
    unique_skills = list(set(s.lower() for s in all_skills))

    return {
        "total_resumes": total_resumes,
        "best_match_score": round(best_score, 2),
        "total_skills": len(unique_skills),
        "resumes": [
            {
                "id": str(r["_id"]),
                "filename": r.get("filename", ""),
                "upload_date": r.get("upload_date"),
                "skills_count": len(r.get("skills", [])),
            }
            for r in resumes
        ],
    }


@router.get("/admin")
async def admin_dashboard(current_user=Depends(get_current_user)):
    if current_user.get("role") != "admin":
        return {"error": "Admin access required"}

    db = get_database()
    total_users = db.users.count_documents({})
    total_resumes = db.resumes.count_documents({})

    pipeline = [
        {"$match": {"last_job_fit_score": {"$exists": True, "$ne": None}}},
        {"$group": {"_id": None, "avg": {"$avg": "$last_job_fit_score"}}},
    ]
    cursor = db.resumes.aggregate(pipeline)
    row = next(cursor, None)
    avg_score = row["avg"] if row else 0.0

    skill_pipeline = [
        {"$unwind": "$skills"},
        {"$group": {"_id": {"$toLower": "$skills"}, "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 20},
    ]
    popular_skills = list(db.resumes.aggregate(skill_pipeline))

    return {
        "total_users": total_users,
        "total_resumes": total_resumes,
        "average_job_match_score": round(avg_score, 2),
        "most_popular_skills": [{"skill": s["_id"], "count": s["count"]} for s in popular_skills],
    }
