from . import models, database
from sqlalchemy.orm import Session

def create_dummy_assets():
    db: Session = next(database.get_db())

    # 💡 Kategorienstruktur initial einfügen
    from .crud import category as cat_crud

    structure = [
        {
            "title": "Modelle",
            "order": 1,
            "subcategories": [
                {"name": "Model", "icon": "Brain", "order": 1},
                {"name": "Checkpoint", "icon": "Server", "order": 2},
                {"name": "Lora", "icon": "Link", "order": 3},
                {"name": "Vae", "icon": "Package", "order": 4}
            ]
        },
        {
            "title": "Konzepte & Stile",
            "order": 2,
            "subcategories": [
                {"name": "Concept", "icon": "Sparkles", "order": 1},
                {"name": "Style", "icon": "Palette", "order": 2},
                {"name": "Charakter", "icon": "User", "order": 3},
                {"name": "Clothing", "icon": "Shirt", "order": 4}
            ]
        },
        {
            "title": "Spezialtools",
            "order": 3,
            "subcategories": [
                {"name": "Inpainting", "icon": "Eraser", "order": 1},
                {"name": "Poses", "icon": "Move", "order": 2},
                {"name": "Tools", "icon": "Wrench", "order": 3},
                {"name": "Video", "icon": "Video", "order": 4}
            ]
        }
    ]

    # 🧹 Bestehende entfernen (außer „Allgemein“)
    all_existing = cat_crud.get_categories(db)
    for cat in all_existing:
        if cat.title != "Allgemein":
            db.delete(cat)
    db.commit()

    # 🧱 Neue Struktur einfügen
    for cat in structure:
        new_cat = cat_crud.create_category(db, cat["title"], cat["order"])
        for sub in cat["subcategories"]:
            cat_crud.add_subcategory(
                db, new_cat.id, sub["name"], sub["icon"], sub["order"]
            )

    db.commit()

    # (Optional) Dummy-Assets
    # ...

    db.close()
