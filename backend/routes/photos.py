from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from typing import List
import math
import json as json_module
from prisma import Json
from models.photo import PhotoResponse, PaginatedPhotos
from routes.auth import get_current_user
from services.cloud_service import upload_image, delete_image
from services.ai_service import get_face_embeddings
from database import db

router = APIRouter()


@router.post("/upload", response_model=PhotoResponse)
async def upload_photo(
    event_id: str = Form(...),
    file: UploadFile = File(...),
    current_user=Depends(get_current_user),
):
    # Verify event exists
    event = await db.event.find_unique(where={"id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    # Read file bytes
    file_bytes = await file.read()

    # Upload to Cloudinary (COMMENTED OUT FOR GOOGLE DRIVE)
    # result = upload_image(file_bytes, folder=f"photoai/events/{event_id}")
    # if not result:
    #     raise HTTPException(status_code=500, detail="Upload failed")

    # Upload to Google Drive
    from services.drive_service import upload_to_drive
    try:
        filename = file.filename if file.filename else "image.jpg"
        mime_type = file.content_type if file.content_type else "image/jpeg"
        drive_res = upload_to_drive(file_bytes, filename=filename, mime_type=mime_type)
        result = {
            "url": drive_res["secure_url"],
            "public_id": drive_res["public_id"],
            "thumbnail_url": drive_res["thumbnail_url"],
            "width": None,
            "height": None
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Google Drive upload failed: {str(e)}")

    # Extract face embeddings
    embeddings = get_face_embeddings(file_bytes)

    # Set cover URL if event has none
    if not event.coverUrl:
        await db.event.update(
            where={"id": event_id}, data={"coverUrl": result["url"]}
        )

    # Save photo to DB
    photo = await db.photo.create(
        data={
            "url": result["url"],
            "publicId": result.get("public_id"),
            "thumbnailUrl": result.get("thumbnail_url", result["url"]),
            "faceEmbeddings": Json(embeddings) if embeddings else None,
            "faceCount": len(embeddings) if embeddings else 0,
            "width": result.get("width"),
            "height": result.get("height"),
            "event": {"connect": {"id": event_id}},
            "uploadedBy": {"connect": {"id": current_user.id}},
        }
    )

    return PhotoResponse(
        id=photo.id,
        url=photo.url,
        thumbnailUrl=photo.thumbnailUrl,
        faceCount=photo.faceCount,
        width=photo.width,
        height=photo.height,
        createdAt=photo.createdAt,
        eventId=photo.eventId,
    )


@router.get("/event/{event_id}", response_model=PaginatedPhotos)
async def get_event_photos(
    event_id: str,
    page: int = 1,
    page_size: int = 20,
    current_user=Depends(get_current_user),
):
    skip = (page - 1) * page_size

    total = await db.photo.count(where={"eventId": event_id})
    photos = await db.photo.find_many(
        where={"eventId": event_id},
        skip=skip,
        take=page_size,
        order={"createdAt": "desc"},
    )

    return PaginatedPhotos(
        photos=[
            PhotoResponse(
                id=p.id,
                url=p.url,
                thumbnailUrl=p.thumbnailUrl,
                faceCount=p.faceCount,
                width=p.width,
                height=p.height,
                createdAt=p.createdAt,
                eventId=p.eventId,
            )
            for p in photos
        ],
        total=total,
        page=page,
        pageSize=page_size,
        totalPages=math.ceil(total / page_size) if total > 0 else 0,
    )


@router.delete("/{photo_id}")
async def delete_photo(photo_id: str, current_user=Depends(get_current_user)):
    photo = await db.photo.find_unique(where={"id": photo_id})
    if not photo:
        raise HTTPException(status_code=404, detail="Photo not found")

    # Delete from Cloudinary (COMMENTED OUT FOR GOOGLE DRIVE)
    # if photo.publicId:
    #     delete_image(photo.publicId)

    # Delete from Google Drive
    from services.drive_service import delete_from_drive
    if photo.publicId:
        delete_from_drive(photo.publicId)

    # Delete from DB
    await db.photo.delete(where={"id": photo_id})
    return {"message": "Photo deleted"}
