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
    Return all unique asset types in the database.
    If none are found, default types are returned.
    """
    # Query all distinct types from the Asset table
    result = db.query(models.Asset.type).distinct().filter(models.Asset.type != None).filter(models.Asset.type != "").all()
    
    # Filter out None values and extract the types from the tuples
    types = [t[0] for t in result if t[0]]
    
    # Return default types if none were found
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
    
    # Sort the types alphabetically
    types.sort()
    
    return types

@router.post("/", response_model=List[str])
def add_asset_type(type_data: AssetTypeCreate, db: Session = Depends(database.get_db)):
    """
    Add a new asset type to the database.

    This function creates a dummy asset entry with the new type
    so that it appears in the list of available types.
    """
    # Check if the type already exists
    existing_types = get_asset_types(db)
    if type_data.name in existing_types:
        return existing_types  # Type already exists, no change required
    
    # Validate type name
    if not type_data.name or len(type_data.name.strip()) == 0:
        raise HTTPException(status_code=400, detail="Type name cannot be empty")
    
    # Create a dummy asset entry with the new type
    new_asset = models.Asset(
        name=f"Type Definition: {type_data.name}",
        type=type_data.name,
        description=f"This is a placeholder asset to define the type '{type_data.name}'",
        is_favorite=False
    )
    
    db.add(new_asset)
    db.commit()
    
    # Return updated list of types
    return get_asset_types(db)