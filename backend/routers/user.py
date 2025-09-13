from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

try:
    from ..database import get_db
    from .. import models, schemas
except ImportError:
    from database import get_db
    import models, schemas

router = APIRouter(prefix="/users", tags=["users"])

# For now, we'll use a simple user system
# In production, you'd want proper authentication

@router.post("/login", response_model=schemas.UserLoginResponse)
def login_user(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login user and return user ID for universal access.
    """
    # Find user by email (or username)
    user = db.query(models.User).filter(
        models.User.email == login_data.email
    ).first()
    
    if not user:
        user = models.User(
            username=login_data.email.split('@')[0],
            email=login_data.email
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "message": "Login successful"
    }

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

