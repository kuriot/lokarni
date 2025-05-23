# LokArni

![Version](https://img.shields.io/badge/version-2.6.5-blue)
![License](https://img.shields.io/badge/license-CC%20BY--NC%204.0-green)
![Python](https://img.shields.io/badge/python-3.10+-blue)
![React](https://img.shields.io/badge/react-18.2.0-61dafb)

**LokArni** is a powerful, locally-hosted fullstack web application for organizing, visualizing, and managing AI-related content. Centrally store, search, categorize, and efficiently reuse models (LoRAs, Checkpoints, VAEs), images, videos, and associated metadata.

---

## 🚀 Key Features

### **🎨 Asset Management**
- **Smart Organization**: Dynamic categories and subcategories with drag-and-drop reordering
- **Rich Media Support**: Images, videos, and models with preview capabilities
- **Advanced Search**: Full-text search with keyword suggestions and filters
- **Favorites System**: Mark and organize your most-used assets
- **Linked Assets**: Connect related assets as examples and showcases
- **NSFW Filtering**: Content filtering with granular control

### **📥 Import & Integration**
- **CivitAI Integration**: Direct import from CivitAI URLs with metadata extraction
- **CivitAI Search**: Built-in search interface for discovering new models
- **Image Metadata Extraction**: Extract generation parameters from PNG files and CivitAI images
- **Bulk Operations**: Efficient handling of multiple assets
- **Manual Entry**: Comprehensive form for custom asset creation

### **🔍 Advanced Features**
- **Multi-Layout Views**: Grid and masonry layouts with responsive design
- **Custom Metadata**: Extensible custom fields for specialized data
- **Asset Linking**: Create relationships between related assets
- **Pagination**: Efficient handling of large asset collections
- **Real-time Updates**: Live updates across all views and components

### **💻 Modern Interface**
- **Dark Theme**: Eye-friendly dark interface with glassmorphism effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Interactive Components**: Smooth animations and hover effects
- **Modal System**: Detailed asset views with tabbed information
- **Asset Tabs**: Multi-asset viewing with browser-like tabs

---

## 🛠️ Technology Stack

### **Frontend**
- **React 18.2** with modern hooks and context
- **Vite** for fast development and building
- **TailwindCSS** for responsive styling
- **Framer Motion** for smooth animations
- **Lucide React** for consistent iconography
- **Radix UI** components for accessibility

### **Backend**
- **FastAPI** with async/await support
- **SQLAlchemy** ORM with Alembic migrations
- **SQLite** database for simplicity
- **Pydantic** for data validation
- **PIL/Pillow** for image processing
- **Requests/HTTPX** for external API integration

---

## ⚡ Quick Start

### **Prerequisites**
- Python 3.10 or higher
- Node.js 18+ with npm
- Git (optional, for cloning)

### **Installation**

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd lokarni
   ```

2. **First-time setup (Automatic)**
   
   **Windows:**
   ```batch
   # Start backend (installs dependencies automatically)
   Start_Backend.bat
   
   # In a new terminal, start frontend
   Start_Frontend.bat
   ```

   **Manual setup:**
   ```bash
   # Backend setup
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend setup
   cd frontend
   npm install
   cd ..
   
   # Start backend
   python -m uvicorn backend.main:app --port 8000 --reload
   
   # In new terminal, start frontend
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### **Quick Launch (After Setup)**
- **Windows**: Run `start_lokarni.bat` to start both services
- **Manual**: Start backend and frontend in separate terminals

---

## 📚 Usage Guide

### **Getting Started**
1. **Add Your First Asset**: Click the "Add" button in the sidebar
2. **Choose Import Method**: 
   - Manual entry for custom assets
   - CivitAI link for direct model import
   - CivitAI search for discovery
   - Image upload with metadata extraction
3. **Organize**: Create custom categories and subcategories
4. **Search & Filter**: Use the search function to find specific assets

### **Import Methods**

#### **CivitAI Integration**
- Paste any CivitAI model or image URL
- Automatically extracts metadata, images, and descriptions
- Optional API key for NSFW content access
- Bulk search and import capabilities

#### **Image Metadata Extraction**
- Upload PNG files with embedded generation parameters
- Supports ComfyUI workflow extraction
- CivitAI image URL processing
- Automatic prompt and settings detection

#### **Manual Entry**
- Custom forms for all asset types
- Rich text descriptions with HTML support
- Multiple media file uploads
- Flexible tagging system

### **Organization Features**
- **Categories**: Main groupings (Models, Styles, Concepts, etc.)
- **Subcategories**: Detailed classifications with custom icons
- **Tags**: Flexible keyword system
- **Favorites**: Quick access to preferred assets
- **Linked Assets**: Connect related items as examples

---

## 🎯 Asset Types & Content

LokArni supports a wide variety of AI-related content:

### **Models & Weights**
- **Checkpoints**: Full stable diffusion models
- **LoRA**: Low-rank adaptation models
- **Textual Inversions**: Embedding files
- **VAE**: Variational autoencoders
- **ControlNet**: Control models
- **Hypernetworks**: Legacy training method

### **Visual Content**
- **Generated Images**: With full generation metadata
- **Videos**: MP4, WebM format support
- **GIFs**: Animated content
- **Reference Images**: Style and concept references

### **Metadata & Information**
- **Generation Parameters**: Steps, CFG, samplers
- **Prompts**: Positive and negative prompts
- **Trigger Words**: Model activation keywords
- **Used Resources**: LoRAs, embeddings, etc.
- **Custom Fields**: Extensible metadata system

---

## 🔧 Configuration

### **Environment Setup**
- Database: SQLite (configurable in `backend/database.py`)
- Storage: Local file system (`import/images/`)
- API Keys: CivitAI integration (optional)

### **Customization**
- **Categories**: Fully customizable structure
- **UI Themes**: Dark theme with customizable colors
- **Layout Options**: Grid vs. masonry layouts
- **Content Filtering**: NSFW and type filtering

---

## 🚦 API Reference

LokArni provides a comprehensive REST API:

### **Main Endpoints**
- `GET /api/assets` - List all assets
- `POST /api/assets` - Create new asset
- `GET /api/assets/{id}` - Get specific asset
- `PATCH /api/assets/{id}` - Update asset
- `DELETE /api/assets/{id}` - Delete asset
- `GET /api/assets/search` - Search assets
- `GET /api/categories` - List categories
- `POST /api/import/from-civitai` - Import from CivitAI

### **Special Features**
- `GET /api/assets/keywords` - Get popular tags
- `POST /api/image/extract-metadata/` - Extract image metadata
- `POST /api/upload-image` - Upload media files

Full API documentation available at `/docs` when running.

---

## 🔄 Migration & Updates

### **Database Migrations**
LokArni uses Alembic for database schema management:
```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head
```

### **Data Management**
- **Export**: Use the settings menu for data export options
- **Backup**: Copy the `loklarni.db` file and `import/` folder
- **Restore**: Replace database and media files with backups

---

## 🛡️ Privacy & Security

- **Local-First**: All data stays on your machine
- **No Telemetry**: No data collection or tracking
- **API Keys**: Optional, stored locally only
- **Content Filtering**: Built-in NSFW filtering
- **Access Control**: Local network access only

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### **Areas for Contribution**
- New import methods and integrations
- UI/UX improvements
- Performance optimizations
- Documentation and tutorials
- Bug fixes and testing

### **Coding Standards**
- **Python**: Follow PEP 8, use type hints
- **JavaScript/React**: ESLint configuration
- **Git**: Descriptive commit messages
- **Documentation**: Update relevant docs

---

## 🐛 Troubleshooting

### **Common Issues**

**Backend won't start:**
- Check Python version (3.10+ required)
- Verify virtual environment activation
- Install dependencies: `pip install -r requirements.txt`

**Frontend issues:**
- Ensure Node.js 18+ is installed
- Clear node_modules: `rm -rf node_modules && npm install`
- Check port conflicts (5173, 8000)

**Import problems:**
- Verify CivitAI URL format
- Check API key for NSFW content
- Ensure stable internet connection

**Database errors:**
- Run migrations: `alembic upgrade head`
- Check file permissions
- Consider database reset for major issues

---

## 📋 Changelog

### **Version 2.6.5** (Current)
- Performance improvements and bug fixes
- Enhanced image metadata extraction
- Improved CivitAI integration stability

### **Version 2.6.0**
- Major release with performance updates
- New asset linking system
- Enhanced search capabilities

### **Version 2.5.0**
- Improved UI/UX and usability
- Better responsive design
- Performance optimizations

### **Version 2.0.0**
- Complete rewrite with modern stack
- New React-based frontend
- Enhanced FastAPI backend

---

## 📄 License

**Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**

You are free to:
- **Share** — copy and redistribute the material
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — Give appropriate credit and indicate changes
- **NonCommercial** — No commercial use without permission

For commercial use, please contact the author.

**Full License**: [https://creativecommons.org/licenses/by-nc/4.0/](https://creativecommons.org/licenses/by-nc/4.0/)

---

## 👥 Authors & Contributors

### **Creator**
**Arni (Pixel-Arni)** - *Project Creator & Lead Developer*
- GitHub: [@Pixel-Arni](https://github.com/Pixel-Arni)
- Support: [Ko-fi](https://ko-fi.com/cranic) | [Patreon](https://www.patreon.com/c/Arni_Cranic)

### **Contributors**
**Astroburner** - *Information Specialist & Development Consultant*
- Specializes in AI creative workflows and technical documentation
- GitHub: [@Astroburner](https://github.com/Astroburner)
- CivitAI: [Profile](https://civitai.com/user/Astroburner)

---

## 🌟 Support & Community

### **Get Help**
- 📞 **Discord**: [Join our community](https://discord.gg/Y42PRC3ffp)
- 🐛 **Issues**: Report bugs on GitHub
- 💡 **Features**: Request features via GitHub issues

### **Support Development**
If you find LokArni useful, consider supporting its development:
- ☕ **Ko-fi**: [One-time donations](https://ko-fi.com/cranic)
- 🔄 **Patreon**: [Monthly support](https://www.patreon.com/c/Arni_Cranic)
- ⭐ **GitHub**: Star the repository
- 🗣️ **Share**: Tell others about LokArni

### **Stay Connected**
- 🎮 **Twitch**: [Live development streams](https://www.twitch.tv/cranic)
- 📸 **Instagram**: [@arni_cranic](https://www.instagram.com/arni_cranic/)
- 🎵 **TikTok**: [@cranic92](https://www.tiktok.com/@cranic92)

---

**Built with 💜 by the community, for the community.**

*LokArni - Your personal AI asset management solution*
