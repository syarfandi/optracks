/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

precacheAndRoute(self.__WB_MANIFEST);

// 3 hours in milliseconds
const CHECK_INTERVAL = 3 * 60 * 60 * 1000;

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('periodicsync', (event: any) => {
    if (event.tag === 'check-episodes') {
        event.waitUntil(checkNewEpisodes());
    }
});

// A background fallback using messages to start interval
let intervalId: any = null;

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START_CHECKER') {
        if (!intervalId) {
            intervalId = setInterval(checkNewEpisodes, CHECK_INTERVAL);
        }
        // Also check immediately when requested
        checkNewEpisodes();
    }
});

async function checkNewEpisodes() {
    try {
        const res = await fetch('/data/bilibili_episodes.json?t=' + Date.now());
        if (!res.ok) return;
        
        const data = await res.json();
        const keys = Object.keys(data).map(Number).filter(n => !isNaN(n));
        const maxEp = keys.length > 0 ? Math.max(...keys) : 0;
        
        // Get the last seen episode from IndexedDB / Storage API or just Cache
        const cache = await caches.open(`op-tracker-notif-cache`);
        const lastEpRes = await cache.match('/last-ep');
        let lastEp = 0;
        
        if (lastEpRes) {
            lastEp = parseInt(await lastEpRes.text(), 10) || 0;
        }

        if (maxEp > lastEp) {
            if (Notification.permission === 'granted') {
                await self.registration.showNotification('Episode Baru Telah Rilis! 🏴‍☠️', {
                    body: `One Piece Episode ${maxEp} sekarang tersedia. Siap Berlayar!`,
                    icon: '/mugiwara-logo.png',
                    tag: 'new-episode'
                } as any);
            }
            // Update the cache
            await cache.put('/last-ep', new Response(maxEp.toString()));
            
            // Also notify clients to update if they are open
            const clients = await self.clients.matchAll();
            clients.forEach(client => {
                client.postMessage({ type: 'EPISODES_UPDATED', maxEp });
            });
        } else if (lastEp === 0) {
            // First time running check, just store it
            await cache.put('/last-ep', new Response(maxEp.toString()));
        }
    } catch (e) {
        console.error('Checker error:', e);
    }
}

// Notification click behavior
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window' }).then((clientList) => {
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (self.clients.openWindow) {
                return self.clients.openWindow('/');
            }
        })
    );
});
