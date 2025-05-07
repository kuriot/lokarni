from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os

import backend.database as database
import backend.models as models
from backend.database import get_db
from backend.crud import category as cat_crud
from backend.routes import (
    civitai_import,
    civitai_test,
    asset_routes,
    category_routes,
    upload_routes,
    import_zip_route
)

app = FastAPI()

# 🌐 CORS aktivieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🗂️ Datenbanktabellen erstellen
database.Base.metadata.create_all(bind=database.engine)

# 🧠 Kategorien initialisieren (bei Erststart)
def initialize_categories():
    db: Session = next(get_db())
    try:
        existing = cat_crud.get_categories(db)

        # 👉 Systemkategorie „General“ + feste Unterkategorien anlegen
        if not any(cat.title == "General" for cat in existing):
            general = cat_crud.create_category(db, "General", 0)
            cat_crud.add_subcategory(db, general.id, "All Assets", "Grid", 0)
            cat_crud.add_subcategory(db, general.id, "Favorites", "Star", 1)

        # 👉 Nur wenn keine weiteren Kategorien vorhanden sind, Starter-Struktur anlegen
        user_defined = [cat for cat in existing if cat.title != "General"]

        if not user_defined:
            starter_structure = [
                {
                    "title": "Models",
                    "order": 1,
                    "subcategories": [
                        {"name": "Checkpoint", "icon": "Server", "order": 1},
                        {"name": "LoRA", "icon": "Link", "order": 2},
                        {"name": "Textual Inversion", "icon": "Quote", "order": 3},
                        {"name": "VAE", "icon": "Package", "order": 4},
                    ]
                },
                {
                    "title": "Styles",
                    "order": 2,
                    "subcategories": [
                        {"name": "Anime", "icon": "Image", "order": 1},
                        {"name": "Realistic", "icon": "Camera", "order": 2},
                        {"name": "Cartoon", "icon": "Smile", "order": 3},
                        {"name": "Painting", "icon": "Brush", "order": 4},
                        {"name": "3D", "icon": "Cube", "order": 5},
                    ]
                },
                {
                    "title": "Concepts",
                    "order": 3,
                    "subcategories": [
                        {"name": "Character", "icon": "User", "order": 1},
                        {"name": "Object", "icon": "Circle", "order": 2},
                        {"name": "Scene", "icon": "Landmark", "order": 3},
                        {"name": "Effect", "icon": "Sparkles", "order": 4},
                    ]
                },
                {
                    "title": "Tools",
                    "order": 4,
                    "subcategories": [
                        {"name": "Pose", "icon": "Move", "order": 1},
                        {"name": "Workflow", "icon": "Repeat", "order": 2},
                        {"name": "Inpainting", "icon": "Eraser", "order": 3},
                        {"name": "ControlNet", "icon": "SlidersHorizontal", "order": 4},
                    ]
                },
                {
                    "title": "Media",
                    "order": 5,
                    "subcategories": [
                        {"name": "Image", "icon": "Image", "order": 1},
                        {"name": "Video", "icon": "Video", "order": 2},
                        {"name": "GIF", "icon": "PlayCircle", "order": 3},
                    ]
                }
            ]

            for cat in starter_structure:
                new_cat = cat_crud.create_category(db, cat["title"], cat["order"])
                for sub in cat["subcategories"]:
                    cat_crud.add_subcategory(
                        db,
                        new_cat.id,
                        sub["name"],
                        sub["icon"],
                        sub["order"]
                    )

        db.commit()
    finally:
        db.close()

# 🔁 Kategorien initialisieren
initialize_categories()

# 🖼️ Medien-Ordner mounten
app.mount("/import/images", StaticFiles(directory=os.path.join("import", "images")), name="import-images")

# 📡 API-Routen registrieren
app.include_router(asset_routes.router, prefix="/api/assets", tags=["Assets"])
app.include_router(category_routes.router, prefix="/api/categories", tags=["Categories"])
app.include_router(civitai_import.router, prefix="/api/import", tags=["Import"])
app.include_router(civitai_test.router, prefix="/api/test", tags=["Test"])
app.include_router(upload_routes.router, prefix="/api", tags=["Upload"])
app.include_router(import_zip_route.router, prefix="/api", tags=["ZIP Import"])
