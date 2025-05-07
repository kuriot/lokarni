from sqlalchemy.orm import Session
from sqlalchemy import or_
from backend import models, schemas

# 🔍 Hilfsfunktion zur automatischen Subkategorie-Zuweisung
def auto_assign_subcategory(db: Session, asset_data: schemas.AssetCreate):
    subcategories = db.query(models.SubCategory).all()

    # Alle relevanten Textfelder durchsuchen
    search_text = " ".join([
        asset_data.name,
        asset_data.description,
        asset_data.tags,
        asset_data.trigger_words,
        asset_data.positive_prompt,
        asset_data.negative_prompt,
        asset_data.used_resources,
        asset_data.slug,
        asset_data.creator,
        asset_data.base_model,
    ]).lower()

    for sub in subcategories:
        if sub.name.lower() in search_text:
            return sub.id  # Erste passende Subkategorie-ID zurückgeben

    return None  # Keine passende gefunden

# Alle Assets abrufen (optional gefiltert nach Kategorie)
def get_assets_by_category(db: Session, category: str = "All"):
    if category == "All":
        return db.query(models.Asset).all()
    return db.query(models.Asset).filter(models.Asset.tags.contains(category)).all()

# Ein einzelnes Asset abrufen (z. B. für Details oder Bearbeitung)
def get_asset(db: Session, asset_id: int):
    return db.query(models.Asset).filter(models.Asset.id == asset_id).first()

# Asset erstellen
def create_asset(db: Session, asset: schemas.AssetCreate):
    # 🧠 Automatische Subkategorie-Zuweisung
    if asset.subcategory_id is None:
        subcat_id = auto_assign_subcategory(db, asset)
        asset.subcategory_id = subcat_id

    new_asset = models.Asset(**asset.dict())
    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

# Asset aktualisieren
def update_asset(db: Session, asset_id: int, updates: schemas.AssetUpdate):
    asset = get_asset(db, asset_id)
    if not asset:
        return None
    for key, value in updates.dict(exclude_unset=True).items():
        setattr(asset, key, value)
    db.commit()
    db.refresh(asset)
    return asset

# Asset löschen
def delete_asset(db: Session, asset_id: int):
    asset = get_asset(db, asset_id)
    if asset:
        db.delete(asset)
        db.commit()
    return asset

# Favoritenstatus umschalten
def toggle_favorite(db: Session, asset_id: int):
    asset = get_asset(db, asset_id)
    if asset:
        asset.is_favorite = not asset.is_favorite
        db.commit()
        db.refresh(asset)
    return asset
