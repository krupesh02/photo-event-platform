from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.event import EventCreate, EventUpdate, EventResponse
from routes.auth import get_current_user
from database import db

router = APIRouter()


@router.post("/", response_model=EventResponse)
async def create_event(event_in: EventCreate, current_user=Depends(get_current_user)):
    event = await db.event.create(
        data={
            "name": event_in.name,
            "description": event_in.description,
            "eventDate": event_in.eventDate,
            "userId": current_user.id,
        },
        include={"photos": True},
    )
    return EventResponse(
        id=event.id,
        name=event.name,
        description=event.description,
        coverUrl=event.coverUrl,
        eventDate=event.eventDate,
        status=event.status,
        createdAt=event.createdAt,
        userId=event.userId,
        photoCount=len(event.photos) if event.photos else 0,
    )


@router.get("/", response_model=List[EventResponse])
async def list_events(current_user=Depends(get_current_user)):
    events = await db.event.find_many(
        where={"userId": current_user.id, "status": {"not": "DELETED"}},
        include={"photos": True},
        order={"createdAt": "desc"},
    )
    return [
        EventResponse(
            id=e.id,
            name=e.name,
            description=e.description,
            coverUrl=e.coverUrl,
            eventDate=e.eventDate,
            status=e.status,
            createdAt=e.createdAt,
            userId=e.userId,
            photoCount=len(e.photos) if e.photos else 0,
        )
        for e in events
    ]


@router.get("/{event_id}", response_model=EventResponse)
async def get_event(event_id: str, current_user=Depends(get_current_user)):
    event = await db.event.find_unique(
        where={"id": event_id},
        include={"photos": True},
    )
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return EventResponse(
        id=event.id,
        name=event.name,
        description=event.description,
        coverUrl=event.coverUrl,
        eventDate=event.eventDate,
        status=event.status,
        createdAt=event.createdAt,
        userId=event.userId,
        photoCount=len(event.photos) if event.photos else 0,
    )



@router.get("/{event_id}/public", response_model=EventResponse)
async def get_event_public(event_id: str):
    """Public endpoint to get basic event details for guest sharing link."""
    event = await db.event.find_unique(
        where={"id": event_id},
    )
    if not event or event.status == "DELETED":
        raise HTTPException(status_code=404, detail="Event not found")
    
    # Return minimal safe details for guests
    return EventResponse(
        id=event.id,
        name=event.name,
        description=event.description,
        coverUrl=event.coverUrl,
        eventDate=event.eventDate,
        status=event.status,
        createdAt=event.createdAt,
        userId=event.userId,
        photoCount=0,
    )

@router.put("/{event_id}", response_model=EventResponse)
async def update_event(event_id: str, event_in: EventUpdate, current_user=Depends(get_current_user)):
    event = await db.event.find_unique(where={"id": event_id})
    if not event or event.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Event not found")

    update_data = event_in.model_dump(exclude_none=True)
    updated = await db.event.update(
        where={"id": event_id},
        data=update_data,
        include={"photos": True},
    )
    return EventResponse(
        id=updated.id,
        name=updated.name,
        description=updated.description,
        coverUrl=updated.coverUrl,
        eventDate=updated.eventDate,
        status=updated.status,
        createdAt=updated.createdAt,
        userId=updated.userId,
        photoCount=len(updated.photos) if updated.photos else 0,
    )


@router.delete("/{event_id}")
async def delete_event(event_id: str, current_user=Depends(get_current_user)):
    event = await db.event.find_unique(where={"id": event_id})
    if not event or event.userId != current_user.id:
        raise HTTPException(status_code=404, detail="Event not found")

    await db.event.update(where={"id": event_id}, data={"status": "DELETED"})
    return {"message": "Event deleted"}
