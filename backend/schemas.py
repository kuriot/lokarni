from pydantic import BaseModel
from typing import Optional, List

# 🔹 Für API-Antworten (GET)
class Asset(BaseModel):
    id: int
    name: str
    type: str
    path: str
    preview_image: str
    description: str
    trigger_words: str
    positive_prompt: str
    negative_prompt: str
    tags: str
    model_version: str
    used_resources: str
    is_favorite: bool
    subcategory_id: Optional[int]

    # 🆕 Erweiterte Felder von CivitAI
    slug: str
    creator: str
    base_model: str
    created_at: str
    nsfw_level: str
    media_files: List[str] = []
    download_url: str

    class Config:
        from_attributes = True

# 🔹 Für neue Einträge (POST)
class AssetCreate(BaseModel):
    name: str
    type: str
    path: str = ""
    preview_image: str = ""
    description: str = ""
    trigger_words: str = ""
    positive_prompt: str = ""
    negative_prompt: str = ""
    tags: str = ""
    model_version: str = ""
    used_resources: str = ""
    subcategory_id: Optional[int] = None

    # 🆕 Optional bei manueller Erweiterung
    slug: str = ""
    creator: str = ""
    base_model: str = ""
    created_at: str = ""
    nsfw_level: str = ""
    media_files: List[str] = []
    download_url: str = ""
    is_favorite: bool = False

    class Config:
        from_attributes = True

# 🔹 Für Aktualisierungen (PATCH)
class AssetUpdate(BaseModel):
    name: Optional[str] = None
    tags: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    model_version: Optional[str] = None
    trigger_words: Optional[str] = None
    positive_prompt: Optional[str] = None
    negative_prompt: Optional[str] = None
    subcategory_id: Optional[int] = None

    # 🆕 Erweiterbar
    slug: Optional[str] = None
    creator: Optional[str] = None
    base_model: Optional[str] = None
    created_at: Optional[str] = None
    nsfw_level: Optional[str] = None
    media_files: Optional[List[str]] = None
    download_url: Optional[str] = None
    is_favorite: Optional[bool] = None

    class Config:
        from_attributes = True

# 🔸 Subkategorie (Basis)
class SubCategoryBase(BaseModel):
    name: str
    icon: str
    order: int

class SubCategoryCreate(SubCategoryBase):
    pass

class SubCategory(SubCategoryBase):
    id: int
    class Config:
        from_attributes = True

# 🔸 Kategorie (Basis)
class CategoryBase(BaseModel):
    title: str
    order: int

class CategoryCreate(CategoryBase):
    subcategories: List[SubCategoryCreate] = []

class Category(CategoryBase):
    id: int
    subcategories: List[SubCategory] = []

    class Config:
        from_attributes = True
