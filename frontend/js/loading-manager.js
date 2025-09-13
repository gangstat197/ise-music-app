// Loading State Manager
class LoadingManager {
    constructor() {
        this.loadingOverlay = document.getElementById('loading-overlay');
        this.loadingStates = new Map();
        this.init();
    }

    init() {
        this.setupGlobalLoading();
        this.setupLoadingStates();
    }

    /**
     * Setup global loading overlay
     */
    setupGlobalLoading() {
        if (this.loadingOverlay) {
            // Add loading overlay to DOM if it doesn't exist
            if (!document.getElementById('loading-overlay')) {
                const overlay = document.createElement('div');
                overlay.id = 'loading-overlay';
                overlay.className = 'loading-overlay';
                overlay.setAttribute('aria-hidden', 'true');
                overlay.innerHTML = `
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                        <p>Loading...</p>
                    </div>
                `;
                document.body.appendChild(overlay);
                this.loadingOverlay = overlay;
            }
        }
    }

    /**
     * Setup loading states for different components
     */
    setupLoadingStates() {
        // Song loading states
        this.loadingStates.set('songs', {
            element: document.querySelector('.song-cards'),
            loadingText: 'Loading songs...',
            emptyText: 'No songs available'
        });

        // Search loading states
        this.loadingStates.set('search', {
            element: document.querySelector('.search-section'),
            loadingText: 'Searching...',
            emptyText: 'No results found'
        });

        // Upload loading states
        this.loadingStates.set('upload', {
            element: document.querySelector('.upload-form'),
            loadingText: 'Uploading...',
            emptyText: 'Upload failed'
        });
    }

    /**
     * Show global loading overlay
     */
    showGlobalLoading(message = 'Loading...') {
        if (this.loadingOverlay) {
            const textElement = this.loadingOverlay.querySelector('p');
            if (textElement) {
                textElement.textContent = message;
            }
            this.loadingOverlay.setAttribute('aria-hidden', 'false');
            this.loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * Hide global loading overlay
     */
    hideGlobalLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.setAttribute('aria-hidden', 'true');
            this.loadingOverlay.style.display = 'none';
        }
    }

    /**
     * Show loading state for specific component
     */
    showLoading(component, message) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const loadingElement = this.createLoadingElement(message || state.loadingText);
            state.element.innerHTML = '';
            state.element.appendChild(loadingElement);
        }
    }

    /**
     * Hide loading state for specific component
     */
    hideLoading(component) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            // Remove loading elements
            const loadingElements = state.element.querySelectorAll('.loading, .loading-spinner');
            loadingElements.forEach(el => el.remove());
        }
    }

    /**
     * Show empty state for specific component
     */
    showEmpty(component, message) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const emptyElement = this.createEmptyElement(message || state.emptyText);
            state.element.innerHTML = '';
            state.element.appendChild(emptyElement);
        }
    }

    /**
     * Show error state for specific component
     */
    showError(component, message) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const errorElement = this.createErrorElement(message);
            state.element.innerHTML = '';
            state.element.appendChild(errorElement);
        }
    }

    /**
     * Create loading element
     */
    createLoadingElement(message) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading';
        loadingDiv.setAttribute('role', 'status');
        loadingDiv.setAttribute('aria-live', 'polite');
        loadingDiv.innerHTML = `
            <div class="loading-spinner">
                <div class="spinner"></div>
                <p>${message}</p>
            </div>
        `;
        return loadingDiv;
    }

    /**
     * Create empty state element
     */
    createEmptyElement(message) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'empty-state';
        emptyDiv.innerHTML = `
            <div class="empty-icon">🎵</div>
            <h3>${message}</h3>
            <p>Try refreshing the page or check your connection</p>
        `;
        return emptyDiv;
    }

    /**
     * Create error state element
     */
    createErrorElement(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-state';
        errorDiv.innerHTML = `
            <div class="error-icon">⚠️</div>
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="location.reload()" class="retry-btn">Retry</button>
        `;
        return errorDiv;
    }

    /**
     * Show loading with progress
     */
    showProgress(component, progress, message) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const progressElement = this.createProgressElement(progress, message);
            state.element.innerHTML = '';
            state.element.appendChild(progressElement);
        }
    }

    /**
     * Create progress element
     */
    createProgressElement(progress, message) {
        const progressDiv = document.createElement('div');
        progressDiv.className = 'loading-progress';
        progressDiv.innerHTML = `
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%"></div>
                </div>
                <div class="progress-text">${Math.round(progress)}%</div>
            </div>
            <p>${message}</p>
        `;
        return progressDiv;
    }

    /**
     * Show skeleton loading
     */
    showSkeleton(component, count = 6) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const skeletonContainer = document.createElement('div');
            skeletonContainer.className = 'skeleton-container';
            
            for (let i = 0; i < count; i++) {
                const skeletonItem = document.createElement('div');
                skeletonItem.className = 'skeleton-item';
                skeletonContainer.appendChild(skeletonItem);
            }
            
            state.element.innerHTML = '';
            state.element.appendChild(skeletonContainer);
        }
    }

    /**
     * Hide skeleton loading
     */
    hideSkeleton(component) {
        const state = this.loadingStates.get(component);
        if (state && state.element) {
            const skeletonContainer = state.element.querySelector('.skeleton-container');
            if (skeletonContainer) {
                skeletonContainer.remove();
            }
        }
    }

    /**
     * Set loading state for API calls
     */
    async withLoading(component, asyncFunction, loadingMessage) {
        try {
            this.showLoading(component, loadingMessage);
            const result = await asyncFunction();
            this.hideLoading(component);
            return result;
        } catch (error) {
            this.hideLoading(component);
            this.showError(component, error.message);
            throw error;
        }
    }

    /**
     * Set loading state for global operations
     */
    async withGlobalLoading(asyncFunction, loadingMessage) {
        try {
            this.showGlobalLoading(loadingMessage);
            const result = await asyncFunction();
            this.hideGlobalLoading();
            return result;
        } catch (error) {
            this.hideGlobalLoading();
            if (window.showNotification) {
                window.showNotification(error.message, 'error', 3000);
            }
            throw error;
        }
    }
}

