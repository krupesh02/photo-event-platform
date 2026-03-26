import cloudinary
import cloudinary.uploader
from core.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True,
)


def upload_image(file_bytes: bytes, folder: str = "photoai") -> dict:
    """Upload image bytes to Cloudinary and return result dict."""
    try:
        result = cloudinary.uploader.upload(
            file_bytes,
            folder=folder,
            resource_type="image",
            transformation=[
                {"quality": "auto", "fetch_format": "auto"},
            ],
        )
        return {
            "url": result["secure_url"],
            "public_id": result["public_id"],
            "thumbnail_url": cloudinary.utils.cloudinary_url(
                result["public_id"],
                width=400,
                height=400,
                crop="fill",
                quality="auto",
            )[0],
            "width": result.get("width"),
            "height": result.get("height"),
        }
    except Exception as e:
        print(f"Cloudinary upload error: {e}")
        return None


def delete_image(public_id: str) -> bool:
    """Delete image from Cloudinary by public_id."""
    try:
        result = cloudinary.uploader.destroy(public_id)
        return result.get("result") == "ok"
    except Exception as e:
        print(f"Cloudinary delete error: {e}")
        return False
