from datetime import datetime
from typing import List, Optional

import requests
from bs4 import BeautifulSoup
from fastapi import APIRouter, Depends, HTTPException

from models.schemas import JobDescription
from services.auth import get_current_user
from services.db import get_database
from ai_engine.ai_engine import extract_skills

router = APIRouter()

# Example job sources - in production, use proper job board APIs or Playwright for dynamic sites
JOBS_SAMPLE = [
    {
        "title": "Senior Python Developer",
        "company": "Tech Corp",
        "description": "We need a Python developer with Django, Flask, REST APIs, PostgreSQL, and AWS experience.",
        "skills": ["python", "django", "flask", "postgresql", "aws"],
        "source": "sample",
    },
    {
        "title": "Full Stack Engineer",
        "company": "StartupXYZ",
        "description": "React, Node.js, MongoDB, Docker, and CI/CD. 3+ years experience required.",
        "skills": ["react", "node.js", "mongodb", "docker", "ci/cd"],
        "source": "sample",
    },
    {
        "title": "Data Scientist",
        "company": "DataCo",
        "description": "Python, scikit-learn, TensorFlow, SQL, and data visualization.",
        "skills": ["python", "scikit-learn", "tensorflow", "sql"],
        "source": "sample",
    },
]


def scrape_jobs_from_url(url: str) -> List[dict]:
    try:
        resp = requests.get(url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")
        jobs = []
        # Generic extraction - adapt selectors for specific job sites
        for item in soup.select("article, .job-listing, .job-card")[:20]:
            title_el = item.select_one("h2, h3, .title, .job-title")
            company_el = item.select_one(".company, .employer")
            desc_el = item.select_one(".description, .summary, p")
            if title_el:
                job = {
                    "title": title_el.get_text(strip=True),
                    "company": company_el.get_text(strip=True) if company_el else "Unknown",
                    "description": desc_el.get_text(strip=True)[:500] if desc_el else "",
                    "skills": [],
                    "source": url,
                    "scraped_at": datetime.utcnow(),
                }
                job["skills"] = extract_skills(job["description"])
                jobs.append(job)
        return jobs
    except Exception:
        return []


@router.get("/latest")
async def get_latest_jobs(
    url: Optional[str] = None,
    current_user=Depends(get_current_user),
):
    db = get_database()
    jobs = []

    if url:
        scraped = scrape_jobs_from_url(url)
        for j in scraped:
            j["user_id"] = str(current_user["_id"])
            db.jobs.insert_one(j)
        jobs = scraped
    else:
        # Return sample + any stored jobs
        stored = list(db.jobs.find({"user_id": str(current_user["_id"])}).limit(50))
        for s in stored:
            s["_id"] = str(s["_id"])
            s.pop("user_id", None)
            jobs.append(s)

        if not jobs:
            for j in JOBS_SAMPLE:
                j_copy = {**j, "user_id": str(current_user["_id"])}
                db.jobs.insert_one(j_copy)
            jobs = JOBS_SAMPLE

    return {"jobs": jobs}
