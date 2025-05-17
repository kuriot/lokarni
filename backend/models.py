# backend/models.py

from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.sqlite import JSON
from .database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    path = Column(String, default="")
    preview_image = Column(String, default="")
    description = Column(Text, default="")
    trigger_words = Column(Text, default="")
    positive_prompt = Column(Text, default="")
    negative_prompt = Column(Text, default="")
    tags = Column(Text, default="")
    model_version = Column(String, default="")
    used_resources = Column(Text, default="")
    is_favorite = Column(Boolean, default=False)

    # 🔄 Erweiterte Metadaten von CivitAI
    slug = Column(String, default="")
    creator = Column(String, default="")
    creator_url = Column(String, default="")
    base_model = Column(String, default="")
    created_at = Column(String, default="")
    nsfw_level = Column(String, default="")
    download_url = Column(String, default="")
    media_files = Column(JSON, default=[])
    
    custom_fields = Column(JSON, nullable=True, default={})
    linked_assets = Column(JSON, default=[])


    # 🔗 Beziehung zur SubCategory
    subcategory_id = Column(Integer, ForeignKey("subcategories.id", ondelete="SET NULL"), nullable=True)
    subcategory = relationship("SubCategory", back_populates="assets")


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, unique=True, nullable=False)
    order = Column(Integer, nullable=False)

    subcategories = relationship(
        "SubCategory",
        back_populates="category",
        cascade="all, delete"
    )


class SubCategory(Base):
    __tablename__ = "subcategories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, default="🔹")
    order = Column(Integer, nullable=False)

    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"))
    category = relationship("Category", back_populates="subcategories")

    # 🔄 Beziehung zu Assets
    assets = relationship("Asset", back_populates="subcategory")
