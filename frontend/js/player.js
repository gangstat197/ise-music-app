// Audio player state
let currentSongId = null;
let isPlaying = false;
let isMuted = false;
let previousVolume = 70;

// DOM elements
let audioPlayer = null;
let playButton = null;
let progressBar = null;
let currentTimeSpan = null;
let durationSpan = null;
let volumeBar = null;
let volumeBtn = null;
let volumeLevel = null;
let playerSongInfo = null;
let playerSongTitle = null;
let playerSongArtist = null;
let playerAlbumArt = null;
let playerFavoriteBtn = null;
let searchInput = null;
let searchClear = null;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing player...');
    console.log('User service available:', !!window.userService);
    console.log('API base URL available:', !!window.API_BASE_URL);
    console.log('API base URL:', window.API_BASE_URL || 'Not available yet');
    
    // Initialize immediately
    initializePlayer();
    
    // Check URL parameters to determine what to load
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view');
    const userId = urlParams.get('user_id');
    
    // Reset favorites page flag
    window.isFavoritesPage = false;
    
    if (view === 'my-songs' && userId) {
        loadUserSongs(userId);
    } else if (view === 'favorites' && userId) {
        // Load favorites using the favorites manager
        console.log('Loading favorites page for user:', userId);
        if (window.loadUserFavorites) {
            window.loadUserFavorites(userId);
        } else {
            console.error('Favorites manager not loaded - waiting and retrying...');
            // Wait a bit for favorites.js to load and retry
            setTimeout(() => {
                if (window.loadUserFavorites) {
                    window.loadUserFavorites(userId);
                } else {
                    console.error('Favorites manager still not available');
                }
            }, 100);
        }
    } else {
        loadSongs();
    }
    
    setupEventListeners();
    setupSearch();
    console.log('Player initialization complete');
});

function initializePlayer() {
    // Create audio element 
    if (!audioPlayer) {
        audioPlayer = new Audio();
        audioPlayer.preload = 'metadata';
        audioPlayer.crossOrigin = 'anonymous'; // For CORS
    }
    
    // Get player elements
    playButton = document.querySelector('.player-controls .play-btn');
    progressBar = document.getElementById('progress-bar');
    currentTimeSpan = document.getElementById('current-time');
    durationSpan = document.getElementById('duration');
    volumeBar = document.getElementById('volume-bar');
    volumeBtn = document.querySelector('.volume-btn');
    volumeLevel = document.getElementById('volume-level');
    playerSongInfo = document.querySelector('.player-song-info');
    playerSongTitle = document.getElementById('player-song-title');
    playerSongArtist = document.getElementById('player-song-artist');
    playerAlbumArt = document.querySelector('.player-album-art');
    playerFavoriteBtn = document.querySelector('.player-favorite-btn');
    searchInput = document.getElementById('search-input');
    searchClear = document.querySelector('.search-clear');
    
    console.log('Player elements found:');
    console.log('- Play button:', !!playButton);
    console.log('- Progress bar:', !!progressBar);
    console.log('- Current time span:', !!currentTimeSpan);
    console.log('- Duration span:', !!durationSpan);
    console.log('- Volume bar:', !!volumeBar);
    console.log('- Volume button:', !!volumeBtn);
    console.log('- Player song info:', !!playerSongInfo);
    
    // Set initial volume
    audioPlayer.volume = 0.7;
    if (volumeBar) {
        volumeBar.value = 70;
    }
    if (volumeLevel) {
        volumeLevel.textContent = '70%';
    }
    
    // Setup audio event listeners here (after audioPlayer is created)
    if (audioPlayer) {
        audioPlayer.addEventListener('timeupdate', updateProgress);
        audioPlayer.addEventListener('loadedmetadata', updateDuration);
        audioPlayer.addEventListener('ended', onSongEnd);
        audioPlayer.addEventListener('error', onAudioError);
        audioPlayer.addEventListener('loadstart', onLoadStart);
        audioPlayer.addEventListener('canplay', onCanPlay);
        audioPlayer.addEventListener('waiting', onWaiting);
        console.log('Audio event listeners set up');
    }
}

