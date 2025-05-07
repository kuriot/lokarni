from sqlalchemy.orm import Session
from . import models

def get_assets_by_category(db: Session, category: str):
    if category == "All":
        return db.query(models.Asset).all()
    return db.query(models.Asset).filter(models.Asset.type == category).all()
