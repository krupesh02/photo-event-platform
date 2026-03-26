import os
import io
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from googleapiclient.http import MediaIoBaseUpload

# Load credentials and folder ID from env (or default to empty if not set)
import dotenv
dotenv.load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', '.env'))

# Path to credentials.json relative to this file (backend/services/drive_service.py -> backend/credentials.json)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CREDENTIALS_FILE = os.path.join(BASE_DIR, "credentials.json")
FOLDER_ID = os.getenv("GOOGLE_DRIVE_FOLDER_ID", "")

# Scopes must match the ones used in setup_drive.py
SCOPES = ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.metadata.readonly']

def get_drive_service():
    """Authenticates using token.json and returns the Google Drive API service."""
    creds = None
    token_path = os.path.join(BASE_DIR, 'token.json')
    
    if os.path.exists(token_path):
        creds = Credentials.from_authorized_user_file(token_path, SCOPES)
        
    # If there are no (valid) credentials available, we can't proceed automatically.
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            try:
                creds.refresh(Request())
                with open(token_path, 'w') as token:
                    token.write(creds.to_json())
            except Exception as e:
                print(f"ERROR: Could not refresh token: {e}")
                return None
        else:
            print("ERROR: token.json not found or invalid. Please run 'python setup_drive.py' first.")
            return None

    service = build('drive', 'v3', credentials=creds)
    return service

def upload_to_drive(file_bytes: bytes, filename: str, mime_type: str = 'image/jpeg'):
    """
    Uploads a file to a specific Google Drive folder and makes it public.
    Returns a dict with url (direct image link) and Public ID (Drive file ID).
    """
    service = get_drive_service()
    if not service:
        # Fallback or error indication if credentials aren't set
        raise Exception("Google Drive credentials not configured.")

    if not FOLDER_ID:
        raise Exception("GOOGLE_DRIVE_FOLDER_ID is not configured in .env")

    # Metadata for the file (name and parent folder)
    file_metadata = {
        'name': filename,
        'parents': [FOLDER_ID]
    }
    
    # File content wrapped in a file-like object
    fh = io.BytesIO(file_bytes)
    media = MediaIoBaseUpload(fh, mimetype=mime_type, resumable=True)
    
    # Upload the file
    print(f"DEBUG: Starting Google Drive upload for {filename}...")
    try:
        file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id, webViewLink, webContentLink, thumbnailLink'
        ).execute()
    except Exception as e:
        print(f"DEBUG: API Create call failed: {str(e)}")
        raise e
    
    file_id = file.get('id')
    
    # Make the file public so it can be viewed on the web
    permission = {
        'type': 'anyone',
        'role': 'reader'
    }
    service.permissions().create(
        fileId=file_id,
        body=permission,
        fields='id'
    ).execute()
    
    # Use lh3.googleusercontent.com for direct image serving (no redirects)
    embed_url = f"https://lh3.googleusercontent.com/d/{file_id}"
    thumbnail_url = f"https://lh3.googleusercontent.com/d/{file_id}=s400"
    
    print(f"DEBUG: Upload success! URL: {embed_url}")
    
    # Return similar structure to Cloudinary payload
    return {
        "secure_url": embed_url,
        "public_id": file_id,
        "thumbnail_url": thumbnail_url
    }

def delete_from_drive(file_id: str):
    """
    Deletes a file from Google Drive using its file_id (which is saved as publicId).
    """
    service = get_drive_service()
    if not service:
        return {"result": "error", "message": "Drive service not configured"}
        
    try:
        service.files().delete(fileId=file_id).execute()
        return {"result": "ok"}
    except Exception as e:
        print(f"Error deleting from Google Drive: {e}")
        return {"result": "error", "message": str(e)}