function setupEventListeners() {
    // Play button
    if (playButton) {
        playButton.addEventListener('click', togglePlay);
    }
    
    // Previous/Next buttons
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    if (prevBtn) {
        prevBtn.addEventListener('click', playPrevious);
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', playNext);
    }
    
    // Progress bar
    if (progressBar) {
        console.log('Setting up progress bar event listener');
        progressBar.addEventListener('input', seekTo);
        progressBar.addEventListener('change', seekTo);
        progressBar.addEventListener('mousedown', () => {
            audioPlayer.pause();
        });
        progressBar.addEventListener('mouseup', () => {
            if (isPlaying) {
                audioPlayer.play();
            }
        });
    }
    
    // Volume controls
    if (volumeBar) {
        volumeBar.addEventListener('input', changeVolume);
    }
    if (volumeBtn) {
        volumeBtn.addEventListener('click', toggleMute);
    }
    
    // Player favorite button
    if (playerFavoriteBtn) {
        playerFavoriteBtn.addEventListener('click', toggleCurrentSongFavorite);
    }
    
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }
    if (searchClear) {
        searchClear.addEventListener('click', clearSearch);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Audio events are now set up in initializePlayer() after audioPlayer is created
}

// User-specific functions
function getCurrentUserId() {
    if (!window.userService) {
        console.warn('User service not available');
        return null;
    }
    return window.userService.getUserId();
}

function isUserLoggedIn() {
    if (!window.userService) {
        console.warn('User service not available');
        return false;
    }
    return window.userService.isAuthenticated();
}

async function toggleFavorite(songId) {
    if (!isUserLoggedIn()) {
        alert('Please login to add songs to favorites');
        return;
    }

    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/${userId}/favorites/${songId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            // Update UI to show it's favorited
            const favoriteBtn = document.querySelector(`[data-song-id="${songId}"] .favorite-btn`);
            if (favoriteBtn) {
                favoriteBtn.classList.add('favorited');
                favoriteBtn.innerHTML = '❤️';
            }
        } else if (response.status === 400) {
            // Song already in favorites, remove it
            await removeFromFavorites(songId);
        }
    } catch (error) {
        console.error('Error toggling favorite:', error);
    }
}

