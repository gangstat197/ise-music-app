// favorites.js - Handle favorite songs functionality

class FavoritesManager {
    constructor() {
        this.apiUrl = window.API_BASE_URL || 'http://localhost:8000/api/v1';
    }

    /**
     * Load and display user's favorite songs
     */
    async loadUserFavorites(userId) {
        try {
            console.log('Loading user favorites for user ID:', userId);
            
            // Set a flag to indicate we're in favorites mode
            window.isFavoritesPage = true;
            
            const response = await fetch(`${this.apiUrl}/users/${userId}/favorites`);
            
            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const favoriteSongs = await response.json();
            console.log('User favorites loaded:', favoriteSongs.length);
            
            // Update page sections for "Favorites" view
            this.updatePageForFavorites();
            
            if (favoriteSongs.length === 0) {
                this.displayFavoritesEmpty();
            } else {
                // Use special function for favorites to ensure all hearts are red
                this.displayFavoriteSongs(favoriteSongs);
            }
        } catch (error) {
            console.error('Error loading user favorites:', error);
            this.displayError('Failed to load your favorite songs. Please try again.');
        }
    }

    /**
     * Update page layout for favorites view
     */
    updatePageForFavorites() {
        // Add a page title for "Favorites" view
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
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
            pageTitle.innerHTML = 'My Favorite Songs <button onclick="goBackToAllSongs()" style="margin-left: 15px; padding: 8px 16px; background: #667eea; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">← Back to All Songs</button>';
        }
        
        // Update section titles for "Favorites" view
        const recentlyListenedTitle = document.querySelector('.recently-listened h2');
        if (recentlyListenedTitle) {
            recentlyListenedTitle.textContent = 'Recently Favorited';
        }
        
        const browseSongsTitle = document.querySelector('.browse-songs h2');
        if (browseSongsTitle) {
            browseSongsTitle.textContent = 'All Favorite Songs';
        }
        
