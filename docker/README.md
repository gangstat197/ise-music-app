# 🎵 Rock 'em All - Docker Deployment Guide

## Quick Start

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### 🚀 Launch with Docker

1. **Clone and navigate to project:**
```bash
cd ise-music-app
```

2. **Build and start services:**
```bash
docker-compose up -d --build
```

3. **Access the application:**
- **Frontend (Web Interface):** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### 🛑 Stop Services
```bash
docker-compose down
```

### 🔄 Rebuild After Changes
```bash
docker-compose down
docker-compose up -d --build
```

## 📁 Project Structure

```
ise-music-app/
├── docker-compose.yml          # Main orchestration file
├── backend/
│   ├── Dockerfile              # Backend container config
│   ├── requirements.txt        # Python dependencies
│   ├── main.py                 # FastAPI application
│   └── uploads/                # Uploaded files (persisted)
├── frontend/
│   ├── Dockerfile              # Frontend container config
│   ├── nginx.conf              # Nginx configuration
│   ├── index.html              # Main web page
│   └── js/                     # JavaScript files
└── docker/
    └── README.md               # This file
```

## 🌐 Port Configuration

| Service  | Internal Port | External Port | URL |
|----------|---------------|---------------|-----|
| Frontend | 80            | 3000          | http://localhost:3000 |
| Backend  | 8000          | 8000          | http://localhost:8000 |

## 📱 Features Available

- ✅ **Music Upload** - Upload MP3/OGG/WAV files with metadata
- ✅ **Music Player** - Stream and control playback
- ✅ **User Authentication** - Simple login system
- ✅ **My Songs** - View your uploaded tracks
- ✅ **Favorites** - Heart songs you love
- ✅ **Song Management** - Delete your uploads
- ✅ **Search** - Find songs by title, artist, or album

## 🔧 Development Mode

For development with hot reload:

```bash
# Backend only (with reload)
cd backend
docker build -t music-backend .
docker run -p 8000:8000 -v $(pwd):/app music-backend

# Frontend development (use Live Server in VS Code)
# Just open frontend/index.html with Live Server
```

## 📊 Data Persistence

- **Database:** `backend/songs.db` (SQLite)
- **Uploads:** `backend/uploads/` directory
- Both are mounted as volumes for data persistence

## 🐛 Troubleshooting

### Common Issues:

1. **Port already in use:**
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000
# Kill processes or change ports in docker-compose.yml
```

2. **Backend connection issues:**
- Check if backend is running: http://localhost:8000/health
- Verify API docs: http://localhost:8000/docs

3. **Frontend not loading:**
- Ensure nginx container is running
- Check browser console for errors

4. **File upload issues:**
- Verify uploads directory exists and has proper permissions
- Check backend logs: `docker-compose logs backend`

### View Logs:
```bash
# All services
docker-compose logs

# Specific service
docker-compose logs backend
docker-compose logs frontend
```

## 🚀 Production Deployment

For production deployment, update:

1. **docker-compose.yml:**
   - Remove `--reload` from backend command
   - Set proper environment variables
   - Configure proper CORS origins

2. **Security:**
   - Use proper domain names
   - Enable HTTPS
   - Set up proper authentication
   - Configure firewalls

## 🎯 Next Steps

After deployment, you can:
1. Create a user account
2. Upload your favorite songs
3. Create playlists
4. Share with friends!

Enjoy your containerized music streaming app! 🎵
