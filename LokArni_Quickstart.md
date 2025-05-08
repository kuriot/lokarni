Welcome to **LokArni** – your local media and information library for AI models, images, videos, prompts, and more!

---

## 🛠️ What can you do with LokArni?

- Store, search, and manage your own AI models (e.g. LORAs, Checkpoints)
- Import images & videos and enrich them with prompts, tags, and metadata
- Browse, sort, and mark content as favorites by category
- Import CivitAI models directly via link or ID
- Easily upload or export ZIP files with media & meta information

---

## 🚀 Quickstart

**Requirements:**  
- Python 3.10+  
- Node.js 18+ & npm

**Recommended first start sequence:**  
1. **Start the backend:**  
   Run `backend_start.bat` and wait until all dependencies are installed and the backend is ready.
2. **Start the frontend:**  
   Then run `frontend_start.bat` and wait until all npm dependencies are installed and the frontend is ready.
3. **Start the full app:**  
   Afterwards, you can run `start_lokarni.bat` as usual to start everything automatically and open the frontend in your browser.

> **Note:**  
> On first launch, backend and frontend dependencies must be installed once. Only after that the automated startup will work smoothly.

**Alternatively (e.g. on Linux/Mac):**

```bash
# Start backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r ../requirements.txt
uvicorn main:app --reload

# Start frontend
cd frontend
npm install
npm run dev
```

- Frontend: http://localhost:5173  
- Backend (API): http://localhost:8000

---

## 🧭 Application Structure

- **Frontend:** Modern UI with sidebar navigation
  - “Add” → Add content (manually, ZIP, CivitAI)
  - “Manage” → Browse, edit, delete assets
  - “Search” → Filter & keyword search for tags, prompts, etc.
  - “Settings” → API key, language, options (planned)

- **Backend:** FastAPI application with SQLite database
  - Routes for assets, categories, uploads, imports
  - Data models for structured content management

---

## 🗂️ Categories & Subcategories

LokArni organizes content into **categories** (e.g. “Models”, “Styles”) and **subcategories** (e.g. “Checkpoint”, “Lora”, “Concept”, “Style”).

Example structure:

```
Models
 ├── Checkpoint
 ├── Lora
 └── VAE

Concepts & Styles
 ├── Concept
 ├── Style
 └── Character
```

- When an asset is entered (with all information), the appropriate subcategory is **automatically determined from the information** (except title and description) – if a subcategory word is found in the data, it will be assigned.
- Default categories are created automatically at first start (including favorites)
- You can manage your own categories/subcategories through the frontend or backend (admin area planned)

---

## 📦 Content Types & Import

- **Models:** LORA, Checkpoint, VAE – incl. version, base model, trigger words
- **Images/Videos:** With prompts, resources, tags, preview
- **ZIP archive:** Contains `assets.json` + media (for backup or bulk import)
- **CivitAI link:** Direct import of models & metadata

---

## 📝 Planned Features

- Editable assets directly in the interface
- Improved user experience & error handling
- Settings panel and multilanguage (EN/DE)
- Admin area for category/asset management

---

## ❓ Notes & Help

- The app runs locally at `http://localhost:8000` (backend) and `http://localhost:5173` (frontend)
- Media is always stored under `/import/images/{type}`
- The SQLite database (`lokarni.db`) can be backed up or moved directly
- The CivitAI API key is stored in the frontend (settings panel planned)

For technical details, see the `README.md`.  
If you have questions or problems: open an issue on GitHub.

Enjoy your own AI media library! ✨