from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.auth import router as auth_router
from routes.resume import router as resume_router
from routes.match import router as match_router
from routes.skills import router as skills_router
from routes.ats import router as ats_router
from routes.jobs import router as jobs_router
from routes.dashboard import router as dashboard_router


def create_app() -> FastAPI:
    app = FastAPI(title="AI Recruitment Platform")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(auth_router, prefix="/auth", tags=["auth"])
    app.include_router(resume_router, prefix="/resume", tags=["resume"])
    app.include_router(match_router, prefix="/match", tags=["match"])
    app.include_router(skills_router, prefix="/skills", tags=["skills"])
    app.include_router(ats_router, prefix="/resume", tags=["ats"])
    app.include_router(jobs_router, prefix="/jobs", tags=["jobs"])
    app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])

    @app.get("/health")
    async def health_check():
        return {"status": "ok"}

    return app


app = create_app()
