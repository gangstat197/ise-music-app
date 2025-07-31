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

# Playlist Schemas
class PlaylistBase(BaseModel):
    name: str

class PlaylistCreate(PlaylistBase):
    pass

class PlaylistUpdate(BaseModel):
    name: Optional[str] = None

class PlaylistResponse(PlaylistBase):
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        orm_mode = True

class PlaylistDetailResponse(PlaylistBase):
    id: int
    user_id: int
    created_at: datetime
    songs: List['SongResponse'] = []
    
    class Config:
        orm_mode = True

# PlaylistSong Schemas
class PlaylistSongBase(BaseModel):
    playlist_id: int
    song_id: int
    position: Optional[int] = 0

class PlaylistSongCreate(PlaylistSongBase):
    pass

class PlaylistSongResponse(PlaylistSongBase):
    id: int
    added_at: datetime
    
    class Config:
        orm_mode = True

# Playlist Reorder Schema
class PlaylistReorder(BaseModel):
    song_ids: List[int]

# File Upload Schema
class FileUploadResponse(BaseModel):
    message: str
    song: SongResponse