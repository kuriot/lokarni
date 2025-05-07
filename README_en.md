# 🇬🇧 LokArni – README (English)

**LokArni** is your local library for AI-related content like models, images, prompts, videos and more.

## 🚀 Features
- Import, manage, search and favorite your assets
- CivitAI integration for direct model import
- ZIP import (via `assets.json` + media)
- SQLite database & FastAPI backend
- React frontend with category-based sidebar

## 🛠️ Local Startup
```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload
cd frontend
npm install
npm run dev
```

## 📁 Structure
- `backend/` with API, DB, and models
- `frontend/` with React components
- `import/images/` for media files
- `.db` & `.gitignore` included

## 📌 Note
Category “General” contains “All Assets” & “Favorites” → protected and fixed.

See **Quickstart** for full guidance.
