// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const cacheFiles = [
   'index.html',
   'js/main.js',
   'js/VLSM.js',
   'js/findPossibleNetworks.js',
   'css/bootstrap.min.css',
   'js/jquery-3.5.1.slim.min.js',
   'js/popper.min.js',
   'js/bootstrap.min.js',
   '/'

];

self.addEventListener('install', e => {
  console.log('Installazione WorkService in corso');
    let timeStamp = Date.now();
    e.waitUntil(
    caches.open('asset').then(cache => {
       return cache.addAll(cacheFiles)
 .then(() => self.skipWaiting());
    })
   )
});
self.addEventListener('activate', event => {
    console.log('Attivazione Service Worker della PWA in corso');
    event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (e) => {
   e.respondWith(
     (async () => {
       const r = await caches.match(e.request);
       console.log(`[Service Worker] Fetching resource: ${e.request.url}`);
       if (r) {
         console.log(`[Service Worker] Trovato in cache: ${e.request.url}`);
         return r;
       }
 
       // Aggiungi questa condizione per gestire il manifest.json quando sei offline
       if (e.request.url.includes("manifest.json")) {
         const indexResponse = await caches.match("index.html");
         if (indexResponse) {
           console.log(`[Service Worker] Ritornato index.html per manifest.json`);
           return indexResponse;
         }
       }
 
       try {
         const response = await fetch(e.request);
         const cache = await caches.open('asset');
         console.log(`[Service Worker] Caching new resource: ${e.request.url}`);
         cache.put(e.request, response.clone());
         return response;
       } catch (error) {
         console.error(`[Service Worker] Errore nel fetch: ${error}`);
         return caches.match('offline.html');
       }
     })(),
   );
 });
 