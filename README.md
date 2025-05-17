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
- **Favorites & Categories:** Mark and structure assets
- **Search & Filter:** Find assets quickly
- **Modern Frontend:** React + Tailwind + Vite
- **API-first Backend:** FastAPI + SQLite
---

## ⚡️ Quickstart

1. **Requirements:**
   - Python 3.10+
   - Node.js 18+ & npm



2. **Install in first time (important):**
- Run backend_start.bat
- Run frontend_start.bat
- On first start, all required dependencies are automatically downloaded and installed.

   ```
   - Frontend: http://localhost:5173  
   - Backend API: http://localhost:8000


3. **To start:**  
   - Run `start_lokarni.bat` (Windows).  
     → This automatically starts backend & frontend and opens the app in your browser.
     
---

## 📦 Content Types

- **Models:** (e.g. LORA, Checkpoint, VAE) incl. version, base model, trigger words
- **Images/Videos:** With prompts, resources, tags, and preview
- **ZIPs:** Contain `assets.json` + media files

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
