# 🚀 Deployment Guide - BookStacker

Follow these steps to deploy your full-stack Library Management System.

## 1. Backend (Render)

### Environment Variables
In your Render Dashboard under **Environment**, add the following:
- `SECRET_KEY`: A secure random string.
- `DEBUG`: `False`
- `FIREBASE_SERVICE_ACCOUNT_JSON`: **(Recommended)** Copy the entire content of your `serviceAccountKey.json` and paste it here as a single string.

### Settings
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn wsgi:app`

## 2. Frontend (Vercel)

### Environment Variables
In Vercel Dashboard, add:
- `VITE_API_URL`: `https://your-backend-url.onrender.com/api`

### Settings
- **Root Directory:** `frontend`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

## 3. Firebase Setup

### Storage (Thumbnails & PDFs)
1. Go to **Firebase Console** -> **Storage**.
2. Click **Get Started** and follow instructions.
3. Update your storage bucket name in `backend/app/firebase/__init__.py` if it's different from `bookstacker0.firebasestorage.app`.

### Authentication
1. Go to **Firebase Console** -> **Authentication**.
2. Enable **Email/Password** provider.

### Firestore
1. Go to **Firebase Console** -> **Firestore Database**.
2. Create collections: `books`, `loans`, `reservations`, `users`, `notifications`.

## 4. Local Testing
To test the backend locally:
```bash
cd backend
# Create a virtual environment and install dependencies
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
# Run the server
python wsgi.py
```

To test the frontend locally:
```bash
cd frontend
npm install
npm run dev
```

---
**Note:** Ensure `serviceAccountKey.json` is never pushed to public repositories.
