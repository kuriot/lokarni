import os
import shutil
import tempfile
import zipfile
import json
import io
from fastapi import APIRouter, UploadFile, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.models import Asset, SubCategory

router = APIRouter()

# 📥 ZIP-Import
@router.post("/assets/import/")
async def import_zip_file(file: UploadFile, db: Session = Depends(get_db)):
    if not file.filename.endswith(".zip"):
        raise HTTPException(status_code=400, detail="Nur ZIP-Dateien sind erlaubt.")

    tmp_dir = tempfile.mkdtemp()

    try:
        zip_path = os.path.join(tmp_dir, "upload.zip")
        with open(zip_path, "wb") as buffer:
            buffer.write(await file.read())

        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(tmp_dir)

        json_path = os.path.join(tmp_dir, "assets.json")
        if not os.path.exists(json_path):
            raise HTTPException(status_code=400, detail="assets.json nicht gefunden.")

        with open(json_path, "r", encoding="utf-8") as f:
            assets_data = json.load(f)

        media_root = os.path.join("import", "images")
        os.makedirs(media_root, exist_ok=True)

        # Finde die höchste vorhandene ID für die Auto-Increment-Simulation
        existing_assets = db.query(Asset).all()
        max_id = max([asset.id for asset in existing_assets], default=0)
        
        id_mapping = {}  # Map old IDs to new IDs

        for asset_data in assets_data:
            old_id = asset_data.get("id")
            media_files = []

            # Verarbeite alle Media-Dateien
            for file in asset_data.get("media_files", []):
                filename = os.path.basename(file)
                source_path = os.path.join(tmp_dir, "media", filename)

                if not os.path.exists(source_path):
                    continue

                asset_type = asset_data.get("type", "other")
                target_dir = os.path.join(media_root, asset_type)
                os.makedirs(target_dir, exist_ok=True)

                dest_path = os.path.join(target_dir, filename)
                shutil.copy2(source_path, dest_path)

                relative_url = os.path.relpath(dest_path, start="import")
                media_files.append("/import/" + relative_url.replace("\\", "/"))

            # Handle subcategory
            subcategory = None
            if asset_data.get("subcategory") and asset_data["subcategory"].get("name"):
                subcategory = (
                    db.query(SubCategory)
                    .filter(SubCategory.name == asset_data["subcategory"]["name"])
                    .first()
                )

            # Create new asset with all fields
            new_asset = Asset(
                name=asset_data.get("name"),
                type=asset_data.get("type"),
                path=asset_data.get("path", ""),
                preview_image=asset_data.get("preview_image", ""),
                description=asset_data.get("description", ""),
                trigger_words=asset_data.get("trigger_words", ""),
                positive_prompt=asset_data.get("positive_prompt", ""),
                negative_prompt=asset_data.get("negative_prompt", ""),
                tags=asset_data.get("tags", ""),
                model_version=asset_data.get("model_version", ""),
                used_resources=asset_data.get("used_resources", ""),
                is_favorite=asset_data.get("is_favorite", False),
                slug=asset_data.get("slug", ""),
                creator=asset_data.get("creator", ""),
                base_model=asset_data.get("base_model", ""),
                created_at=asset_data.get("created_at", ""),
                nsfw_level=asset_data.get("nsfw_level", ""),
                download_url=asset_data.get("download_url", ""),
                media_files=media_files,
                subcategory=subcategory,
            )
            
            db.add(new_asset)
            db.flush()  # Get the new ID
            
            if old_id:
                id_mapping[old_id] = new_asset.id

        db.commit()
        return {"message": f"{len(assets_data)} Assets importiert.", "id_mapping": id_mapping}

    finally:
        shutil.rmtree(tmp_dir, ignore_errors=True)


# 📤 ZIP-Export
@router.get("/assets/export/")
def export_assets(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    zip_buffer = io.BytesIO()
    zip_file = zipfile.ZipFile(zip_buffer, mode="w", compression=zipfile.ZIP_DEFLATED)

    export_data = []

    for asset in assets:
        # Export all fields
        data = {
            "id": asset.id,
            "name": asset.name,
            "type": asset.type,
            "path": asset.path,
            "preview_image": asset.preview_image,
            "description": asset.description,
            "trigger_words": asset.trigger_words,
            "positive_prompt": asset.positive_prompt,
            "negative_prompt": asset.negative_prompt,
            "tags": asset.tags,
            "model_version": asset.model_version,
            "used_resources": asset.used_resources,
            "is_favorite": asset.is_favorite,
            "slug": asset.slug,
            "creator": asset.creator,
            "base_model": asset.base_model,
            "created_at": asset.created_at,
            "nsfw_level": asset.nsfw_level,
            "download_url": asset.download_url,
            "media_files": asset.media_files or [],
            "subcategory": {"name": asset.subcategory.name} if asset.subcategory else None,
            "subcategory_id": asset.subcategory_id,
        }

        # Process media files
        for media_path in asset.media_files or []:
            rel_path = media_path.lstrip("/").replace("\\", "/")
            abs_path = os.path.join("import", rel_path.replace("import/", "", 1))

            if os.path.exists(abs_path):
                zip_file.write(abs_path, arcname=os.path.join("media", os.path.basename(abs_path)))

        export_data.append(data)

    # Export categories und subcategories for reference
    from backend.models import Category
    categories = db.query(Category).all()
    categories_data = []
    
    for cat in categories:
        categories_data.append({
            "id": cat.id,
            "title": cat.title,
            "order": cat.order,
            "subcategories": [
                {
                    "id": sub.id,
                    "name": sub.name,
                    "icon": sub.icon,
                    "order": sub.order,
                    "category_id": sub.category_id
                }
                for sub in cat.subcategories
            ]
        })

    zip_file.writestr("assets.json", json.dumps(export_data, indent=2, ensure_ascii=False))
    zip_file.writestr("categories.json", json.dumps(categories_data, indent=2, ensure_ascii=False))
    zip_file.close()

    zip_file.close()
    zip_buffer.seek(0)
    zip_data = zip_buffer.read()
    return StreamingResponse(
        io.BytesIO(zip_data),
        media_type="application/zip",
        headers={
            "Content-Disposition": "attachment; filename=Lokarni_Export.zip",
            "Content-Length": str(len(zip_data))
        }
    )
