from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..database import get_db
from .. import models, schemas

router = APIRouter(prefix="/favorites", tags=["favorites"])

@router.get("/{user_id}", response_model=List[schemas.SongResponse])
def get_user_favorites(user_id: int, db: Session = Depends(get_db)):
    """
    Get all favorite songs for a user.
    """
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    favorites = db.query(models.Song).join(models.Favorite).filter(
        models.Favorite.user_id == user_id
    ).order_by(models.Favorite.added_at.desc()).all()
    
    return favorites

@router.post("/{user_id}/{song_id}", status_code=status.HTTP_201_CREATED)
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

@router.delete("/{user_id}/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
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