async function removeFromFavorites(songId) {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
        const response = await fetch(`${window.API_BASE_URL}/users/${userId}/favorites/${songId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // Update UI to show it's not favorited
            const favoriteBtn = document.querySelector(`[data-song-id="${songId}"] .favorite-btn`);
            if (favoriteBtn) {
                favoriteBtn.classList.remove('favorited');
                favoriteBtn.innerHTML = '🤍';
            }
        }
    } catch (error) {
        console.error('Error removing from favorites:', error);
    }
}

// API Functions
async function loadSongs() {
    console.log('Loading songs...');
    try {
        console.log('Fetching from:', `${window.API_BASE_URL}/songs/`);
        const response = await fetch(`${window.API_BASE_URL}/songs/`);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const songs = await response.json();
        console.log('Songs received:', songs);
        console.log('Number of songs:', songs.length);
        
        displaySongs(songs);
    } catch (error) {
        console.error('Error loading songs:', error);
        displayError('Failed to load songs. Please try again later.');
    }
}

async function loadUserSongs(userId) {
    try {
        console.log('Loading user songs for user ID:', userId);
        const response = await fetch(`${window.API_BASE_URL}/songs/user/${userId}`);
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const songs = await response.json();
        console.log('User songs loaded:', songs.length);
        
        // Update page sections for "My Songs" view
        updatePageForMySongs()
        
        if (songs.length === 0) {
            displayMySongsEmpty();
        } else {
            displaySongs(songs);
        }
    } catch (error) {
        console.error('Error loading user songs:', error);
        displayError('Failed to load your songs. Please try again.');
    }
}

function displayMySongsEmpty() {
    // Clear all song sections
    const recentlyListened = document.querySelector('.recently-listened .song-cards');
    const browseSongs = document.querySelector('.browse-songs .song-cards');
    
    if (recentlyListened) {
        recentlyListened.innerHTML = '<div class="empty-state">No recent uploads</div>';
    }
    
    if (browseSongs) {
        browseSongs.innerHTML = `
            <div class="empty-state" style="text-align: center; padding: 40px; color: #666;">
                <h3>You haven't uploaded any songs yet</h3>
                <p>Start building your music collection by uploading your first song!</p>
                <a href="upload.html" style="display: inline-block; margin-top: 15px; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Upload Your First Song</a>
            </div>
        `;
    }
}

function goBackToAllSongs() {
    window.location.href = 'index.html';
}

async function deleteSong(songId) {
    if (!confirm('Are you sure you want to delete this song? This action cannot be undone.')) {
        return;
    }
    
    try {
        const apiUrl = window.API_BASE_URL || 'http://localhost:8000/api/v1';
        const response = await fetch(`${apiUrl}/songs/${songId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Song deleted successfully!');
            // Reload the current page to refresh the song list
            window.location.reload();
        } else {
            const errorText = await response.text();
            console.error('Delete failed:', errorText);
            alert('Failed to delete song: ' + response.status);
        }
    } catch (error) {
        console.error('Delete error:', error);
        alert('Error deleting song: ' + error.message);
    }
}

function updatePageForMySongs() {
    // Add a page title for "My Songs" view
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
        // Check if title already exists
        let pageTitle = mainContent.querySelector('.page-title');
        if (!pageTitle) {
            pageTitle = document.createElement('h1');
            pageTitle.className = 'page-title';
            pageTitle.style.cssText = 'margin: 20px 0; color: #333; font-size: 2rem;';
            
            // Insert after search bar
            const searchBar = mainContent.querySelector('.search-bar');
            if (searchBar) {
                searchBar.insertAdjacentElement('afterend', pageTitle);
            } else {
                mainContent.insertBefore(pageTitle, mainContent.firstChild);
            }
        }
        pageTitle.innerHTML = 'My Songs <button onclick="goBackToAllSongs()" style="margin-left: 15px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">← Back to All Songs</button>';
    }
    
    // Update section titles for "My Songs" view
    const recentlyListenedTitle = document.querySelector('.recently-listened h2');
    if (recentlyListenedTitle) {
        recentlyListenedTitle.textContent = 'Recent Uploads';
    }
    
    const browseSongsTitle = document.querySelector('.browse-songs h2');
    if (browseSongsTitle) {
        browseSongsTitle.textContent = 'All My Songs';
    }
    
    // Hide trending section since it's not relevant for personal songs
    const trendingSection = document.querySelector('.trending-popular');
    if (trendingSection) {
        trendingSection.style.display = 'none';
    }
}

function displaySongs(songs) {
    console.log('Displaying songs...');
    console.log('Songs to display:', songs);
    
    // Check if we're in "My Songs" view
    const urlParams = new URLSearchParams(window.location.search);
    const isMySONgsView = urlParams.get('view') === 'my-songs';
    
    // Update recently listened section (show recent uploads for My Songs)
    const recentlyListened = document.querySelector('.recently-listened .song-cards');
    console.log('Recently listened container:', recentlyListened);
    if (recentlyListened) {
        recentlyListened.innerHTML = '';
        const recentSongs = isMySONgsView ? songs.slice(0, 4) : songs.slice(0, 4);
        recentSongs.forEach(song => {
            const card = createSongCard(song);
            console.log('Created song card:', card);
            recentlyListened.appendChild(card);
        });
    }
    
    // Update browse songs section
    const browseSongs = document.querySelector('.browse-songs .song-cards');
    console.log('Browse songs container:', browseSongs);
    if (browseSongs) {
        browseSongs.innerHTML = '';
        songs.forEach(song => {
            const card = createSongCard(song);
            console.log('Created song card for browse:', card);
            browseSongs.appendChild(card);
        });
    }
    
    // Update trending songs section
    const trendingSongs = document.querySelector('.trending-songs ul');
    console.log('Trending songs container:', trendingSongs);
    if (trendingSongs) {
        trendingSongs.innerHTML = '';
        songs.slice(0, 3).forEach(song => {
            const item = createTrendingSongItem(song);
            console.log('Created trending item:', item);
            trendingSongs.appendChild(item);
        });
    }
}

