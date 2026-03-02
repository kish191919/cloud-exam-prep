const CACHE_NAME = 'cloudmaster-v2';

// Install: cache essential assets (HTML 문서 제외 — 항상 최신 HTML 보장)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(['/manifest.json', '/favicon.svg'])
    )
  );
  self.skipWaiting();
});

// Activate: remove old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: HTML 문서는 항상 네트워크, 나머지는 network-first + cache fallback
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // HTML 문서(네비게이션 요청)는 캐시 없이 항상 네트워크에서 직접 가져오기
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request));
    return;
  }

  // JS/CSS/폰트/이미지 등: network-first, 실패 시 캐시 fallback
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
