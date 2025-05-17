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

    # Get the data as a dictionary with only set fields
    update_data = asset_data.dict(exclude_unset=True)
    
    # Debug: Print what data is being received
    print(f"Update data for asset {asset_id}: {update_data}")
    
    # Special handling for linked_assets - it might be coming in as full asset objects
    # but we only want to store the IDs
    if 'linked_assets' in update_data:
        linked_assets = update_data['linked_assets']
        
        # Wenn linked_assets None ist, setze es auf eine leere Liste
        if linked_assets is None:
            update_data['linked_assets'] = []
            print(f"Leere linked_assets Liste gesetzt (None)")
        # Wenn linked_assets eine leere Liste ist, behalte sie bei
        elif isinstance(linked_assets, list) and len(linked_assets) == 0:
            update_data['linked_assets'] = []
            print(f"Leere linked_assets Liste beibehalten")
        # Wenn wir vollständige Asset-Objekte statt nur IDs erhalten haben, extrahiere die IDs
        elif isinstance(linked_assets, list):
            # Prüfe, ob es sich um eine Liste von Objekten mit 'id' handelt
            if len(linked_assets) > 0 and isinstance(linked_assets[0], dict) and 'id' in linked_assets[0]:
                # Konvertiere Liste von Asset-Objekten zu Liste von Asset-IDs
                update_data['linked_assets'] = [asset['id'] for asset in linked_assets if isinstance(asset, dict) and 'id' in asset]
                print(f"Konvertierte linked_assets zu IDs: {update_data['linked_assets']}")
            # Wenn es bereits eine Liste von IDs ist, konvertiere String-IDs zu Integer
            elif all(isinstance(item, (int, str)) for item in linked_assets):
                # Konvertiere String-IDs zu Integer-IDs
                update_data['linked_assets'] = [int(item) if isinstance(item, str) and item.isdigit() else item for item in linked_assets]
                print(f"linked_assets ist bereits eine Liste von IDs: {update_data['linked_assets']}")
            # Für andere Formate, setze auf leere Liste
            else:
                update_data['linked_assets'] = []
                print(f"Unbekanntes Format für linked_assets, setze auf leere Liste")
        # Für andere Typen, setze auf leere Liste
        else:
            update_data['linked_assets'] = []
            print(f"linked_assets ist kein gültiges Format, setze auf leere Liste")
    
    # Apply all updates
    for field, value in update_data.items():
        setattr(db_asset, field, value)

    # Commit changes to database
    db.commit()
    db.refresh(db_asset)
    
    # Debug: Print the asset after update
    print(f"Updated asset: {db_asset.id}, linked_assets: {db_asset.linked_assets}")
    
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
        is_favorite=asset.is_favorite,
        custom_fields=asset.custom_fields  # WICHTIG: custom_fields hinzufügen!
    )

    db.add(new_asset)
    db.commit()
    db.refresh(new_asset)
    return new_asset

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

											   
																					 
							 
						
						
						
										  
									  
										  
											  
											  
						
										  
											
						
							  
									
									
									
										
									  
									  
																		   
	 

					 
			   
						 
					


@router.get("/{asset_id}", response_model=schemas.Asset)
def get_asset(asset_id: int, db: Session = Depends(database.get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")
    
    # Stelle sicher, dass linked_assets eine Liste ist
    if asset.linked_assets is None:
        asset.linked_assets = []
    elif not isinstance(asset.linked_assets, list):
        print(f"Warnung: linked_assets für Asset {asset_id} ist kein gültiges Format: {type(asset.linked_assets)}")
        asset.linked_assets = []
    
    # If the asset has linked_assets IDs, fetch the full assets
    if asset.linked_assets and len(asset.linked_assets) > 0:
        # This is a simple approach - in production, you might want to use a JOIN
        linked_assets_full = []
        for linked_id in asset.linked_assets:
            try:
                # Konvertiere linked_id zu int, falls es ein String ist
                if isinstance(linked_id, str) and linked_id.isdigit():
                    linked_id = int(linked_id)
                
                if isinstance(linked_id, int):
                    linked_asset = db.query(models.Asset).filter(models.Asset.id == linked_id).first()
                    if linked_asset:
                        linked_assets_full.append(linked_asset)
                else:
                    print(f"Ungültiger linked_id Typ: {type(linked_id)} - Wert: {linked_id}")
            except Exception as e:
                print(f"Fehler beim Abrufen von linked_asset {linked_id}: {str(e)}")
        
        # Replace the IDs with full asset objects for the response
        asset.linked_assets = linked_assets_full
    
    return asset