function createSongCard(song) {
    console.log('Creating song card for:', song);
    const card = document.createElement('div');
    card.className = 'song-card';
    card.dataset.songId = song.id;
    
    const imageSrc = song.image_path ? `${window.API_BASE_URL}/songs/${song.id}/image` : 'assets/songs/ontheway.png';
    console.log('Image source:', imageSrc);
    
    const isLoggedIn = isUserLoggedIn();
    const currentUserId = localStorage.getItem('user_id');
    
    // Check if we're in "My Songs" view and this song belongs to current user
    const urlParams = new URLSearchParams(window.location.search);
    const isMySONgsView = urlParams.get('view') === 'my-songs';
    const isUserSong = song.user_id && currentUserId && song.user_id.toString() === currentUserId;
    const showDeleteButton = isMySONgsView && isUserSong;
    
    console.log('User logged in:', isLoggedIn);
    console.log('Current user ID:', currentUserId);
    console.log('Song user ID:', song.user_id);
    console.log('Is My Songs view:', isMySONgsView);
    console.log('Show delete button:', showDeleteButton);
    
    card.innerHTML = `
        <img src="${imageSrc}" alt="${song.title}" onerror="this.src='assets/songs/ontheway.png'">
        <div class="song-info">
            <span class="song-title">${song.title}</span>
            <span class="song-artist">${song.artist}</span>
        </div>
        <div class="play-overlay">
            <span class="play-icon">▶</span>
        </div>
        ${isLoggedIn ? `
            <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${song.id})" title="Add to favorites" data-song-id="${song.id}">
                🤍
            </button>
        ` : ''}
        ${showDeleteButton ? `
            <button class="delete-btn" onclick="event.stopPropagation(); deleteSong(${song.id})" title="Delete song">
                🗑️
            </button>
        ` : ''}
        <button class="download-btn" onclick="event.stopPropagation(); downloadSong(${song.id}, '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}');" title="Download song" style="position: absolute; top: 90px; right: 10px; background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 16px; cursor: pointer; z-index: 10; color: #3498db;">
            📥
        </button>
    `;
    
    // Add click event
    card.addEventListener('click', () => playSong(song));
    
    // Check and update favorite status if user is logged in
    if (isLoggedIn && currentUserId) {
        updateFavoriteButtonState(song.id, currentUserId);
    }
    
    console.log('Song card created:', card);
    return card;
}

// Function to update favorite button state based on current favorite status
async function updateFavoriteButtonState(songId, userId) {
    try {
        // Skip updating if we're on the favorites page (all should be red)
        if (window.isFavoritesPage) {
            console.log('Skipping favorite button update - on favorites page');
            return;
        }
        
        // Check if the song is in user's favorites
        const isFavorite = await window.checkIfFavorite(songId, userId);
        
        // Find the favorite button for this song
        const button = document.querySelector(`[data-song-id="${songId}"].favorite-btn`);
        if (button) {
            button.textContent = isFavorite ? '❤️' : '🤍';
            button.title = isFavorite ? 'Remove from favorites' : 'Add to favorites';
        }
    } catch (error) {
        console.error('Error updating favorite button state:', error);
    }
}

