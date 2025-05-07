# backend/routes/upload_routes.py

import os
import uuid
import aiohttp
from fastapi import APIRouter, UploadFile, Form, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter()


def save_path(type: str, filename: str):
    folder = os.path.join("import", "images", type)
    os.makedirs(folder, exist_ok=True)
    return os.path.join(folder, filename)


@router.post("/upload-image")
async def upload_image(file: UploadFile, type: str = Form(...)):
    file_path = save_path(type, file.filename)

    try:
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fehler beim Speichern der Datei: {str(e)}")

    return JSONResponse(content={"path": "/" + file_path.replace("\\", "/")})


class UrlUploadRequest(BaseModel):
    url: str
    type: str


@router.post("/upload-url")
async def upload_url(data: UrlUploadRequest):
    ext = os.path.splitext(data.url.split("?")[0])[1] or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"
    file_path = save_path(data.type, filename)

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(data.url, headers={"User-Agent": "Mozilla/5.0"}) as response:
                if response.status != 200:
                    raise HTTPException(status_code=400, detail=f"Fehler beim Abrufen der URL: {data.url}")
                content = await response.read()
                with open(file_path, "wb") as f:
                    f.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Download fehlgeschlagen: {str(e)}")

    return JSONResponse(content={"path": "/" + file_path.replace("\\", "/")})
