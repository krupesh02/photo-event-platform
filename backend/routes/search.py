from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List, Optional
from models.photo import PhotoResponse, PhotoSearchResult
from routes.auth import get_current_user
from services.ai_service import get_face_embeddings, cosine_similarity
from database import db

router = APIRouter()

SIMILARITY_THRESHOLD = 0.6


@router.post("/face", response_model=List[PhotoSearchResult])
async def search_by_face(
    file: UploadFile = File(...),
    event_id: Optional[str] = Form(None),
    current_user=Depends(get_current_user),
):
    """Upload a selfie and find matching photos using face recognition."""
    file_bytes = await file.read()

    # Extract face embedding from selfie
    selfie_embeddings = get_face_embeddings(file_bytes)
    if not selfie_embeddings:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    selfie_embedding = selfie_embeddings[0]  # Use first face

    # Query photos with face embeddings
    where_clause = {"faceCount": {"gt": 0}}
    if event_id:
        where_clause["eventId"] = event_id

    photos = await db.photo.find_many(where=where_clause)

    # Compare embeddings
    results = []
    for photo in photos:
        if not photo.faceEmbeddings:
            continue
        embeddings = photo.faceEmbeddings
        if not isinstance(embeddings, list):
            continue

        max_sim = 0.0
        for emb in embeddings:
            sim = cosine_similarity(selfie_embedding, emb)
            max_sim = max(max_sim, sim)

        if max_sim >= SIMILARITY_THRESHOLD:
            results.append(
                PhotoSearchResult(
                    photo=PhotoResponse(
                        id=photo.id,
                        url=photo.url,
                        thumbnailUrl=photo.thumbnailUrl,
                        faceCount=photo.faceCount,
                        width=photo.width,
                        height=photo.height,
                        createdAt=photo.createdAt,
                        eventId=photo.eventId,
                    ),
                    similarity=round(max_sim, 4),
                )
            )

    # Sort by similarity descending
    # Sort by similarity descending
    results.sort(key=lambda x: x.similarity, reverse=True)
    return results


@router.post("/public/face", response_model=List[PhotoSearchResult])
async def search_by_face_public(
    event_id: str = Form(...),
    file: UploadFile = File(...)
):
    """Public endpoint for guests to find their photos in a specific event."""
    file_bytes = await file.read()

    # Extract face embedding from selfie
    selfie_embeddings = get_face_embeddings(file_bytes)
    if not selfie_embeddings:
        raise HTTPException(status_code=400, detail="No face detected in the image")

    selfie_embedding = selfie_embeddings[0]  # Use first face

    # Ensure event exists and is not deleted
    event = await db.event.find_unique(where={"id": event_id})
    if not event or event.status == "DELETED":
        raise HTTPException(status_code=404, detail="Event not found")

    # Query photos WITH face embeddings in THIS event
    photos = await db.photo.find_many(where={"eventId": event_id, "faceCount": {"gt": 0}})

    # Compare embeddings
    results = []
    for photo in photos:
        if not photo.faceEmbeddings:
            continue
        embeddings = photo.faceEmbeddings
        if not isinstance(embeddings, list):
            continue

        max_sim = 0.0
        for emb in embeddings:
            sim = cosine_similarity(selfie_embedding, emb)
            max_sim = max(max_sim, sim)

        if max_sim >= SIMILARITY_THRESHOLD:
            results.append(
                PhotoSearchResult(
                    photo=PhotoResponse(
                        id=photo.id,
                        url=photo.url,
                        thumbnailUrl=photo.thumbnailUrl,
                        faceCount=photo.faceCount,
                        width=photo.width,
                        height=photo.height,
                        createdAt=photo.createdAt,
                        eventId=photo.eventId,
                    ),
                    similarity=round(max_sim, 4),
                )
            )

    # Sort by similarity descending
    results.sort(key=lambda x: x.similarity, reverse=True)
    return results
