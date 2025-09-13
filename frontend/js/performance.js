// Performance Optimization Manager
class PerformanceManager {
    constructor() {
        this.imageCache = new Map();
        this.apiCache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
        this.intersectionObserver = null;
        this.init();
    }

    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupApiCaching();
        this.setupPreloading();
        this.setupServiceWorker();
    }

    /**
     * Setup lazy loading for images
     */
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            this.intersectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        this.loadImage(img);
                        this.intersectionObserver.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px 0px',
                threshold: 0.01
            });

            // Observe all lazy images
            document.addEventListener('DOMContentLoaded', () => {
                const lazyImages = document.querySelectorAll('img[data-src]');
                lazyImages.forEach(img => this.intersectionObserver.observe(img));
            });
        }
    }

    /**
     * Load image with caching
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;

        // Check cache first
        if (this.imageCache.has(src)) {
            img.src = this.imageCache.get(src);
            img.classList.remove('lazy');
            return;
        }

        // Create new image to test loading
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.classList.remove('lazy');
            this.imageCache.set(src, src);
        };
        tempImg.onerror = () => {
            img.src = 'assets/songs/ontheway.png';
            img.classList.remove('lazy');
        };
        tempImg.src = src;
    }

    /**
     * Setup image optimization
     */
    setupImageOptimization() {
        // Add loading states to images
        document.addEventListener('DOMContentLoaded', () => {
            const images = document.querySelectorAll('img');
            images.forEach(img => {
                if (!img.complete) {
                    img.classList.add('loading');
                    img.addEventListener('load', () => {
                        img.classList.remove('loading');
                    });
                    img.addEventListener('error', () => {
                        img.classList.remove('loading');
                        img.classList.add('error');
                    });
                }
            });
        });
    }

    /**
     * Setup API response caching
     */
    setupApiCaching() {
        // Override fetch to add caching
        const originalFetch = window.fetch;
        window.fetch = async (url, options = {}) => {
            const cacheKey = `${url}_${JSON.stringify(options)}`;
            
            // Check cache first
            if (this.apiCache.has(cacheKey)) {
                const cached = this.apiCache.get(cacheKey);
                if (Date.now() - cached.timestamp < this.cacheTimeout) {
                    return new Response(JSON.stringify(cached.data), {
                        status: 200,
                        statusText: 'OK',
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            }

            // Make request
            const response = await originalFetch(url, options);
            
            // Cache successful responses
            if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
                const data = await response.clone().json();
                this.apiCache.set(cacheKey, {
                    data,
                    timestamp: Date.now()
                });
            }

            return response;
        };
    }

    /**
     * Setup preloading for critical resources
     */
    setupPreloading() {
        // Preload critical CSS
        const criticalCSS = document.createElement('link');
        criticalCSS.rel = 'preload';
        criticalCSS.href = 'style/style.css';
        criticalCSS.as = 'style';
        document.head.appendChild(criticalCSS);

        // Preload critical JavaScript
        const criticalJS = document.createElement('link');
        criticalJS.rel = 'preload';
        criticalJS.href = 'js/player.js';
        criticalJS.as = 'script';
        document.head.appendChild(criticalJS);

        // Preload fonts
        const fontPreload = document.createElement('link');
        fontPreload.rel = 'preload';
        fontPreload.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
        fontPreload.as = 'style';
        document.head.appendChild(fontPreload);
    }

    /**
     * Setup service worker for caching
     */
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then(registration => {
                        console.log('ServiceWorker registered successfully');
                    })
                    .catch(error => {
                        console.log('ServiceWorker registration failed');
                    });
            });
        }
    }

    /**
     * Debounce function calls
     */
    debounce(func, wait) {
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

    /**
     * Throttle function calls
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    /**
     * Optimize scroll performance
     */
    optimizeScroll() {
        let ticking = false;
        
        const updateScroll = () => {
            // Handle scroll-based animations here
            ticking = false;
        };

        const requestTick = () => {
            if (!ticking) {
                requestAnimationFrame(updateScroll);
                ticking = true;
            }
        };

        window.addEventListener('scroll', requestTick, { passive: true });
    }

    /**
     * Preload next song in queue
     */
    preloadNextSong() {
        if (window.queueManager) {
            const nextSong = window.queueManager.getNextSong();
            if (nextSong) {
                const audio = new Audio();
                audio.preload = 'metadata';
                audio.src = `${window.API_BASE_URL}/songs/${nextSong.id}/file`;
            }
        }
    }

    /**
     * Clear old cache entries
     */
    clearOldCache() {
        const now = Date.now();
        for (const [key, value] of this.apiCache.entries()) {
            if (now - value.timestamp > this.cacheTimeout) {
                this.apiCache.delete(key);
            }
        }
    }

    /**
     * Get performance metrics
     */
    getPerformanceMetrics() {
        if ('performance' in window) {
            const navigation = performance.getEntriesByType('navigation')[0];
            const paint = performance.getEntriesByType('paint');
            
            return {
                loadTime: navigation.loadEventEnd - navigation.loadEventStart,
                domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
                firstPaint: paint.find(entry => entry.name === 'first-paint')?.startTime || 0,
                firstContentfulPaint: paint.find(entry => entry.name === 'first-contentful-paint')?.startTime || 0,
                cacheSize: this.apiCache.size,
                imageCacheSize: this.imageCache.size
            };
        }
        return null;
    }
}

// Create global instance
window.performanceManager = new PerformanceManager();

// Add performance CSS
const performanceStyles = `
img.loading {
    opacity: 0.5;
    transition: opacity 0.3s ease;
}

img.error {
    opacity: 0.3;
    filter: grayscale(100%);
}

.lazy {
    opacity: 0;
    transition: opacity 0.3s ease;
}

.lazy.loaded {
    opacity: 1;
}

/* Optimize animations for better performance */
.song-card,
.player-controls button,
.notification {
    will-change: transform;
}

/* Reduce motion for users who prefer it */
@media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
    }
}

/* Optimize for low-end devices */
@media (max-width: 600px) {
    .song-card {
        transform: none !important;
    }
    
    .song-card:hover {
        transform: none !important;
    }
}
`;

// Inject performance styles
const performanceStyleSheet = document.createElement('style');
performanceStyleSheet.textContent = performanceStyles;
document.head.appendChild(performanceStyleSheet);

// Clean up cache periodically
setInterval(() => {
    window.performanceManager.clearOldCache();
}, 60000); // Every minute

console.log('Performance manager loaded');