function createTrendingSongItem(song) {
    const item = document.createElement('li');
    item.dataset.songId = song.id;
    
    const duration = song.duration ? formatDuration(song.duration) : '--:--';
    
    item.innerHTML = `
        <span class="play-btn">▶</span>
        <span class="song-title">${song.title}</span>
        <span class="song-artist">${song.artist}</span>
        <span class="song-duration">${duration}</span>
    `;
    
    // Add click event
    item.addEventListener('click', () => playSong(song));
    
    return item;
}

// Audio Player Functions
async function playSong(song) {
    try {
        // Show loading state
        if (window.showNotification) {
            window.showNotification('Loading song...', 'info', 1000);
        }
        
        // Stop current audio if playing
        if (audioPlayer && isPlaying) {
            audioPlayer.pause();
        }
        
        // Set new audio source
        const audioUrl = `${window.API_BASE_URL}/songs/${song.id}/file`;
        audioPlayer.src = audioUrl;
        
        // Update player info
        updatePlayerInfo(song);
        
        // Add to queue if not already there
        if (window.queueManager) {
            window.queueManager.addToQueue(song);
        }
        
        // Play the song
        await audioPlayer.play();
        
        currentSongId = song.id;
        isPlaying = true;
        updatePlayButton();
        
        // Add visual feedback to the clicked card
        highlightPlayingCard(song.id);
        
        // Update favorite button state
        updatePlayerFavoriteButton();
        
        // Show success notification
        if (window.showNotification) {
            window.showNotification(`Now playing: ${song.title}`, 'success', 2000);
        }
        
    } catch (error) {
        console.error('Error playing song:', error);
        if (window.showNotification) {
            window.showNotification('Failed to play song. Please try again.', 'error', 3000);
        } else {
            displayError('Failed to play song. Please try again.');
        }
    }
}

function togglePlay() {
    if (!audioPlayer) return;
    
    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayButton();
}

function updatePlayButton() {
    if (playButton) {
        playButton.textContent = isPlaying ? '⏸' : '▶';
    }
}

function updatePlayerInfo(song) {
    const imageSrc = song.image_path ? `${window.API_BASE_URL}/songs/${song.id}/image` : 'assets/songs/ontheway.png';
    
    // Update album art
    if (playerAlbumArt) {
        playerAlbumArt.src = imageSrc;
        playerAlbumArt.alt = `${song.title} album cover`;
        playerAlbumArt.onerror = function() {
            this.src = 'assets/songs/ontheway.png';
        };
    }
    
    // Update song title
    if (playerSongTitle) {
        playerSongTitle.textContent = song.title;
    }
    
    // Update song artist
    if (playerSongArtist) {
        playerSongArtist.textContent = song.artist;
    }
    
    // Update page title
    document.title = `${song.title} - ${song.artist} | Rock 'em All`;
}

function updateProgress() {
    if (progressBar && currentTimeSpan && audioPlayer) {
        const currentTime = audioPlayer.currentTime;
        const duration = audioPlayer.duration;
        
        // Update current time display
        currentTimeSpan.textContent = formatTime(currentTime);
        
        // Update progress bar if duration is available
        if (duration && !isNaN(currentTime) && !isNaN(duration) && duration > 0) {
            const progress = (currentTime / duration) * 100;
            progressBar.value = Math.min(100, Math.max(0, progress)); // Clamp between 0-100
        }
    }
}

function updateDuration() {
    if (durationSpan) {
        durationSpan.textContent = formatTime(audioPlayer.duration);
    }
}

function seekTo(event) {
    console.log('Seek event triggered:', event.type);
    console.log('Progress bar value:', progressBar ? progressBar.value : 'null');
    console.log('Audio duration:', audioPlayer ? audioPlayer.duration : 'null');
    
    if (progressBar && audioPlayer && audioPlayer.duration) {
        const seekTime = (progressBar.value / 100) * audioPlayer.duration;
        console.log('Seeking to:', seekTime, 'seconds');
        
        // Ensure seek time is within valid range
        if (seekTime >= 0 && seekTime <= audioPlayer.duration) {
            audioPlayer.currentTime = seekTime;
            console.log('Seek successful');
        } else {
            console.warn('Invalid seek time:', seekTime);
        }
    } else {
        console.warn('Cannot seek: missing progress bar, audio player, or duration');
    }
}

