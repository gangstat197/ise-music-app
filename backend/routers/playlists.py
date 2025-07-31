from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/playlists", tags=["playlists"])

@router.get("/{user_id}", response_model=List[schemas.PlaylistResponse])
def get_user_playlists(user_id: int, db: Session = Depends(get_db)):
    """
    Get all playlists for a user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    playlists = db.query(models.Playlist).filter(
        models.Playlist.user_id == user_id
    ).order_by(models.Playlist.created_at.desc()).all()
    
    return playlists

@router.post("/{user_id}", response_model=schemas.PlaylistResponse, status_code=status.HTTP_201_CREATED)
def create_playlist(
    user_id: int,
    playlist: schemas.PlaylistCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new playlist for a user.
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

@router.get("/{user_id}/{playlist_id}", response_model=schemas.PlaylistDetailResponse)
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

@router.put("/{user_id}/{playlist_id}", response_model=schemas.PlaylistResponse)
def update_playlist(
    user_id: int,
    playlist_id: int,
    playlist_update: schemas.PlaylistUpdate,
    db: Session = Depends(get_db)
):
    """
    Update playlist details.
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
    
    for field, value in playlist_update.dict(exclude_unset=True).items():
        setattr(playlist, field, value)
    
    db.commit()
    db.refresh(playlist)
    
    return playlist

@router.delete("/{user_id}/{playlist_id}", status_code=status.HTTP_204_NO_CONTENT)
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

# Playlist songs management
@router.post("/{user_id}/{playlist_id}/songs/{song_id}", status_code=status.HTTP_201_CREATED)
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

@router.delete("/{user_id}/{playlist_id}/songs/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@router.put("/{user_id}/{playlist_id}/songs/reorder")
def reorder_playlist_songs(
    user_id: int,
    playlist_id: int,
    song_order: schemas.PlaylistReorder,
    db: Session = Depends(get_db)
):
    """
    Reorder songs in a playlist.
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
    
    # Update song positions
    for position, song_id in enumerate(song_order.song_ids):
        playlist_song = db.query(models.PlaylistSong).filter(
            models.PlaylistSong.playlist_id == playlist_id,
            models.PlaylistSong.song_id == song_id
        ).first()
        
        if playlist_song:
            playlist_song.position = position
    
    db.commit()
    
    return {"message": "Playlist reordered"} 