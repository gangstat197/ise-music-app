// Service Worker for Music App
const CACHE_NAME = 'rock-em-all-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

// Files to cache immediately
const STATIC_FILES = [
    '/',
    '/index.html',
    '/login.html',
    '/upload.html',
    '/style/style.css',
    '/style/login.css',
    '/style/upload.css',
    '/js/user-service.js',
    '/js/navbar.js',
    '/js/player.js',
    '/js/favorites.js',
    '/js/upload.js',
    '/js/login.js',
    '/js/download.js',
    '/js/notifications.js',
    '/js/dark-mode.js',
    '/js/queue-manager.js',
    '/js/performance.js',
    '/assets/songs/ontheway.png'
];

// Install event - cache static files
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('Static files cached');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Error caching static files:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Service Worker activated');
                return self.clients.claim();
            })
    );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome-extension and other non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then(response => {
                // Return cached version if available
                if (response) {
                    return response;
                }

                // Otherwise fetch from network
                return fetch(request)
                    .then(fetchResponse => {
                        // Don't cache if not a valid response
                        if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                            return fetchResponse;
                        }

                        // Clone the response
                        const responseToCache = fetchResponse.clone();

                        // Cache API responses and static assets
                        if (shouldCache(request)) {
                            caches.open(DYNAMIC_CACHE)
                                .then(cache => {
                                    cache.put(request, responseToCache);
                                });
                        }

                        return fetchResponse;
                    })
                    .catch(error => {
                        console.error('Fetch failed:', error);
                        
                        // Return offline page for navigation requests
                        if (request.mode === 'navigate') {
                            return caches.match('/index.html');
                        }
                        
                        throw error;
                    });
            })
    );
});

// Determine if request should be cached
function shouldCache(request) {
    const url = new URL(request.url);
    
    // Cache API responses
    if (url.pathname.startsWith('/api/')) {
        return true;
    }
    
    // Cache static assets
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
        return true;
    }
    
    // Cache HTML pages
    if (url.pathname.match(/\.html$/) || url.pathname === '/') {
        return true;
    }
    
    return false;
}

// Background sync for offline actions
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

async function doBackgroundSync() {
    // Handle offline actions when connection is restored
    console.log('Background sync triggered');
    
    // You could implement offline queue for uploads, favorites, etc.
    // For now, just log that sync occurred
    return Promise.resolve();
}

// Push notifications (for future use)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body,
            icon: '/assets/icons/icon-192x192.png',
            badge: '/assets/icons/badge-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Go to App',
                    icon: '/assets/icons/checkmark.png'
                },
                {
                    action: 'close',
                    title: 'Close',
                    icon: '/assets/icons/xmark.png'
                }
            ]
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Message handling from main thread
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_CACHE_SIZE') {
        caches.keys().then(cacheNames => {
            Promise.all(
                cacheNames.map(cacheName => 
                    caches.open(cacheName).then(cache => cache.keys())
                )
            ).then(cacheKeys => {
                const totalSize = cacheKeys.reduce((total, keys) => total + keys.length, 0);
                event.ports[0].postMessage({ cacheSize: totalSize });
            });
        });
    }
});

console.log('Service Worker loaded');
