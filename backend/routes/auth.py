from datetime import datetime

import bcrypt
from bson import ObjectId  # type: ignore
from fastapi import APIRouter, Depends, HTTPException, status

from models.schemas import UserCreate, UserLogin, Token
from services.db import get_database
from services.auth import create_access_token, get_current_user

router = APIRouter()


@router.post("/register", response_model=Token)
def register_user(payload: UserCreate):
    db = get_database()
    existing = db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    password_hash = bcrypt.hashpw(
        payload.password.encode("utf-8"), bcrypt.gensalt()
    ).decode("utf-8")

    user_doc = {
        "name": payload.name,
        "email": payload.email,
        "password_hash": password_hash,
        "role": "admin" if db.users.count_documents({}) == 0 else "user",
        "created_at": datetime.utcnow(),
    }
    result = db.users.insert_one(user_doc)
    token = create_access_token(str(result.inserted_id), user_doc["role"])
    return Token(access_token=token)


@router.post("/login", response_model=Token)
def login_user(payload: UserLogin):
    db = get_database()
    user = db.users.find_one({"email": payload.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not bcrypt.checkpw(
        payload.password.encode("utf-8"),
        user["password_hash"].encode("utf-8"),
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token(str(user["_id"]), user.get("role", "user"))
    return Token(access_token=token)


@router.get("/me")
def get_me(current_user=Depends(get_current_user)):
    current_user["_id"] = str(current_user["_id"])
    current_user.pop("password_hash", None)
    return current_user

