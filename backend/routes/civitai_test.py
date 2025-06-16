# backend/routes/civitai_test.py

import requests
from fastapi import APIRouter, Request, HTTPException

router = APIRouter()

@router.get("/test-api-key")
def test_api_key(request: Request):
    api_key = request.headers.get("X-Civitai-Api-Key")

    if not api_key:
        raise HTTPException(status_code=400, detail="API-Key fehlt im Header (X-Civitai-Api-Key).")

    headers = {"Authorization": f"Bearer {api_key}"}

    try:
        # A real private endpoint – returns information about the user
        response = requests.get("https://civitai.com/api/v1/user", headers=headers)
    except requests.RequestException:
        raise HTTPException(status_code=503, detail="Civitai nicht erreichbar.")

    if response.status_code == 200:
        user_data = response.json()
        return {"message": "✅ API-Key ist gültig.", "user": user_data}
    elif response.status_code == 401:
        raise HTTPException(status_code=401, detail="❌ Ungültiger API-Key.")
    else:
        raise HTTPException(status_code=response.status_code, detail="Unbekannter Fehler bei Civitai.")
