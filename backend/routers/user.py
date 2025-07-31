from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/users", tags=["users"])

# For now, we'll use a simple user system
# In production, you'd want proper authentication

@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Create a new user.
    """
    # Check if user already exists
    existing_user = db.query(models.User).filter(
        models.User.username == user.username
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    db_user = models.User(**user.dict())
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db)):
    """
    Get user profile.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db)
):
    """
    Update user profile.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

# Favorites endpoints
@router.get("/{user_id}/favorites", response_model=List[schemas.SongResponse])
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    """
    Get user's favorite songs.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    favorites = db.query(models.Song).join(models.Favorite).filter(
        models.Favorite.user_id == user_id
    ).all()
    
    return favorites

@router.post("/{user_id}/favorites/{song_id}", status_code=status.HTTP_201_CREATED)
def add_to_favorites(user_id: int, song_id: int, db: Session = Depends(get_db)):
    """
    Add a song to user's favorites.
    """
    # Check if user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if song exists
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Check if already in favorites
    existing_favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.song_id == song_id
    ).first()
    
    if existing_favorite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Song already in favorites"
        )
    
    # Add to favorites
    favorite = models.Favorite(user_id=user_id, song_id=song_id)
    db.add(favorite)
    db.commit()
    
    return {"message": "Song added to favorites"}

@router.delete("/{user_id}/favorites/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_from_favorites(user_id: int, song_id: int, db: Session = Depends(get_db)):
    """
    Remove a song from user's favorites.
    """
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == user_id,
        models.Favorite.song_id == song_id
    ).first()
    
    if not favorite:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not in favorites"
        )
    
    db.delete(favorite)
    db.commit()
    
    return {"message": "Song removed from favorites"}

# Playlist endpoints
@router.get("/{user_id}/playlists", response_model=List[schemas.PlaylistResponse])
def get_user_playlists(user_id: int, db: Session = Depends(get_db)):
    """
    Get user's playlists.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    playlists = db.query(models.Playlist).filter(
        models.Playlist.user_id == user_id
    ).all()
    
    return playlists

@router.post("/{user_id}/playlists", response_model=schemas.PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    user_id: int,
    playlist: schemas.PlaylistCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new playlist.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    db_playlist = models.Playlist(**playlist.dict(), user_id=user_id)
    db.add(db_playlist)
    db.commit()
    db.refresh(db_playlist)
    
    return db_playlist

@router.get("/{user_id}/playlists/{playlist_id}", response_model=schemas.PlaylistDetailResponse)
def get_playlist(user_id: int, playlist_id: int, db: Session = Depends(get_db)):
    """
    Get playlist details with songs.
    """
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id,
        models.Playlist.user_id == user_id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    return playlist

@router.post("/{user_id}/playlists/{playlist_id}/songs/{song_id}", status_code=status.HTTP_201_CREATED)
def add_song_to_playlist(user_id: int, playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    """
    Add a song to a playlist.
    """
    # Check if playlist exists and belongs to user
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id,
        models.Playlist.user_id == user_id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    # Check if song exists
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Check if song is already in playlist
    existing = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id,
        models.PlaylistSong.song_id == song_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Song already in playlist"
        )
    
    # Get the next position
    max_position = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id
    ).count()
    
    # Add song to playlist
    playlist_song = models.PlaylistSong(
        playlist_id=playlist_id,
        song_id=song_id,
        position=max_position
    )
    db.add(playlist_song)
    db.commit()
    
    return {"message": "Song added to playlist"}

@router.delete("/{user_id}/playlists/{playlist_id}/songs/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_song_from_playlist(user_id: int, playlist_id: int, song_id: int, db: Session = Depends(get_db)):
    """
    Remove a song from a playlist.
    """
    # Check if playlist exists and belongs to user
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id,
        models.Playlist.user_id == user_id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    # Find the song in playlist
    playlist_song = db.query(models.PlaylistSong).filter(
        models.PlaylistSong.playlist_id == playlist_id,
        models.PlaylistSong.song_id == song_id
    ).first()
    
    if not playlist_song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not in playlist"
        )
    
    db.delete(playlist_song)
    db.commit()
    
    return {"message": "Song removed from playlist"}

@router.delete("/{user_id}/playlists/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_playlist(user_id: int, playlist_id: int, db: Session = Depends(get_db)):
    """
    Delete a playlist.
    """
    playlist = db.query(models.Playlist).filter(
        models.Playlist.id == playlist_id,
        models.Playlist.user_id == user_id
    ).first()
    
    if not playlist:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Playlist not found"
        )
    
    db.delete(playlist)
    db.commit()
    
    return {"message": "Playlist deleted"}
