from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models.user import UserCreate, UserLogin, UserResponse, Token
from core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from database import db

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login")


async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_access_token(token)
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user = await db.user.find_unique(where={"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", response_model=Token)
async def register(user_in: UserCreate):
    existing = await db.user.find_unique(where={"email": user_in.email})
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = await db.user.create(
        data={
            "email": user_in.email,
            "name": user_in.name,
            "hashedPassword": get_password_hash(user_in.password),
        }
    )

    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatarUrl=user.avatarUrl,
            role=user.role,
            createdAt=user.createdAt,
        ),
    }


@router.post("/login", response_model=Token)
async def login(user_in: UserLogin):
    user = await db.user.find_unique(where={"email": user_in.email})
    if not user or not verify_password(user_in.password, user.hashedPassword):
        raise HTTPException(status_code=400, detail="Incorrect email or password")

    access_token = create_access_token(data={"sub": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            avatarUrl=user.avatarUrl,
            role=user.role,
            createdAt=user.createdAt,
        ),
    }


@router.get("/me", response_model=UserResponse)
async def get_me(current_user=Depends(get_current_user)):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        name=current_user.name,
        avatarUrl=current_user.avatarUrl,
        role=current_user.role,
        createdAt=current_user.createdAt,
    )
