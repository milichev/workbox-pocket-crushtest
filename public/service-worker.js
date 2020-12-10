importScripts(
  'https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-sw.js',
  'https://unpkg.com/idb@5.0.8/build/iife/index-min.js'
);

const dbName = 'luft-store';
const storeName = 'service-worker';
const db = idb.openDB(dbName, 1, {
  upgrade(upDb) {
      if (!upDb.objectStoreNames.contains(storeName)) {
          upDb.createObjectStore(storeName);
      }
  },
});

const events = {
  async install(event) {},

  async activate(event) {},

  async message(event) {
    const type = event.data && event.data.type;
    switch (type) {
      case 'SKIP_WAITING':
        skipWaiting();
        break;
      case 'SAVE_TEXT':
        return (await db).put(storeName, event.data.text, 'message-text');
      case 'READ_TEXT':
        const result = await (await db).get(storeName, 'message-text');
        event.ports[0].postMessage(result);
        break;
    }
  },
};

for (const [name, handler] of Object.entries(events)) {
  const wrapped = (event) => {
    console.log(name, { event });
    return handler(event);
  };
  self.addEventListener(name, (event) => event.waitUntil(wrapped(event)));
}

console.log('🛠 service worker is here');
