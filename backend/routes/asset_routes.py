from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from collections import Counter
import os
import shutil
from .. import database, models, schemas
from .civitai_import import import_from_civitai

router = APIRouter()

# Hinzufügen der route-Duplikation mit trailing slash
@router.get("/{asset_id}/", response_model=schemas.Asset)
def get_asset_with_slash(asset_id: int, db: Session = Depends(database.get_db)):
    return get_asset(asset_id, db)

@router.get("/search/", response_model=list[schemas.Asset])
def search_assets_with_slash(q: str = "", category: str = "All", db: Session = Depends(database.get_db)):
    return search_assets(q, category, db)

@router.patch("/{asset_id}/", response_model=schemas.Asset)
def update_asset_with_slash(asset_id: int, asset_data: schemas.AssetUpdate, db: Session = Depends(database.get_db)):
    return update_asset(asset_id, asset_data, db)

@router.patch("/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset_data: schemas.AssetUpdate, db: Session = Depends(database.get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not db_asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")

    # Save old linked assets for bidirectional updates
    old_linked_assets = db_asset.linked_assets or []
    if isinstance(old_linked_assets, list):
        # Normalize IDs (convert strings to ints)
        old_linked_assets = [int(x) if isinstance(x, str) and x.isdigit() else x for x in old_linked_assets]
    else:
        old_linked_assets = []

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

    # Handle bidirectional relationships for linked_assets
    if 'linked_assets' in update_data:
        new_linked_assets = update_data['linked_assets']
        
        # 1. Find assets that were removed (in old_linked_assets but not in new_linked_assets)
        removed_assets = [asset_id for asset_id in old_linked_assets 
                         if asset_id not in new_linked_assets]
        
        # 2. Remove bidirectional links for removed assets
        for removed_id in removed_assets:
            try:
                removed_asset = db.query(models.Asset).filter(models.Asset.id == removed_id).first()
                if removed_asset:
                    removed_asset_links = removed_asset.linked_assets or []
                    if isinstance(removed_asset_links, list):
                        # Normalize IDs
                        removed_asset_links = [int(x) if isinstance(x, str) and x.isdigit() else x
                                              for x in removed_asset_links]
                        # Remove link
                        if asset_id in removed_asset_links:
                            removed_asset.linked_assets = [x for x in removed_asset_links if x != asset_id]
                            print(f"Removed bidirectional link from asset {removed_id} to {asset_id}")
            except Exception as e:
                print(f"Error removing bidirectional link from asset {removed_id}: {str(e)}")
                
        # 3. Add bidirectional links for new assets
        for linked_id in new_linked_assets:
            try:
                # Find the linked asset
                linked_asset = db.query(models.Asset).filter(models.Asset.id == linked_id).first()
                if linked_asset:
                    # Ensure the linked asset also links back to this asset
                    linked_asset_links = linked_asset.linked_assets or []
                    if isinstance(linked_asset_links, list):
                        # Convert any strings to ints
                        linked_asset_links = [int(x) if isinstance(x, str) and x.isdigit() else x for x in linked_asset_links]
                        # If this asset's ID isn't in the linked asset's links, add it
                        if asset_id not in linked_asset_links:
                            linked_asset.linked_assets = linked_asset_links + [asset_id]
                            print(f"Added bidirectional link from asset {linked_id} back to {asset_id}")
            except Exception as e:
                print(f"Error adding bidirectional link to asset {linked_id}: {str(e)}")

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

@router.patch("/{asset_id}/favorite/", response_model=schemas.Asset)
def toggle_favorite_with_slash(asset_id: int, db: Session = Depends(database.get_db)):
    return toggle_favorite(asset_id, db)

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

@router.get("/keywords/")
def get_keywords_with_slash(q: str = "", category: str = "All", db: Session = Depends(database.get_db)):
    return get_keywords(q, category, db)

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

# New DELETE endpoint to delete an asset
@router.delete("/{asset_id}", response_model=dict)
def delete_asset(asset_id: int, db: Session = Depends(database.get_db)):
    # Find the asset
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset nicht gefunden")
    
    print(f"Deleting asset: {asset.id}, {asset.name}")
    
    try:
        # 1. First, remove references from other assets' linked_assets
        all_assets = db.query(models.Asset).all()
        
        for other_asset in all_assets:
            if other_asset.id == asset_id:
                continue  # Skip the asset being deleted
                
            links = other_asset.linked_assets
            if not links or not isinstance(links, list):
                continue
                
            # If this asset is in the other asset's linked_assets, remove it
            try:
                if asset_id in links or str(asset_id) in links:
                    # Convert to ints for proper comparison
                    links = [int(x) if isinstance(x, str) and x.isdigit() else x for x in links]
                    other_asset.linked_assets = [x for x in links if x != asset_id]
                    print(f"Removed link to asset {asset_id} from asset {other_asset.id}")
            except Exception as e:
                print(f"Error updating links in asset {other_asset.id}: {str(e)}")
                # Continue despite error

        # 2. Try to delete associated media files
        try:
            # Get list of media files
            media_files = asset.media_files or []
            
            # Delete each media file from the filesystem
            for media_path in media_files:
                # Skip if path is empty
                if not media_path:
                    continue
                    
                # Remove the leading slash if present and convert to OS-appropriate path
                if media_path.startswith("/"):
                    media_path = media_path[1:]
                
                # Construct the absolute path to the file
                abs_path = os.path.join(os.getcwd(), media_path)
                
                # Check if file exists and delete it
                if os.path.exists(abs_path):
                    if os.path.isfile(abs_path):
                        try:
                            os.remove(abs_path)
                            print(f"Deleted file: {abs_path}")
                        except PermissionError:
                            print(f"Permission denied when deleting: {abs_path}")
                        except Exception as e:
                            print(f"Error deleting file {abs_path}: {str(e)}")
                    else:
                        print(f"Skipping non-file: {abs_path}")
                else:
                    print(f"File not found: {abs_path}")
        except Exception as e:
            print(f"Error during media file deletion: {str(e)}")
            # Continue with asset deletion even if file deletion fails
        
        # 3. Delete the asset from the database
        db.delete(asset)
        db.commit()
        print(f"Asset deleted from database: {asset_id}")
        return {"success": True, "message": f"Asset {asset_id} erfolgreich gelöscht"}
    
    except Exception as e:
        # Rollback on any error
        db.rollback()
        print(f"Error deleting asset {asset_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen: {str(e)}")

# Make sure to add the trailing slash version too
@router.delete("/{asset_id}/", response_model=dict)
def delete_asset_with_slash(asset_id: int, db: Session = Depends(database.get_db)):
    return delete_asset(asset_id, db)


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
    
    # Store original linked_assets IDs for response
    linked_ids = asset.linked_assets.copy() if asset.linked_assets else []
    
    # If the asset has linked_assets IDs, we need to fetch the full assets for internal use
    # but keep the ID list for the response
    linked_assets_full = []
    if asset.linked_assets and len(asset.linked_assets) > 0:
        # This is a simple approach - in production, you might want to use a JOIN
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
    
    # Return the original asset with the IDs as linked_assets
    # We don't replace linked_assets with the full objects to avoid validation errors
    
    # Make sure all linked_assets are integers to avoid validation errors
    asset.linked_assets = [int(id) if isinstance(id, str) and id.isdigit() else id for id in linked_ids if isinstance(id, (int, str))]
    
    return asset