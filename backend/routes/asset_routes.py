from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import Counter
from .. import database, models, schemas
from .civitai_import import import_from_civitai

router = APIRouter()

@router.patch("/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset_data: schemas.AssetUpdate, db: Session = Depends(database.get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")

    for field, value in asset_data.dict(exclude_unset=True).items():
        setattr(db_asset, field, value)

    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.delete("/{asset_id}", response_model=schemas.Asset)
def delete_asset(asset_id: int, db: Session = Depends(database.get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")

    db.delete(db_asset)
    db.commit()
    return db_asset

@router.patch("/{asset_id}/favorite", response_model=schemas.Asset)
def toggle_favorite(asset_id: int, db: Session = Depends(database.get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")

    asset.is_favorite = not asset.is_favorite
    db.commit()
    db.refresh(asset)
    return asset

@router.get("/", response_model=list[schemas.Asset])
def get_assets(
    category: str = None,
    favorite: bool = False,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Asset)

    if category in ["Favorites", "Favoriten"]:
        query = query.filter(models.Asset.is_favorite == True)
        return query.all()

    if favorite:
        query = query.filter(models.Asset.is_favorite == True)
        return query.all()

    if category and category not in ["All", "All Assets"]:
        all_assets = query.all()
        category_lower = category.lower()

        def matches_category(asset):
            combined = " ".join([
                asset.tags or "",
                asset.trigger_words or "",
                asset.positive_prompt or "",
                asset.negative_prompt or "",
                asset.used_resources or "",
                asset.type or ""
            ]).lower()
            return category_lower in combined

        return list(filter(matches_category, all_assets))

    return query.all()

@router.get("/keywords")
def get_keywords(q: str = "", category: str = "All", db: Session = Depends(database.get_db)):
    assets = db.query(models.Asset).all()
    keywords = []

    if category not in ["All", "All Assets", "Favoriten", "Favorites"]:
        category_lower = category.lower()

        def matches_category(asset):
            combined = " ".join([
                asset.tags or "",
                asset.trigger_words or "",
                asset.positive_prompt or "",
                asset.negative_prompt or "",
                asset.used_resources or "",
                asset.type or ""
            ]).lower()
            return category_lower in combined

        assets = list(filter(matches_category, assets))

    for asset in assets:
        content = " ".join([
            asset.tags or "",
            asset.trigger_words or "",
            asset.positive_prompt or "",
            asset.negative_prompt or "",
            asset.used_resources or "",
            asset.type or "",
            asset.model_version or "",
            asset.base_model or "",
            asset.slug or "",
        ]).lower()

        tokens = content.replace(",", " ").split()
        keywords.extend(tokens)

    if q:
        keywords = [kw for kw in keywords if q.lower() in kw]

    counter = Counter(keywords)
    top_keywords = counter.most_common(15)

    return [{"word": word, "count": count} for word, count in top_keywords]

@router.get("/search", response_model=list[schemas.Asset])
def search_assets(q: str = "", category: str = "All", db: Session = Depends(database.get_db)):
    if not q.strip():
        return get_assets(category=category, db=db)

    keywords = q.lower().split()
    all_assets = db.query(models.Asset).all()

    if category not in ["All", "All Assets", "Favoriten", "Favorites"]:
        category_lower = category.lower()

        def matches_category(asset):
            combined = " ".join([
                asset.tags or "",
                asset.trigger_words or "",
                asset.positive_prompt or "",
                asset.negative_prompt or "",
                asset.used_resources or "",
                asset.type or ""
            ]).lower()
            return category_lower in combined

        all_assets = list(filter(matches_category, all_assets))

    def matches(asset: models.Asset):
        content = " ".join([
            asset.tags or "",
            asset.trigger_words or "",
            asset.positive_prompt or "",
            asset.negative_prompt or "",
            asset.used_resources or "",
            asset.type or "",
            asset.model_version or "",
            asset.base_model or "",
            asset.slug or "",
        ]).lower()
        return all(kw in content for kw in keywords)

    return list(filter(matches, all_assets))

@router.post("/", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(database.get_db)):
    new_asset = models.Asset(
        name=asset.name,
        type=asset.type,
        path=asset.path,
        preview_image=asset.preview_image,
        description=asset.description,
        trigger_words=asset.trigger_words,
        positive_prompt=asset.positive_prompt,
        negative_prompt=asset.negative_prompt,
        tags=asset.tags,
        model_version=asset.model_version,
        used_resources=asset.used_resources,
        slug=asset.slug,
        creator=asset.creator,
        base_model=asset.base_model,
        created_at=asset.created_at,
        nsfw_level=asset.nsfw_level,
        download_url=asset.download_url,
        media_files=asset.media_files,
        is_favorite=asset.is_favorite
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

@router.get("/{asset_id}", response_model=schemas.Asset)
def get_asset(asset_id: int, db: Session = Depends(database.get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")
    return asset

# 🌐 POST: Asset von CivitAI importieren
router.add_api_route(
    path="/from-civitai",
    endpoint=import_from_civitai,
    methods=["POST"],
    response_model=schemas.Asset
)
