from sqlalchemy import Column, Integer, String, JSON, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from src.database import Base
from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    new_email = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=True)
    provider = Column(String, default="local")
    avatar = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    presentations = relationship("Presentation", back_populates="user", cascade="all, delete")


# Если хочешь отдельную таблицу для презентаций:
class Presentation(Base):
    __tablename__ = "presentations"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, nullable=False)
    content = Column(JSON, default=[])  # сюда можно сохранять массив PlateSlide
    theme = Column(JSON, nullable=True)
    
    user = relationship("User", back_populates="presentations")
    

class UserSchema(BaseModel):
    id: int
    name: Optional[str]
    email: EmailStr
    avatar: Optional[str]
    provider: Optional[str]
    is_verified: bool

    model_config = ConfigDict(from_attributes=True)

    
class UpdateUserSchema(BaseModel):
    name: Optional[str]
    email: Optional[EmailStr]
