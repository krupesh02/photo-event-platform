import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, disconnect_db
from routes import auth, events, photos, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()


app = FastAPI(
    title="AI Photo Event Platform",
    description="Backend API with FastAPI + PostgreSQL + Prisma + DeepFace",
    version="2.0.0",
    lifespan=lifespan,
)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",") if os.getenv("ALLOWED_ORIGINS") else []
default_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "capacitor://localhost",   # Capacitor iOS
    "http://localhost",        # Capacitor Android
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins + allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(events.router, prefix="/api/events", tags=["events"])
app.include_router(photos.router, prefix="/api/photos", tags=["photos"])
app.include_router(search.router, prefix="/api/search", tags=["search"])


@app.get("/")
async def root():
    return {"message": "Welcome to AI Photo Event Platform API v2"}
