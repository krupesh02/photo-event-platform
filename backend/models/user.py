from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str
    name: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    avatarUrl: Optional[str] = None
    role: str
    createdAt: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse
