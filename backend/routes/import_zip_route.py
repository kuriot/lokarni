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

        for asset in assets_data:
            media_files = []

            for file in asset.get("media_files", []):
                filename = os.path.basename(file)
                source_path = os.path.join(tmp_dir, "media", filename)

                if not os.path.exists(source_path):
                    continue

                asset_type = asset.get("type", "other")
                target_dir = os.path.join(media_root, asset_type)
                os.makedirs(target_dir, exist_ok=True)

                dest_path = os.path.join(target_dir, filename)
                shutil.copy2(source_path, dest_path)

                relative_url = os.path.relpath(dest_path, start="import")
                media_files.append("/import/" + relative_url.replace("\\", "/"))

            sub = None
            if asset.get("subcategory") and asset["subcategory"].get("name"):
                sub = (
                    db.query(SubCategory)
                    .filter(SubCategory.name == asset["subcategory"]["name"])
                    .first()
                )

            new_asset = Asset(
                name=asset["name"],
                type=asset["type"],
                description=asset.get("description", ""),
                media_files=media_files,
                subcategory=sub,
            )
            db.add(new_asset)

        db.commit()
        return {"message": f"{len(assets_data)} Assets importiert."}

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
        data = {
            "id": asset.id,
            "name": asset.name,
            "type": asset.type,
            "description": asset.description,
            "subcategory": {"name": asset.subcategory.name} if asset.subcategory else None,
            "media_files": [],
        }

        for media_path in asset.media_files or []:
            rel_path = media_path.lstrip("/").replace("\\", "/")
            abs_path = os.path.join("import", rel_path.replace("import/", "", 1))

            if os.path.exists(abs_path):
                zip_file.write(abs_path, arcname=os.path.join("media", os.path.basename(abs_path)))
                data["media_files"].append(os.path.basename(abs_path))

        export_data.append(data)

    zip_file.writestr("assets.json", json.dumps(export_data, indent=2, ensure_ascii=False))
    zip_file.close()

    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=Lokarni_Export.zip"}
    )
