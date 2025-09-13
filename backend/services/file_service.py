import os
import shutil
from pathlib import Path
from fastapi import UploadFile
from typing import Dict, Any

async def save_upload_file(upload_file: UploadFile, upload_dir: str) -> str:
    """
    Save uploaded file to the specified directory.
    Returns the file path.
    """
    # Create upload directory if it doesn't exist
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename to avoid conflicts
    file_extension = Path(upload_file.filename).suffix
    unique_filename = f"{upload_file.filename}"
    
    # Ensure filename is unique
    counter = 1
    while os.path.exists(os.path.join(upload_dir, unique_filename)):
        name_without_ext = Path(upload_file.filename).stem
        unique_filename = f"{name_without_ext}_{counter}{file_extension}"
        counter += 1
    
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save the file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return file_path

async def get_audio_metadata(file_path: str) -> Dict[str, Any]:
    """
    Extract audio metadata using mutagen (duration, bitrate, format, file size).
    Supports MP3, OGG, WAV.
    """
    try:
        import mutagen
        from mutagen.mp3 import MP3
        from mutagen.oggvorbis import OggVorbis
        from mutagen.wave import WAVE
        
        file_size = os.path.getsize(file_path)
        file_ext = Path(file_path).suffix.lower()
        duration = None
        bitrate = None
        audio_format = file_ext.lstrip('.')
        
        if file_ext == '.mp3':
            audio = MP3(file_path)
            if audio.info:
                duration = audio.info.length
                bitrate = audio.info.bitrate
        elif file_ext == '.ogg':
            audio = OggVorbis(file_path)
            if audio.info:
                duration = audio.info.length
                bitrate = audio.info.bitrate
        elif file_ext == '.wav':
            audio = WAVE(file_path)
            if audio.info:
                duration = audio.info.length
                bitrate = getattr(audio.info, 'bitrate', None)
        else:
            audio = mutagen.File(file_path)
            if audio and hasattr(audio, 'info'):
                duration = getattr(audio.info, 'length', None)
                bitrate = getattr(audio.info, 'bitrate', None)
        
        return {
            "file_size": file_size,
            "duration": duration,
            "bitrate": bitrate,
            "format": audio_format,
        }
    except Exception as e:
        return {
            "file_size": 0,
            "duration": None,
            "bitrate": None,
            "format": Path(file_path).suffix.lower().lstrip('.'),
            "error": str(e)
        }

def delete_file(file_path: str) -> bool:
    """
    Delete a file from the filesystem.
    Returns True if successful, False otherwise.
    """
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
        return False
    except Exception:
        return False 