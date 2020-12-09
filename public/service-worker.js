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
        saveText(event.data.text);
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

function saveText(text) {
  const isStorageAvailable =
    typeof self.localStorage === 'object' &&
    typeof self.localStorage.setItem === 'function';

  if (!isStorageAvailable) {
    console.warn('localStorage is not available in service worker');
    return false;
  }

  self.localStorage.setItem('sw-text', text);

  return true;
}