function changeVolume() {
    if (volumeBar) {
        const volume = volumeBar.value / 100;
        audioPlayer.volume = volume;
        previousVolume = volumeBar.value;
        
        if (volumeLevel) {
            volumeLevel.textContent = Math.round(volume * 100) + '%';
        }
        
        // Update volume button icon
        if (volumeBtn) {
            if (volume === 0) {
                volumeBtn.textContent = '🔇';
            } else if (volume < 0.5) {
                volumeBtn.textContent = '🔉';
            } else {
                volumeBtn.textContent = '🔊';
            }
        }
    }
}

function toggleMute() {
    if (!volumeBar) return;
    
    isMuted = !isMuted;
    
    if (isMuted) {
        previousVolume = volumeBar.value;
        volumeBar.value = 0;
        audioPlayer.volume = 0;
        if (volumeLevel) volumeLevel.textContent = '0%';
        if (volumeBtn) volumeBtn.textContent = '🔇';
    } else {
        volumeBar.value = previousVolume;
        audioPlayer.volume = previousVolume / 100;
        if (volumeLevel) volumeLevel.textContent = previousVolume + '%';
        if (volumeBtn) {
            if (previousVolume < 50) {
                volumeBtn.textContent = '🔉';
            } else {
                volumeBtn.textContent = '🔊';
            }
        }
    }
    
    if (window.showNotification) {
        window.showNotification(
            `Volume ${isMuted ? 'muted' : 'unmuted'}`,
            'info',
            1500
        );
    }
}

function playPrevious() {
    if (window.queueManager) {
        const previousSong = window.queueManager.previous();
        if (previousSong) {
            playSong(previousSong);
        }
    }
}

function playNext() {
    if (window.queueManager) {
        const nextSong = window.queueManager.next();
        if (nextSong) {
            playSong(nextSong);
        }
    }
}

function toggleCurrentSongFavorite() {
    if (currentSongId && window.toggleFavorite) {
        window.toggleFavorite(currentSongId);
        updatePlayerFavoriteButton();
    }
}

function updatePlayerFavoriteButton() {
    if (!playerFavoriteBtn || !currentSongId) return;
    
    // This would need to check if the current song is favorited
    // For now, we'll just toggle the visual state
    const isFavorited = playerFavoriteBtn.textContent === '❤️';
    playerFavoriteBtn.textContent = isFavorited ? '🤍' : '❤️';
    playerFavoriteBtn.title = isFavorited ? 'Add to favorites' : 'Remove from favorites';
}

function handleSearchInput(e) {
    const query = e.target.value.trim();
    
    if (searchClear) {
        searchClear.style.display = query.length > 0 ? 'block' : 'none';
    }
    
    if (query.length > 0) {
        debounceSearch(query);
    } else {
        loadSongs();
    }
}

function handleSearchKeydown(e) {
    if (e.key === 'Enter') {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query.length > 0) {
            searchSongs(query);
        }
    } else if (e.key === 'Escape') {
        clearSearch();
    }
}

function clearSearch() {
    if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
    }
    if (searchClear) {
        searchClear.style.display = 'none';
    }
    loadSongs();
}

function debounceSearch(query) {
    clearTimeout(debounceSearch.timeout);
    debounceSearch.timeout = setTimeout(() => {
        searchSongs(query);
    }, 300);
}

