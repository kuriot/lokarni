# backend/routes/civitai_import.py

import os
import requests
from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import database, models

router = APIRouter()

class CivitaiImportRequest(BaseModel):
    civitai_url: str
    api_key: str | None = None

# 📥 Datei speichern
def download_file(url, save_path):
    response = requests.get(url)
    if response.status_code == 200:
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        with open(save_path, "wb") as f:
            f.write(response.content)
        return True
    return False

# 🔎 Slug oder ID auflösen
def resolve_model_id_from_slug(slug_or_id: str, headers: dict) -> int:
    if slug_or_id.isdigit():
        return int(slug_or_id)

    search_url = f"https://civitai.com/api/v1/models?query={slug_or_id}&nsfw=true"
    search_response = requests.get(search_url, headers=headers)
    search_response.raise_for_status()
    results = search_response.json().get("items", [])
    match = next((item for item in results if item.get("slug") == slug_or_id), None)

    if not match:
        raise HTTPException(status_code=400, detail="Kein Modell mit diesem Slug gefunden.")
    return match["id"]

# 📦 Modell-Import
@router.post("/from-civitai")
def import_from_civitai(data: CivitaiImportRequest, request: Request, db: Session = Depends(database.get_db)):
    civitai_url = data.civitai_url
    headers = {"User-Agent": "Lokarni-Importer/1.0"}
    if data.api_key:
        headers["Authorization"] = f"Bearer {data.api_key}"
    elif "civitai-api-key" in request.cookies:
        headers["Authorization"] = f"Bearer {request.cookies['civitai-api-key']}"

    try:
        identifier = civitai_url.strip("/").split("/")[-1]
        model_id = resolve_model_id_from_slug(identifier, headers)
        api_url = f"https://civitai.com/api/v1/models/{model_id}?nsfw=true"
        response = requests.get(api_url, headers=headers)
        response.raise_for_status()
        model_data = response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"CivitAI-Link oder API-Key ungültig: {e}")

    try:
        name = model_data.get("name", "Unbenannt")
        model_type = model_data.get("type", "Unknown")
        description = model_data.get("description", "")
        tags = ", ".join(model_data.get("tags", []))
        slug = model_data.get("slug", "")
        creator = model_data.get("creator", {}).get("username", "")
        nsfw_level = model_data.get("nsfw", "")
        version = model_data.get("modelVersions", [])[0]
        model_version = version.get("name", "v1.0")
        trained_words = ", ".join(version.get("trainedWords", []))
        base_model = version.get("baseModel", "")
        created_at = version.get("createdAt", "")
        images = version.get("images", [])
        media_files = []
        preview_url = ""

        for idx, img in enumerate(images):
            img_url = img.get("url")
            if not img_url:
                continue
            ext = os.path.splitext(img_url.split("?")[0])[-1].lower()
            if not ext.startswith("."):
                ext = ".jpg"
            img_name = f"{slug or name.replace(' ', '_').lower()}_{idx}{ext}"
            img_path = os.path.join("import", "images", model_type, img_name)
            if download_file(img_url, img_path):
                media_files.append("/" + img_path.replace("\\", "/"))
                if idx == 0:
                    preview_url = img_path

        first_image_meta = images[0].get("meta", {}) if images else {}
        prompt = first_image_meta.get("prompt", "")
        negative_prompt = first_image_meta.get("negativePrompt", "")
        resources = images[0].get("resources", []) if images else []
        used_resources = ", ".join(
            f'{r["name"]} ({r["type"]}{f": {r.get("weight")}" if "weight" in r else ""})' for r in resources
        )

        new_asset = models.Asset(
            name=name,
            type=model_type,
            path=f"/models/{model_type}/{os.path.basename(preview_url)}",
            preview_image="/" + preview_url.replace("\\", "/"),
            description=description,
            trigger_words=trained_words,
            positive_prompt=prompt,
            negative_prompt=negative_prompt,
            tags=tags,
            model_version=model_version,
            used_resources=used_resources,
            slug=slug,
            creator=creator,
            base_model=base_model,
            created_at=created_at,
            nsfw_level=nsfw_level,
            media_files=media_files,
        )

        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        return new_asset

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Verarbeiten des Modells: {e}")

# 🖼️ GET-Import für einzelne Bilder (optional)
@router.get("/from-civitai-image/{image_id}")
def import_single_image_get(image_id: int, request: Request, db: Session = Depends(database.get_db)):
    return import_single_image_internal(image_id, request, db)

# 🖼️ POST-Import für einzelne Bilder (für dein Frontend-Formular)
@router.post("/from-civitai-image/{image_id}")
def import_single_image_post(image_id: int, request: Request, db: Session = Depends(database.get_db)):
    return import_single_image_internal(image_id, request, db)

# 🔁 Gemeinsame Import-Logik
def import_single_image_internal(image_id: int, request: Request, db: Session):
    headers = {"User-Agent": "Lokarni-Importer/1.0"}
    if "civitai-api-key" in request.cookies:
        headers["Authorization"] = f"Bearer {request.cookies['civitai-api-key']}"

    try:
        image_url = f"https://civitai.com/api/v1/images/{image_id}"
        response = requests.get(image_url, headers=headers)
        response.raise_for_status()
        data = response.json()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Bild konnte nicht geladen werden: {e}")

    try:
        img_url = data.get("url", "")
        prompt = data.get("meta", {}).get("prompt", "")
        negative_prompt = data.get("meta", {}).get("negativePrompt", "")
        model_version = data.get("modelVersion", {}).get("name", "")
        model_type = data.get("model", {}).get("type", "Image")
        tags = ", ".join(data.get("tags", []))
        ext = os.path.splitext(img_url.split("?")[0])[-1].lower()
        if not ext.startswith("."):
            ext = ".jpg"
        filename = f"image_{image_id}{ext}"
        image_path = os.path.join("import", "images", model_type, filename)

        if not download_file(img_url, image_path):
            raise HTTPException(status_code=500, detail="Bild konnte nicht gespeichert werden.")

        media_path = "/" + image_path.replace("\\", "/")
        new_asset = models.Asset(
            name=f"CivitaiImage {image_id}",
            type=model_type,
            path=f"/images/{model_type}/{filename}",
            preview_image=media_path,
            description="Imported CivitAI image.",
            positive_prompt=prompt,
            negative_prompt=negative_prompt,
            model_version=model_version,
            tags=tags,
            media_files=[media_path],
        )

        db.add(new_asset)
        db.commit()
        db.refresh(new_asset)
        return new_asset

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Verarbeiten des Bildes: {e}")
