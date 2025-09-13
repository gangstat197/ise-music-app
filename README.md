# Rock 'em All - Music Player App

A modern web-based music player application built with FastAPI backend and vanilla HTML/CSS/JavaScript frontend, containerized with Docker.

## 🎵 Features

- **Music Library Management**: Upload, organize, and manage your music collection
- **Audio Player**: Full-featured music player with play/pause, skip, progress control, and volume adjustment
- **User System**: User registration, authentication, and personalized favorites
- **Search & Browse**: Search through songs, artists, and albums
- **Recently Played**: Track and display recently listened songs
- **Favorites System**: Save and manage favorite songs
- **Responsive Design**: Modern, mobile-friendly interface
- **File Upload**: Support for various audio formats with metadata extraction

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI with Python 3.x
- **Database**: SQLite with SQLAlchemy ORM
- **File Handling**: Audio file upload and metadata extraction using Mutagen
- **API Documentation**: Auto-generated OpenAPI/Swagger docs
- **CORS**: Configured for cross-origin requests

### Frontend (Vanilla Web)
- **HTML5**: Semantic markup with modern structure
- **CSS3**: Responsive design with custom styling
- **JavaScript**: Vanilla JS for dynamic functionality
- **Nginx**: Static file serving and reverse proxy

### Infrastructure
- **Docker**: Containerized services for easy deployment
- **Docker Compose**: Multi-container orchestration
- **Networking**: Isolated network for service communication

## 📁 Project Structure

```
ise-music-app/
├── backend/                 # FastAPI backend
│   ├── main.py             # FastAPI application entry point
│   ├── models.py           # SQLAlchemy database models
│   ├── schemas.py          # Pydantic schemas for API
│   ├── database.py         # Database configuration
│   ├── requirements.txt    # Python dependencies
│   ├── routers/            # API route handlers
│   ├── services/           # Business logic services
│   ├── uploads/            # Uploaded audio files
│   └── songs.db           # SQLite database
├── frontend/               # Web frontend
│   ├── index.html         # Main application page
│   ├── login.html         # User authentication page
│   ├── upload.html        # File upload page
│   ├── js/                # JavaScript modules
│   ├── style/             # CSS stylesheets
│   └── assets/            # Static assets (images, icons)
├── docker/                 # Docker configuration files
├── docker-compose.yml     # Multi-container setup
└── README.md              # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning the repository)

### Installation & Running

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ise-music-app
   ```

2. **Start the application**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Setup

If you prefer to run the services separately for development:

#### Backend Development
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend Development
```bash
cd frontend
# Serve with any static file server, e.g.:
python -m http.server 3000
# or
npx serve -s . -l 3000
```

## 🔧 Configuration

### Environment Variables
The application uses the following environment variables:

- `PYTHONPATH`: Set to `/app` for proper module imports
- Database: SQLite file (`songs.db`) - automatically created
- Upload directory: `uploads/` - created automatically

### Docker Configuration
- **Backend Port**: 8000
- **Frontend Port**: 3000 (mapped to Nginx port 80)
- **Volumes**: Persistent storage for uploads and database
- **Network**: Isolated `music-app-network`

## 📚 API Documentation

The FastAPI backend provides comprehensive API documentation:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

- `GET /` - API information
- `GET /health` - Health check
- `POST /api/v1/songs/upload` - Upload audio files
- `GET /api/v1/songs/` - List all songs
- `GET /api/v1/songs/{id}` - Get song details
- `POST /api/v1/users/` - Create user account
- `POST /api/v1/favorites/` - Add song to favorites
- `GET /api/v1/favorites/{user_id}` - Get user's favorites

## 🎵 Supported Audio Formats

The application supports various audio formats through the Mutagen library:
- MP3
- FLAC
- OGG
- WAV
- M4A
- And more...

## 🛠️ Technologies Used

### Backend
- **FastAPI** 0.104.1 - Modern Python web framework
- **SQLAlchemy** 2.0.23 - Python SQL toolkit and ORM
- **Uvicorn** 0.24.0 - ASGI server
- **Mutagen** 1.47.0 - Audio metadata extraction
- **Python-multipart** 0.0.6 - File upload handling

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript** - Client-side functionality
- **Nginx** - Web server and reverse proxy

### Infrastructure
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **SQLite** - Lightweight database

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is part of an iSE (Information Systems Engineering) final test project.

## 🐛 Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 8000 are available
2. **Permission issues**: Check Docker permissions and file ownership
3. **Database errors**: Delete `songs.db` to reset the database
4. **Upload failures**: Ensure the `uploads/` directory has write permissions

### Logs
View application logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

## 📞 Support

For issues and questions, please create an issue in the repository or contact the development team.

---

**Rock 'em All** - Enjoy your music! 🎸🎵
