# backend/routes/asset_type_routes.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from .. import database, models
from typing import List

router = APIRouter()

class AssetTypeCreate(BaseModel):
    name: str

@router.get("/", response_model=List[str])
def get_asset_types(db: Session = Depends(database.get_db)):
    """
    Gibt alle eindeutigen Asset-Typen zurück, die in der Datenbank vorhanden sind.
    Wenn keine Typen gefunden werden, werden Standard-Typen zurückgegeben.
    """
    # Abfrage aller eindeutigen Typen aus der Asset-Tabelle
    result = db.query(models.Asset.type).distinct().filter(models.Asset.type != None).filter(models.Asset.type != "").all()
    
    # Filtern von None-Werten und Extrahieren der Typen aus den Tupeln
    types = [t[0] for t in result if t[0]]
    
    # Wenn keine Typen gefunden wurden, Standard-Typen zurückgeben
    if not types:
        types = [
            "Checkpoint", 
            "LoRA", 
            "Embedding", 
            "Controlnet", 
            "Poses", 
            "Wildcards", 
            "Hypernetwork",
            "VAE",
            "Textual Inversion",
            "Other"
        ]
    
    # Sortieren der Typen alphabetisch
    types.sort()
    
    return types

@router.post("/", response_model=List[str])
def add_asset_type(type_data: AssetTypeCreate, db: Session = Depends(database.get_db)):
    """
    Fügt einen neuen Asset-Typ zur Datenbank hinzu.
    
    Diese Funktion erstellt einen Dummy-Asset-Eintrag mit dem neuen Typ,
    damit er in der Liste der verfügbaren Typen erscheint.
    """
    # Prüfen, ob der Typ bereits existiert
    existing_types = get_asset_types(db)
    if type_data.name in existing_types:
        return existing_types  # Typ existiert bereits, keine Änderung notwendig
    
    # Typ-Name validieren
    if not type_data.name or len(type_data.name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Type name cannot be empty")
    
    # Erstelle einen Dummy-Asset-Eintrag mit dem neuen Typ
    new_asset = models.Asset(
        name=f"Type Definition: {type_data.name}",
        type=type_data.name,
        description=f"This is a placeholder asset to define the type '{type_data.name}'",
        is_favorite=False
    )
    
    db.add(new_asset)
    db.commit()
    
    # Aktualisierte Liste der Typen zurückgeben
    return get_asset_types(db)
