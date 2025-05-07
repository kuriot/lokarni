from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend import models

PROTECTED_TITLES = ["General", "All Assets", "Favorites"]

def get_categories(db: Session):
    return db.query(models.Category).order_by(models.Category.order).all()

def get_category(db: Session, category_id: int):
    return db.query(models.Category).filter(models.Category.id == category_id).first()

def create_category(db: Session, title: str, order: int):
    existing = db.query(models.Category).filter(models.Category.title == title).first()
    if existing:
        return existing  # Bestehende Kategorie zurückgeben
    category = models.Category(title=title, order=order)
    db.add(category)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(category)
    return category

def update_category(db: Session, category_id: int, title: str, order: int):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category and category.title not in PROTECTED_TITLES:
        category.title = title
        category.order = order
        db.commit()
        db.refresh(category)
    return category

def delete_category(db: Session, category_id: int):
    category = db.query(models.Category).filter(models.Category.id == category_id).first()
    if category and category.title not in PROTECTED_TITLES:
        db.delete(category)
        db.commit()
        return category
    return None

def add_subcategory(db: Session, category_id: int, name: str, icon: str, order: int):
    subcat = models.SubCategory(
        name=name,
        icon=icon,
        order=order,
        category_id=category_id
    )
    db.add(subcat)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise
    db.refresh(subcat)
    return subcat

def update_subcategory(db: Session, subcat_id: int, name: str, icon: str, order: int):
    subcat = db.query(models.SubCategory).filter(models.SubCategory.id == subcat_id).first()
    parent = subcat.category if subcat else None
    if subcat and (subcat.name not in PROTECTED_TITLES and parent.title not in PROTECTED_TITLES):
        subcat.name = name
        subcat.icon = icon
        subcat.order = order
        db.commit()
        db.refresh(subcat)
    return subcat

def delete_subcategory(db: Session, subcat_id: int):
    subcat = db.query(models.SubCategory).filter(models.SubCategory.id == subcat_id).first()
    parent = subcat.category if subcat else None
    if subcat and (subcat.name not in PROTECTED_TITLES and parent.title not in PROTECTED_TITLES):
        db.delete(subcat)
        db.commit()
        return subcat
    return None
