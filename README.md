# AI Photo Event Platform

A complete full-stack AI-powered photo sharing platform inspired by Kwikpic. The platform features an enhanced premium SaaS glassmorphic UI, allowing users to create events, upload photo galleries, and instantly find themselves in massive galleries using AI facial recognition.

## 🚀 Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN UI + Glassmorphism Aesthetics
- **Animations**: Framer Motion
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI (Python 3.10+)
- **Database**: MongoDB (motor async driver)
- **AI Face Tech**: DeepFace (Facenet Model) & OpenCV
- **Storage**: Cloudinary
- **Auth**: JWT (PyJWT + Passlib Bcrypt)

---

## 🛠️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Python (3.10+)
- MongoDB (Running locally on `mongodb://localhost:27017` or Atlas URI)
- Cloudinary Account (API Keys)

### 2. Configure Environment Variables
Copy the `.env.example` file to `.env` in the root and fill in your details:
```env
# Root /.env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=kwikpic_clone

JWT_SECRET_KEY=your_super_secret_key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Start Backend (FastAPI + DeepFace)
Navigate to `backend/` folder:
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # (Windows)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
*Note: The first time you upload a photo or selfie, DeepFace will download the Facenet weights (around 90MB) automatically in the background.*

### 4. Start Frontend (Next.js)
Navigate to `frontend/` folder:
```bash
cd frontend
npm install
npm run dev
```

### 5. Access the Platform
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## ✨ Features Implemented
* **Smart Face Search**: Upload a selfie to locate all matching photos in an event using DeepFace cosine similarity.
* **Event Galleries**: Masonry grid layouts with Pinterest-style hover effects.
* **JWT Auth**: Full access-controlled dashboard and features.
* **Premium Design**: Dark mode compatibility, framer-motion transitions, and Tailwind glassmorphism.
* **Cloud Storage**: Automatic Cloudinary media uploading.
