from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.api import deps
from app.core import security
from app.core.config import settings
from app.models import user as user_model
from app.schemas import all_schemas
from app.core.database import get_db

router = APIRouter()

@router.post("/login", response_model=all_schemas.Token)
async def login_access_token(
    db: AsyncSession = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # 1. Fetch user by email
    stmt = select(user_model.User).where(user_model.User.email == form_data.username)
    result = await db.execute(stmt)
    user = result.scalars().first()

    # 2. Authenticate
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    # 3. Create token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=all_schemas.UserRead)
async def register(
    user_in: all_schemas.UserCreate,
    db: AsyncSession = Depends(get_db)
) -> Any:
    # 1. Check if user exists
    stmt = select(user_model.User).where(user_model.User.email == user_in.email)
    result = await db.execute(stmt)
    if result.scalars().first():
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    
    # 2. Create new user
    user = user_model.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
