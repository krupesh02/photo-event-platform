from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class EventCreate(BaseModel):
    name: str
    description: Optional[str] = None
    eventDate: Optional[datetime] = None

class EventUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    eventDate: Optional[datetime] = None
    status: Optional[str] = None

class EventResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    coverUrl: Optional[str] = None
    eventDate: Optional[datetime] = None
    status: str
    createdAt: datetime
    userId: str
    photoCount: int = 0
