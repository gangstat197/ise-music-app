from .song import router as song_router
from .user import router as user_router
from .favorites import router as favorites_router
from .playlists import router as playlists_router

__all__ = [
    "song_router",
    "user_router", 
    "favorites_router",
    "playlists_router"
] 