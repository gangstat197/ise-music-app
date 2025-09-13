// Queue Manager for Music Player
class QueueManager {
    constructor() {
        this.queue = [];
        this.currentIndex = 0;
        this.shuffleMode = false;
        this.repeatMode = 'none'; // 'none', 'one', 'all'
        this.shuffledQueue = [];
        this.modal = document.getElementById('queue-modal');
        this.queueList = document.getElementById('queue-list');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateQueueDisplay();
    }

    setupEventListeners() {
        // Queue button
        const queueBtn = document.querySelector('.queue-btn');
        if (queueBtn) {
            queueBtn.addEventListener('click', () => this.toggleQueueModal());
        }

        // Modal close
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', () => this.closeQueueModal());
        }

        // Close modal when clicking outside
        if (this.modal) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.closeQueueModal();
                }
            });
        }

        // Shuffle button
        const shuffleBtn = document.querySelector('.shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', () => this.toggleShuffle());
        }

        // Repeat button
        const repeatBtn = document.querySelector('.repeat-btn');
        if (repeatBtn) {
            repeatBtn.addEventListener('click', () => this.toggleRepeat());
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.modal && this.modal.getAttribute('aria-hidden') === 'false') {
                this.closeQueueModal();
            }
        });
    }

    /**
     * Add songs to queue
     */
    addToQueue(songs) {
        if (Array.isArray(songs)) {
            this.queue.push(...songs);
        } else {
            this.queue.push(songs);
        }
        this.updateShuffledQueue();
        this.updateQueueDisplay();
        this.updateQueueButton();
    }

    /**
     * Add song to queue after current song
     */
    addNext(song) {
        this.queue.splice(this.currentIndex + 1, 0, song);
        this.updateShuffledQueue();
        this.updateQueueDisplay();
        this.updateQueueButton();
    }

    /**
     * Remove song from queue
     */
    removeFromQueue(index) {
        if (index >= 0 && index < this.queue.length) {
            this.queue.splice(index, 1);
            
            // Adjust current index if necessary
            if (index < this.currentIndex) {
                this.currentIndex--;
            } else if (index === this.currentIndex && this.currentIndex >= this.queue.length) {
                this.currentIndex = Math.max(0, this.queue.length - 1);
            }
            
            this.updateShuffledQueue();
            this.updateQueueDisplay();
            this.updateQueueButton();
        }
    }

    /**
     * Clear queue
     */
    clearQueue() {
        this.queue = [];
        this.currentIndex = 0;
        this.updateShuffledQueue();
        this.updateQueueDisplay();
        this.updateQueueButton();
    }

    /**
     * Get current song
     */
    getCurrentSong() {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        return activeQueue[this.currentIndex] || null;
    }

    /**
     * Get next song
     */
    getNextSong() {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        
        if (this.repeatMode === 'one') {
            return activeQueue[this.currentIndex] || null;
        }
        
        if (this.currentIndex + 1 < activeQueue.length) {
            return activeQueue[this.currentIndex + 1];
        }
        
        if (this.repeatMode === 'all' && activeQueue.length > 0) {
            return activeQueue[0];
        }
        
        return null;
    }

    /**
     * Get previous song
     */
    getPreviousSong() {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        
        if (this.currentIndex - 1 >= 0) {
            return activeQueue[this.currentIndex - 1];
        }
        
        if (this.repeatMode === 'all' && activeQueue.length > 0) {
            return activeQueue[activeQueue.length - 1];
        }
        
        return null;
    }

    /**
     * Move to next song
     */
    next() {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        
        if (this.repeatMode === 'one') {
            return this.getCurrentSong();
        }
        
        if (this.currentIndex + 1 < activeQueue.length) {
            this.currentIndex++;
        } else if (this.repeatMode === 'all' && activeQueue.length > 0) {
            this.currentIndex = 0;
        } else {
            return null;
        }
        
        this.updateQueueDisplay();
        return this.getCurrentSong();
    }

    /**
     * Move to previous song
     */
    previous() {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        
        if (this.currentIndex - 1 >= 0) {
            this.currentIndex--;
        } else if (this.repeatMode === 'all' && activeQueue.length > 0) {
            this.currentIndex = activeQueue.length - 1;
        } else {
            return null;
        }
        
        this.updateQueueDisplay();
        return this.getCurrentSong();
    }

    /**
     * Set current song by index
     */
    setCurrentIndex(index) {
        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        if (index >= 0 && index < activeQueue.length) {
            this.currentIndex = index;
            this.updateQueueDisplay();
            return this.getCurrentSong();
        }
        return null;
    }

    /**
     * Toggle shuffle mode
     */
    toggleShuffle() {
        this.shuffleMode = !this.shuffleMode;
        this.updateShuffledQueue();
        this.updateQueueDisplay();
        this.updateShuffleButton();
        
        if (window.showNotification) {
            window.showNotification(
                `Shuffle ${this.shuffleMode ? 'enabled' : 'disabled'}`,
                'info',
                2000
            );
        }
    }

    /**
     * Toggle repeat mode
     */
    toggleRepeat() {
        const modes = ['none', 'one', 'all'];
        const currentModeIndex = modes.indexOf(this.repeatMode);
        this.repeatMode = modes[(currentModeIndex + 1) % modes.length];
        
        this.updateRepeatButton();
        
        const modeText = {
            'none': 'Repeat off',
            'one': 'Repeat one',
            'all': 'Repeat all'
        };
        
        if (window.showNotification) {
            window.showNotification(
                modeText[this.repeatMode],
                'info',
                2000
            );
        }
    }

    /**
     * Update shuffled queue
     */
    updateShuffledQueue() {
        if (this.shuffleMode) {
            this.shuffledQueue = [...this.queue];
            this.shuffleArray(this.shuffledQueue);
        } else {
            this.shuffledQueue = [...this.queue];
        }
    }

    /**
     * Shuffle array using Fisher-Yates algorithm
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    /**
     * Update queue display
     */
    updateQueueDisplay() {
        if (!this.queueList) return;

        const activeQueue = this.shuffleMode ? this.shuffledQueue : this.queue;
        
        if (activeQueue.length === 0) {
            this.queueList.innerHTML = `
                <div class="empty-queue">
                    <div class="empty-queue-icon">🎵</div>
                    <h3>Queue is empty</h3>
                    <p>Add songs to your queue to see them here</p>
                </div>
            `;
            return;
        }

        this.queueList.innerHTML = activeQueue.map((song, index) => `
            <div class="queue-item ${index === this.currentIndex ? 'current' : ''}" data-index="${index}">
                <div class="queue-item-info">
                    <img src="${song.image_path ? `${window.API_BASE_URL}/songs/${song.id}/image` : 'assets/songs/ontheway.png'}" 
                         alt="${song.title}" 
                         class="queue-item-image"
                         onerror="this.src='assets/songs/ontheway.png'">
                    <div class="queue-item-details">
                        <div class="queue-item-title">${song.title}</div>
                        <div class="queue-item-artist">${song.artist}</div>
                    </div>
                </div>
                <div class="queue-item-actions">
                    <button class="queue-item-play" onclick="queueManager.setCurrentIndex(${index})" 
                            title="Play this song">
                        ${index === this.currentIndex ? '⏸' : '▶'}
                    </button>
                    <button class="queue-item-remove" onclick="queueManager.removeFromQueue(${index})" 
                            title="Remove from queue">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Update queue button
     */
    updateQueueButton() {
        const queueBtn = document.querySelector('.queue-btn');
        if (queueBtn) {
            const count = this.queue.length;
            queueBtn.innerHTML = count > 0 ? `📋 (${count})` : '📋';
            queueBtn.title = count > 0 ? `Queue (${count} songs)` : 'Show queue';
        }
    }

    /**
     * Update shuffle button
     */
    updateShuffleButton() {
        const shuffleBtn = document.querySelector('.shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.toggle('active', this.shuffleMode);
            shuffleBtn.title = this.shuffleMode ? 'Disable shuffle' : 'Enable shuffle';
        }
    }

    /**
     * Update repeat button
     */
    updateRepeatButton() {
        const repeatBtn = document.querySelector('.repeat-btn');
        if (repeatBtn) {
            repeatBtn.classList.toggle('active', this.repeatMode !== 'none');
            repeatBtn.innerHTML = this.repeatMode === 'one' ? '🔂' : 
                                 this.repeatMode === 'all' ? '🔁' : '🔁';
            repeatBtn.title = this.repeatMode === 'none' ? 'Repeat off' :
                             this.repeatMode === 'one' ? 'Repeat one' : 'Repeat all';
        }
    }

    /**
     * Toggle queue modal
     */
    toggleQueueModal() {
        if (this.modal) {
            const isHidden = this.modal.getAttribute('aria-hidden') === 'true';
            this.modal.setAttribute('aria-hidden', !isHidden);
            this.modal.style.display = isHidden ? 'flex' : 'none';
            
            if (isHidden) {
                this.updateQueueDisplay();
                // Focus first focusable element
                const firstButton = this.modal.querySelector('button');
                if (firstButton) firstButton.focus();
            }
        }
    }

    /**
     * Close queue modal
     */
    closeQueueModal() {
        if (this.modal) {
            this.modal.setAttribute('aria-hidden', 'true');
            this.modal.style.display = 'none';
        }
    }

    /**
     * Get queue info
     */
    getQueueInfo() {
        return {
            queue: [...this.queue],
            currentIndex: this.currentIndex,
            shuffleMode: this.shuffleMode,
            repeatMode: this.repeatMode,
            currentSong: this.getCurrentSong(),
            nextSong: this.getNextSong(),
            previousSong: this.getPreviousSong()
        };
    }
}

// Create global instance
window.queueManager = new QueueManager();

// Add CSS for queue
const queueStyles = `
.queue-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--spacing-md);
    border-bottom: 1px solid var(--border-light);
    transition: all var(--transition-fast);
    cursor: pointer;
}

