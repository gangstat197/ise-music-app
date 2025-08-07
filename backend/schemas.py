from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# Song Schemas
class SongBase(BaseModel):
    title: str
    artist: str
    album: Optional[str] = None
    genre: Optional[str] = None
    year: Optional[int] = None

class SongCreate(SongBase):
    file_path: str
    file_type: str
    file_size: Optional[int] = None
    duration: Optional[float] = None
    image_path: Optional[str] = None
    user_id: Optional[int] = None

class SongUpdate(BaseModel):
    title: Optional[str] = None
    artist: Optional[str] = None
    album: Optional[str] = None
    genre: Optional[str] = None
    year: Optional[int] = None
    image_path: Optional[str] = None

class SongResponse(SongBase):
    id: int
    duration: Optional[float] = None
    file_type: str
    file_size: Optional[int] = None
    image_path: Optional[str] = None
    upload_date: datetime
    user_id: Optional[int] = None
    
    class Config:
        orm_mode = True

# User Schemas
class UserBase(BaseModel):
    username: str
    email: str

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[str] = None

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

# Login Schemas
class UserLogin(BaseModel):
    email: str
    password: str  # For demo purposes, not validated

class UserLoginResponse(BaseModel):
    user_id: int
    username: str
    email: str
    message: str

# Favorite Schemas
class FavoriteBase(BaseModel):
    user_id: int
    song_id: int

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(FavoriteBase):
    id: int
    added_at: datetime
    
    class Config:
        orm_mode = True



# File Upload Schema
class FileUploadResponse(BaseModel):
    message: str
    song: SongResponse