function handleKeyboardShortcuts(e) {
    // Don't trigger shortcuts when typing in inputs
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }
    
    switch (e.key) {
        case ' ':
            e.preventDefault();
            togglePlay();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            seekBackward();
            break;
        case 'ArrowRight':
            e.preventDefault();
            seekForward();
            break;
        case 'ArrowUp':
            e.preventDefault();
            increaseVolume();
            break;
        case 'ArrowDown':
            e.preventDefault();
            decreaseVolume();
            break;
        case 'm':
        case 'M':
            e.preventDefault();
            toggleMute();
            break;
        case 'f':
        case 'F':
            e.preventDefault();
            toggleCurrentSongFavorite();
            break;
        case 'n':
        case 'N':
            e.preventDefault();
            playNext();
            break;
        case 'p':
        case 'P':
            e.preventDefault();
            playPrevious();
            break;
    }
}

function seekBackward() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.max(0, audioPlayer.currentTime - 10);
    }
}

function seekForward() {
    if (audioPlayer) {
        audioPlayer.currentTime = Math.min(audioPlayer.duration, audioPlayer.currentTime + 10);
    }
}

function increaseVolume() {
    if (volumeBar) {
        const newVolume = Math.min(100, parseInt(volumeBar.value) + 10);
        volumeBar.value = newVolume;
        changeVolume();
    }
}

function decreaseVolume() {
    if (volumeBar) {
        const newVolume = Math.max(0, parseInt(volumeBar.value) - 10);
        volumeBar.value = newVolume;
        changeVolume();
    }
}

function onSongEnd() {
    isPlaying = false;
    updatePlayButton();
    removeHighlightFromCards();
}

function onAudioError() {
    console.error('Audio playback error');
    if (window.showNotification) {
        window.showNotification('Error playing audio. Please try again.', 'error', 3000);
    } else {
        displayError('Error playing audio. Please try again.');
    }
    isPlaying = false;
    updatePlayButton();
}

function onLoadStart() {
    console.log('Audio loading started');
    if (window.showNotification) {
        window.showNotification('Loading audio...', 'info', 1000);
    }
}

function onCanPlay() {
    console.log('Audio can start playing');
    // Remove any loading notifications
}

function onWaiting() {
    console.log('Audio is waiting for more data');
    if (window.showNotification) {
        window.showNotification('Buffering...', 'info', 1000);
    }
}

// Utility Functions
function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function formatDuration(seconds) {
    return formatTime(seconds);
}

function highlightPlayingCard(songId) {
    // Remove previous highlights
    removeHighlightFromCards();
    
    // Add highlight to current card
    const cards = document.querySelectorAll(`[data-song-id="${songId}"]`);
    cards.forEach(card => {
        card.classList.add('playing');
    });
}

function removeHighlightFromCards() {
    const playingCards = document.querySelectorAll('.song-card.playing, .trending-songs li.playing');
    playingCards.forEach(card => {
        card.classList.remove('playing');
    });
}

function displayError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 10px 20px;
        border-radius: 5px;
        z-index: 1000;
        font-size: 14px;
    `;
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 3000);
}

// Search functionality
function setupSearch() {
    // Search is now handled in setupEventListeners
    console.log('Search functionality initialized');
}

async function searchSongs(query) {
    try {
        if (window.showNotification) {
            window.showNotification(`Searching for "${query}"...`, 'info', 1000);
        }
        
        const response = await fetch(`${window.API_BASE_URL}/songs/?search=${encodeURIComponent(query)}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const songs = await response.json();
        
        if (songs.length === 0) {
            if (window.showNotification) {
                window.showNotification(`No songs found for "${query}"`, 'warning', 2000);
            }
        } else {
            if (window.showNotification) {
                window.showNotification(`Found ${songs.length} song(s)`, 'success', 1500);
            }
        }
        
        displaySongs(songs);
    } catch (error) {
        console.error('Error searching songs:', error);
        if (window.showNotification) {
            window.showNotification('Failed to search songs', 'error', 3000);
        } else {
            displayError('Failed to search songs.');
        }
    }
}

// Debounce utility function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
