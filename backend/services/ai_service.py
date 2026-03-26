import cv2
import numpy as np
from deepface import DeepFace
from typing import List

def get_face_embeddings(image_bytes: bytes) -> List[List[float]]:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    try:
        # First try with enforce_detection=True for accurate results
        results = DeepFace.represent(
            img_path=img, 
            model_name="Facenet", 
            enforce_detection=True,
            detector_backend="opencv"
        )
        # Filter out low-confidence detections
        embeddings = [
            res["embedding"] for res in results 
            if res.get("face_confidence", 1.0) > 0.7
        ]
        return list(embeddings) if embeddings else []
    except Exception as e:
        print("Face extraction error:", e)
        return []

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    v1 = np.array(vec1)
    v2 = np.array(vec2)
    norm1 = np.linalg.norm(v1)
    norm2 = np.linalg.norm(v2)
    if norm1 == 0 or norm2 == 0:
        return 0.0
    return float(np.dot(v1, v2) / (norm1 * norm2))
