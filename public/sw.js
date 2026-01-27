/**
 * 🔧 SERVICE WORKER - Kirana Game
 *
 * Cache assets untuk offline play:
 * - Images, audio, fonts
 * - Game scripts and styles
 * - Network-first for API calls
 */

const CACHE_NAME = 'kirana-cache-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/App.jsx',
];

// Assets to cache on install
const CACHE_ON_INSTALL = [
    // Add critical assets here
];

// ========== INSTALL EVENT ==========
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker installing...');
    
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('📦 Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    
    // Activate immediately
    self.skipWaiting();
});

// ========== ACTIVATE EVENT ==========
self.addEventListener('activate', (event) => {
    console.log('✅ Service Worker activated');
    
    // Clean old caches
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => {
                        console.log('🗑️ Deleting old cache:', name);
                        return caches.delete(name);
                    })
            );
        })
    );
    
    // Take control immediately
    self.clients.claim();
});

// ========== FETCH EVENT ==========
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') return;
    
    // Skip external requests (except CDN assets)
    if (!url.origin.includes(self.location.origin) && 
        !url.origin.includes('fonts.googleapis.com') &&
        !url.origin.includes('fonts.gstatic.com')) {
        return;
    }
    
    // Skip Gemini API calls (network only)
    if (url.pathname.includes('generativelanguage.googleapis.com')) {
        return;
    }
    
    // Strategy: Stale-While-Revalidate for assets
    if (isAsset(url.pathname)) {
        event.respondWith(staleWhileRevalidate(request));
        return;
    }
    
    // Strategy: Network-first for HTML/JS (dev mode)
    event.respondWith(networkFirst(request));
});

// ========== CACHING STRATEGIES ==========

/**
 * Stale-While-Revalidate: Return cache, update in background
 * Best for: images, audio, fonts
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Fetch fresh in background
    const fetchPromise = fetch(request).then((response) => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => cachedResponse);
    
    // Return cached immediately, or wait for network
    return cachedResponse || fetchPromise;
}

/**
 * Network-First: Try network, fallback to cache
 * Best for: HTML, JS (want fresh content)
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        
        // Cache successful responses
        if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone());
        }
        
        return response;
    } catch (error) {
        // Fallback to cache
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('📦 Serving from cache:', request.url);
            return cachedResponse;
        }
        
        throw error;
    }
}

// ========== HELPERS ==========

/**
 * Check if URL is an asset (image, audio, font)
 */
function isAsset(pathname) {
    const assetExtensions = [
        '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico',
        '.mp3', '.wav', '.ogg', '.m4a',
        '.woff', '.woff2', '.ttf', '.otf',
        '.json', '.css'
    ];
    
    return assetExtensions.some((ext) => pathname.endsWith(ext));
}

// ========== MESSAGE HANDLER ==========
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
    
    if (event.data.action === 'clearCache') {
        caches.delete(CACHE_NAME).then(() => {
            console.log('🧹 Cache cleared');
        });
    }
});