.queue-item:hover {
    background: var(--bg-tertiary);
}

.queue-item.current {
    background: rgba(102, 126, 234, 0.1);
    border-left: 3px solid var(--primary-color);
}

.queue-item-info {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    flex: 1;
    min-width: 0;
}

.queue-item-image {
    width: 50px;
    height: 50px;
    border-radius: var(--radius-md);
    object-fit: cover;
    flex-shrink: 0;
}

.queue-item-details {
    flex: 1;
    min-width: 0;
}

.queue-item-title {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.queue-item-artist {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.queue-item-actions {
    display: flex;
    gap: var(--spacing-sm);
    flex-shrink: 0;
}

.queue-item-play,
.queue-item-remove {
    background: none;
    border: none;
    font-size: 1rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: var(--radius-full);
    transition: all var(--transition-fast);
    color: var(--text-muted);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.queue-item-play:hover,
.queue-item-remove:hover {
    background: var(--bg-primary);
    color: var(--text-primary);
    transform: scale(1.1);
}

.queue-item-remove:hover {
    color: var(--error-color);
}

.empty-queue {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-muted);
}

.empty-queue-icon {
    font-size: 3rem;
    margin-bottom: var(--spacing-md);
}

.empty-queue h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
}

.shuffle-btn.active,
.repeat-btn.active {
    color: var(--primary-color);
    background: rgba(102, 126, 234, 0.1);
}

@media (max-width: 600px) {
    .queue-item {
        padding: var(--spacing-sm);
    }
    
    .queue-item-image {
        width: 40px;
        height: 40px;
    }
    
    .queue-item-actions {
        flex-direction: column;
        gap: var(--spacing-xs);
    }
}
`;

// Inject queue styles
const queueStyleSheet = document.createElement('style');
queueStyleSheet.textContent = queueStyles;
document.head.appendChild(queueStyleSheet);

console.log('Queue manager loaded');
