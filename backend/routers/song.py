from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse, StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
from datetime import datetime

from ..database import get_db
from .. import models, schemas
from ..services.file_service import save_upload_file, get_audio_metadata

router = APIRouter(prefix="/songs", tags=["songs"])

UPLOAD_DIR = "backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=schemas.SongResponse, status_code=status.HTTP_201_CREATED)
async def upload_song(
    title: str = Form(...),
    artist: str = Form(...),
    album: Optional[str] = Form(None),
    genre: Optional[str] = Form(None),
    year: Optional[int] = Form(None),
    file: UploadFile = File(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    # validation 
    if not file.filename.lower().endswith(('.mp3', '.ogg', '.wav')):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only MP3, OGG, and WAV files are allowed"
        )
    
    # get file & metadata
    file_path = await save_upload_file(file, UPLOAD_DIR + '/songs')
    metadata = await get_audio_metadata(file_path)

    if image:
        image_path = await save_upload_file(image, UPLOAD_DIR + '/images')
    else:
        image_path = None
    
    song_data = schemas.SongCreate(
        title=title,
        artist=artist,
        album=album,
        genre=genre,
        year=year,
        file_path=file_path,
        file_type=file.filename.split('.')[-1].lower(),
        file_size=os.path.getsize(file_path),
        duration=metadata.get('duration'),
        image_path=image_path
    )
    
    db_song = models.Song(**song_data.dict())
    db.add(db_song)
    db.commit()
    db.refresh(db_song)
    
    return db_song

@router.get("/", response_model=List[schemas.SongResponse])
def get_all_songs(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    artist: Optional[str] = None,
    genre: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all songs with optional filtering.
    """
    query = db.query(models.Song)
    
    if search:
        query = query.filter(
            models.Song.title.contains(search) | 
            models.Song.artist.contains(search) |
            models.Song.album.contains(search)
        )
    
    if artist:
        query = query.filter(models.Song.artist == artist)
    
    if genre:
        query = query.filter(models.Song.genre == genre)
    
    songs = query.offset(skip).limit(limit).all()
    return songs

@router.get("/{song_id}", response_model=schemas.SongResponse)
def get_song(song_id: int, db: Session = Depends(get_db)):
    """
    Get a specific song by ID.
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    return song

@router.get("/{song_id}/file")
def stream_song_file(song_id: int, db: Session = Depends(get_db)):
    """
    Stream audio file for playback.
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    if not os.path.exists(song.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    
    mime_types = {
        "mp3": "audio/mpeg",
        "ogg": "audio/ogg", 
        "wav": "audio/wav"
    }
    
    return FileResponse(
        song.file_path,
        media_type=mime_types.get(song.file_type, "audio/mpeg"),
        filename=f"{song.title}.{song.file_type}"
    )

@router.get("/{song_id}/download")
def download_song_file(song_id: int, db: Session = Depends(get_db)):
    """
    Download the audio file.
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    if not os.path.exists(song.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Audio file not found"
        )
    
    return FileResponse(
        song.file_path,
        filename=f"{song.title}.{song.file_type}",
        media_type="application/octet-stream"
    )

@router.put("/{song_id}", response_model=schemas.SongResponse)
def update_song(
    song_id: int,
    song_update: schemas.SongUpdate,
    db: Session = Depends(get_db)
):
    """
    Update song metadata.
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    for field, value in song_update.dict(exclude_unset=True).items():
        setattr(song, field, value)
    
    db.commit()
    db.refresh(song)
    return song

@router.delete("/{song_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_song(song_id: int, db: Session = Depends(get_db)):
    """
    Delete a song and its file.
    """
    song = db.query(models.Song).filter(models.Song.id == song_id).first()
    if not song:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Song not found"
        )
    
    # Delete the file if it exists
    if os.path.exists(song.file_path):
        os.remove(song.file_path)
    
    # Delete the song record
    db.delete(song)
    db.commit()
    
    return {"message": "Song deleted successfully"}
