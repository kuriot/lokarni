![Lokarni Logo](./lokarni_logo.png)

# LokArni

**LokArni** is a locally hosted fullstack web application for organizing, visualizing, and reusing AI-related content.  
You can centrally store, search, categorize, and soon directly edit models (e.g., LORAs, Checkpoints), images, videos, and associated metadata.

---

## 💡 Project Goal

LokArni is designed for developers, artists, and researchers working with generative AI systems who want to systematically manage their content.  
For each stored asset (such as a LORA model, image, or video), all relevant information can be saved:

- Prompts, trigger words, and used resources
- Version, creator, and base model
- Preview and media files for instant viewing
- Copyable information to reuse in your own projects

With this, LokArni becomes your personal **AI knowledge and media library**.

---

## 🚀 Features (Selection)

- **Media Library:** Organize AI assets such as models, images, videos, and metadata
- **CivitAI Import:** Import models and metadata directly from CivitAI
- **ZIP Import/Export:** Import and export assets and media as ZIP archives
- **Favorites & Categories:** Mark and structure assets
- **Search & Filter:** Find assets quickly
- **Modern Frontend:** React + Tailwind + Vite
- **API-first Backend:** FastAPI + SQLite

---

## 🏗️ Project Structure

```
LokArni/
├── backend/         # FastAPI backend (API, DB, models)
├── frontend/        # React frontend (components, pages)
├── import/          # Media storage (e.g. images, videos)
├── start_lokarni.bat         # Starts frontend and backend automatically
├── frontend_start.bat        # Starts frontend only
├── backend_start.bat         # Starts backend only
├── requirements.txt          # Python dependencies
├── package.json              # Frontend dependencies
├── README.md / README_en.md  # Documentation
├── LokArni_Kurzeinstieg.md   # Quickstart guide (DE)
├── LICENSE
├── .gitignore
```

---

## ⚡️ Quickstart

1. **Requirements:**
   - Python 3.10+
   - Node.js 18+ & npm

2. **To start:**  
   - Run `start_lokarni.bat` (Windows).  
     → This automatically starts backend & frontend and opens the app in your browser.
   - On first start, all required dependencies are automatically downloaded and installed.

3. **Manual start (if needed):**
   ```bash
   # Backend
   cd backend
   python -m venv .venv
   .venv\Scripts\activate
   pip install -r ../requirements.txt
   uvicorn main:app --reload

   # Frontend
   cd frontend
   npm install
   npm run dev
   ```

   - Frontend: http://localhost:5173  
   - Backend API: http://localhost:8000

---

## 📦 Content Types

- **Models:** (e.g. LORA, Checkpoint, VAE) incl. version, base model, trigger words
- **Images/Videos:** With prompts, resources, tags, and preview
- **ZIPs:** Contain `assets.json` + media files

---

## 🔗 API Endpoints (Excerpt)

- `GET /api/assets` – List all assets
- `POST /api/assets` – Create new asset
- `GET /api/categories` – Fetch categories
- `POST /api/import/civitai` – Import from CivitAI
- `POST /api/import/zip` – ZIP import
- `POST /api/upload` – File upload

For the full API documentation, open `/docs` (Swagger) when the backend is running.

---

## 📝 Planned Features & To-dos

- [ ] **Improved user experience and error handling**

---

## 🤝 Contributing & Development

- Pull requests are welcome!
- Please open issues for bugs or feature requests.
- Code & PR style: Clear, documented, with descriptive commits.

---

## 📄 License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

You are free to:

- **Share** — copy and redistribute the material in any medium or format  
- **Adapt** — remix, transform, and build upon the material  

**Under the following terms:**

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.  
- **NonCommercial** — You may not use the material for commercial purposes without permission.

> For **commercial use**, please contact me first.

**Author**: Pixel-Arni (aka Cranic)  
**Full License**: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

**Enjoy using LokArni!**
