from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from backend.database import get_db
from backend import crud, schemas, models

router = APIRouter()

# Protected categories
PROTECTED_TITLES = ["General", "All Assets", "Favorites"]

# Get all categories
@router.get("/", response_model=list[schemas.Category])
def read_categories(db: Session = Depends(get_db)):
    return crud.category.get_categories(db)

# Create a new category
@router.post("/", response_model=schemas.Category)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    if category.title in PROTECTED_TITLES:
        raise HTTPException(status_code=400, detail="Diese Kategorie ist geschützt.")
    try:
        return crud.category.create_category(db, category.title, category.order)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Kategorie '{category.title}' existiert bereits.")

# Update category
@router.put("/{category_id}", response_model=schemas.Category)
def update_category(category_id: int, updated: schemas.CategoryBase, db: Session = Depends(get_db)):
    if updated.title in PROTECTED_TITLES:
        raise HTTPException(status_code=400, detail="Diese Kategorie ist geschützt.")
    return crud.category.update_category(db, category_id, updated.title, updated.order)

# Delete category
@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    category = crud.category.get_category(db, category_id)
    if category and category.title in PROTECTED_TITLES:
        raise HTTPException(status_code=403, detail="Diese Kategorie kann nicht gelöscht werden.")
    return crud.category.delete_category(db, category_id)

# Add a new subcategory and automatically assign assets
@router.post("/{category_id}/subcategories", response_model=schemas.SubCategory)
def create_subcategory(category_id: int, subcat: schemas.SubCategoryCreate, db: Session = Depends(get_db)):
    new_subcat = crud.category.add_subcategory(db, category_id, subcat.name, subcat.icon, subcat.order)

    keyword = subcat.name.lower()

    # Search assets and assign matching ones
    assets = db.query(models.Asset).all()
    for asset in assets:
        fields = [
            asset.tags,
            asset.trigger_words,
            asset.used_resources,
            asset.description,
            asset.name,
        ]
        combined = " ".join(filter(None, fields)).lower()
        if keyword in combined:
            asset.subcategory_id = new_subcat.id

    db.commit()
    return new_subcat

# Update subcategory
@router.put("/subcategories/{subcat_id}", response_model=schemas.SubCategory)
def update_subcategory(subcat_id: int, subcat: schemas.SubCategoryCreate, db: Session = Depends(get_db)):
    return crud.category.update_subcategory(db, subcat_id, subcat.name, subcat.icon, subcat.order)

# Delete subcategory
@router.delete("/subcategories/{subcat_id}")
def delete_subcategory(subcat_id: int, db: Session = Depends(get_db)):
    return crud.category.delete_subcategory(db, subcat_id)

# Save categories and subcategories in bulk
@router.post("/bulk")
def bulk_save(categories: list[schemas.CategoryCreate], db: Session = Depends(get_db)):
    existing = crud.category.get_categories(db)

    # Delete everything except the protected categories
    for cat in existing:
        if cat.title not in PROTECTED_TITLES:
            db.delete(cat)
    db.commit()

    # Save new categories (excluding protected ones)
    for cat in categories:
        if cat.title in PROTECTED_TITLES:
            continue  # Skip

        try:
            new_cat = crud.category.create_category(db, cat.title, cat.order)
        except IntegrityError:
            db.rollback()
            continue  # Skip duplicates

        for sub in cat.subcategories:
            try:
                new_sub = crud.category.add_subcategory(db, new_cat.id, sub.name, sub.icon, sub.order)

                # Automatic assignment for each subcategory during bulk
                keyword = sub.name.lower()
                assets = db.query(models.Asset).all()
                for asset in assets:
                    fields = [
                        asset.tags,
                        asset.trigger_words,
                        asset.used_resources,
                        asset.description,
                        asset.name,
                    ]
                    combined = " ".join(filter(None, fields)).lower()
                    if keyword in combined:
                        asset.subcategory_id = new_sub.id

                db.commit()
            except IntegrityError:
                db.rollback()
                continue

    db.commit()
    return {"message": "Gespeichert"}