        // Hide trending section since it's not relevant for favorites
        const trendingSection = document.querySelector('.trending-popular');
        if (trendingSection) {
            trendingSection.style.display = 'none';
        }
    }

    /**
     * Display favorite songs with red hearts
     */
    displayFavoriteSongs(songs) {
        console.log('🔴 DISPLAYING FAVORITE SONGS:', songs.length, 'songs');
        console.log('🔴 Songs data:', songs);
        
        // Update recently listened section
        const recentlyListened = document.querySelector('.recently-listened .song-cards');
        console.log('🔴 Recently listened container:', recentlyListened);
        if (recentlyListened) {
            console.log('🔴 Clearing recently listened and adding favorite cards');
            recentlyListened.innerHTML = '';
            songs.slice(0, 6).forEach(song => {
                const card = this.createFavoriteSongCard(song);
                console.log('🔴 Created favorite song card for recently listened:', card);
                recentlyListened.appendChild(card);
            });
        }
        
        // Update browse songs section
        const browseSongs = document.querySelector('.browse-songs .song-cards');
        console.log('🔴 Browse songs container:', browseSongs);
        if (browseSongs) {
            console.log('🔴 Clearing browse songs and adding favorite cards');
            browseSongs.innerHTML = '';
            songs.forEach(song => {
                const card = this.createFavoriteSongCard(song);
                console.log('🔴 Created favorite song card for browse:', card);
                browseSongs.appendChild(card);
            });
        }
        
        // Hide trending songs section
        const trendingSongs = document.querySelector('.trending-songs ul');
        if (trendingSongs) {
            trendingSongs.innerHTML = '';
        }
        
        console.log('🔴 FINISHED displaying favorite songs with RED HEARTS');
    }

    /**
     * Create song card specifically for favorites page (with red hearts)
     */
    createFavoriteSongCard(song) {
        console.log('🔴 Creating FAVORITE song card for:', song.title, 'Song ID:', song.id);
        const card = document.createElement('div');
        card.className = 'song-card';
        card.dataset.songId = song.id;
        
        const imageSrc = song.image_path ? `${window.API_BASE_URL}/songs/${song.id}/image` : 'assets/songs/ontheway.png';
        console.log('Image source:', imageSrc);
        
        const isLoggedIn = typeof isUserLoggedIn === 'function' ? isUserLoggedIn() : !!localStorage.getItem('user_id');
        console.log('🔴 User logged in status:', isLoggedIn);
        
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
                <button class="favorite-btn" onclick="event.stopPropagation(); toggleFavorite(${song.id})" title="Remove from favorites" data-song-id="${song.id}">
                    ❤️
                </button>
            ` : ''}
            <button class="download-btn" onclick="event.stopPropagation(); downloadSong(${song.id}, '${song.title.replace(/'/g, "\\'")}', '${song.artist.replace(/'/g, "\\'")}');" title="Download song" style="position: absolute; top: 90px; right: 10px; background: rgba(255, 255, 255, 0.9); border: none; border-radius: 50%; width: 35px; height: 35px; font-size: 16px; cursor: pointer; z-index: 10; color: #3498db;">
                📥
            </button>
        `;
        
        // Add click event to play song
        card.addEventListener('click', () => {
            if (typeof playSong === 'function') {
                playSong(song);
            }
        });
        
        console.log('🔴 FAVORITE song card created with RED HEART ❤️ for song:', song.title);
        console.log('🔴 Card HTML:', card.innerHTML);
        return card;
    }

    /**
     * Display empty state for favorites
     */
    displayFavoritesEmpty() {
        const browseSongs = document.querySelector('.browse-songs .song-cards');
        const recentlyListened = document.querySelector('.recently-listened .song-cards');
        
        if (browseSongs) {
            browseSongs.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 3rem; color: #666; grid-column: 1 / -1;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">💔</div>
                    <h3 style="margin-bottom: 1rem; color: #333;">No favorite songs yet</h3>
                    <p style="margin-bottom: 2rem;">Start adding songs to your favorites by clicking the ❤️ button on any song!</p>
                    <button onclick="goBackToAllSongs()" style="padding: 12px 24px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
                        Browse All Songs
                    </button>
                </div>
            `;
        }
        
        if (recentlyListened) {
            recentlyListened.innerHTML = '';
        }
    }

    /**
     * Toggle favorite status of a song
     */
    async toggleFavorite(songId) {
        const userId = localStorage.getItem('user_id');
        if (!userId) {
            alert('Please log in to add favorites.');
            return;
        }

        try {
            // First check if it's already in favorites
            const favoritesResponse = await fetch(`${this.apiUrl}/users/${userId}/favorites`);
            if (!favoritesResponse.ok) {
                throw new Error('Failed to check favorites status');
            }
            
            const favorites = await favoritesResponse.json();
            const isAlreadyFavorite = favorites.some(song => song.id === songId);
            
            let response;
            if (isAlreadyFavorite) {
                // Remove from favorites
                response = await fetch(`${this.apiUrl}/users/${userId}/favorites/${songId}`, {
                    method: 'DELETE'
                });
            } else {
                // Add to favorites
                response = await fetch(`${this.apiUrl}/users/${userId}/favorites/${songId}`, {
                    method: 'POST'
                });
            }
            
            if (response.ok) {
                console.log(isAlreadyFavorite ? 'Removed from favorites' : 'Added to favorites');
                
                // Clear the favorites cache to ensure fresh data
                window.clearFavoritesCache(userId);
                
                // Update the heart icon
                const button = document.querySelector(`[onclick*="toggleFavorite(${songId})"]`);
                if (button) {
                    button.textContent = isAlreadyFavorite ? '🤍' : '❤️';
                    button.title = isAlreadyFavorite ? 'Add to favorites' : 'Remove from favorites';
                }
                
                // If we're on the favorites page and removed a favorite, reload the page
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('view') === 'favorites' && isAlreadyFavorite) {
                    window.location.reload();
                }
            } else {
                throw new Error('Failed to update favorites');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Failed to update favorites. Please try again.');
        }
    }

    /**
     * Display error message
     */
    displayError(message) {
        const browseSongs = document.querySelector('.browse-songs .song-cards');
        if (browseSongs) {
            browseSongs.innerHTML = `
                <div class="error-state" style="text-align: center; padding: 3rem; color: #e74c3c; grid-column: 1 / -1;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h3 style="margin-bottom: 1rem;">Error</h3>
                    <p>${message}</p>
                </div>
            `;
        }
    }
}

// Create global instance
window.favoritesManager = new FavoritesManager();

// Cache for user favorites to avoid repeated API calls
window.userFavoritesCache = new Map();

// Global functions for compatibility
window.loadUserFavorites = function(userId) {
    return window.favoritesManager.loadUserFavorites(userId);
};

window.toggleFavorite = function(songId) {
    return window.favoritesManager.toggleFavorite(songId);
};

// Function to check if a song is in user's favorites
window.checkIfFavorite = async function(songId, userId) {
    if (!userId) return false;
    
    try {
        // Check cache first
        const cacheKey = `user_${userId}`;
        if (window.userFavoritesCache.has(cacheKey)) {
            const favorites = window.userFavoritesCache.get(cacheKey);
            return favorites.some(song => song.id === songId);
        }
        
        // Fetch from API if not cached
        const response = await fetch(`${window.API_BASE_URL}/users/${userId}/favorites`);
        if (response.ok) {
            const favorites = await response.json();
            // Cache the results
            window.userFavoritesCache.set(cacheKey, favorites);
            return favorites.some(song => song.id === songId);
        }
    } catch (error) {
        console.error('Error checking favorite status:', error);
    }
    return false;
};

// Function to clear favorites cache (call after adding/removing favorites)
window.clearFavoritesCache = function(userId) {
    if (userId) {
        window.userFavoritesCache.delete(`user_${userId}`);
    } else {
        window.userFavoritesCache.clear();
    }
};

console.log('Favorites.js loaded successfully');
