from fastapi import FastAPI, Depends, status, Response, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
import os
try:
    from .database import engine, SessionLocal, get_db
    from . import models, schemas
    from .routers import song_router, user_router, favorites_router
except ImportError:
    from database import engine, SessionLocal, get_db
    import models, schemas
    from routers import song_router, user_router, favorites_router

app = FastAPI(
    title="Rock 'em All",
    description="A web-based music player",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models.Base.metadata.create_all(bind=engine)

app.include_router(song_router, prefix="/api/v1")
app.include_router(user_router, prefix="/api/v1")
app.include_router(favorites_router, prefix="/api/v1")

uploads_dir = "uploads"
if os.path.exists(uploads_dir):
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "Music Player API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "message": "Music Player API is running"}

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(
        status_code=404,
        content={"error": "Not found", "message": "The requested resource was not found"}
    )

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"error": "Internal server error", "message": "Something went wrong"}
    )