// Create global instance
window.loadingManager = new LoadingManager();

// Add loading styles
const loadingStyles = `
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: var(--bg-overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
}

.loading-overlay[aria-hidden="false"] {
    opacity: 1;
    visibility: visible;
}

.loading-spinner {
    text-align: center;
    color: var(--text-inverse);
}

.spinner {
    width: 40px;
    height: 40px;
    border: 4px solid rgba(255, 255, 255, 0.3);
    border-top: 4px solid var(--text-inverse);
    border-radius: var(--radius-full);
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-md);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-progress {
    text-align: center;
    padding: var(--spacing-xl);
}

.progress-container {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    margin-bottom: var(--spacing-md);
}

.progress-bar {
    flex: 1;
    height: 8px;
    background: var(--bg-tertiary);
    border-radius: var(--radius-full);
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
    border-radius: var(--radius-full);
    transition: width var(--transition-normal);
}

.progress-text {
    font-size: var(--font-size-sm);
    font-weight: 600;
    color: var(--text-primary);
    min-width: 40px;
}

.skeleton-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--spacing-lg);
}

.skeleton-item {
    background: var(--bg-tertiary);
    border-radius: var(--radius-lg);
    padding: var(--spacing-lg);
    animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-item::before {
    content: '';
    display: block;
    width: 100%;
    height: 160px;
    background: var(--bg-primary);
    border-radius: var(--radius-md);
    margin-bottom: var(--spacing-md);
}

.skeleton-item::after {
    content: '';
    display: block;
    width: 80%;
    height: 16px;
    background: var(--bg-primary);
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-sm);
}

@keyframes skeleton-loading {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.empty-state,
.error-state {
    text-align: center;
    padding: var(--spacing-2xl);
    color: var(--text-muted);
    grid-column: 1 / -1;
}

.empty-icon,
.error-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-md);
}

.empty-state h3,
.error-state h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-size-xl);
}

.retry-btn {
    background: var(--primary-color);
    color: var(--text-inverse);
    border: none;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    margin-top: var(--spacing-md);
}

.retry-btn:hover {
    background: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

/* Responsive loading states */
@media (max-width: 600px) {
    .skeleton-container {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: var(--spacing-md);
    }
    
    .loading-progress {
        padding: var(--spacing-lg);
    }
    
    .progress-container {
        flex-direction: column;
        gap: var(--spacing-sm);
    }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
    .spinner {
        animation: none;
    }
    
    .skeleton-item {
        animation: none;
    }
    
    .progress-fill {
        transition: none;
    }
}
`;

// Inject loading styles
const loadingStyleSheet = document.createElement('style');
loadingStyleSheet.textContent = loadingStyles;
document.head.appendChild(loadingStyleSheet);

console.log('Loading manager loaded');
