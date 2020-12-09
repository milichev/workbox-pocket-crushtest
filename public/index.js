import { Workbox } from 'https://storage.googleapis.com/workbox-cdn/releases/6.0.2/workbox-window.prod.mjs';

console.log('👋🏼 index.js', { Workbox });

async function init() {
  const notifySw = document.querySelector('#notify-sw');
  const notifyText = document.querySelector('#notify-text');
  const updateButton = document.querySelector('#update-app');

  updateButton.disabled = true;

  if ('serviceWorker' in navigator) {
    const wb = new Workbox('/service-worker.js');

    wb.addEventListener('activated', (event) => {
      // `event.isUpdate` will be true if another version of the service
      // worker was controlling the page when this version was registered.
      if (event.isUpdate) {
        console.log('Service worker is updated!');
      } else {
        console.log('Service worker activated for the first time!');

        // If your service worker is configured to precache assets, those
        // assets should all be available now.
      }

      const urlsToCache = [
        location.href,
        ...performance.getEntriesByType('resource').map((r) => r.name),
      ];

      wb.messageSW({
        type: 'CACHE_URLS',
        payload: { urlsToCache },
      });
    });

    wb.addEventListener('waiting', (event) => {
      console.log(
        "A new service worker has installed, but it can't activate until all tabs running the current version have fully unloaded."
      );

      updateButton.disabled = false;
      updateButton.addEventListener('click', () => {
        // Set up a listener that will reload the page as soon as the previously
        // waiting service worker has taken control.
        wb.addEventListener('controlling', (event) => {
          window.location.reload();
        });

        // Send a message telling the service worker to skip waiting.
        // This will trigger the `controlling` event handler above.
        wb.messageSW({ type: 'SKIP_WAITING' });
      });
    });

    const reg = await wb.register();

    notifySw.addEventListener('click', () => {
      wb.messageSW({
        type: 'SAVE_TEXT',
        text: notifyText.value,
      });
    });

    setTimeout(async () => {
      const sw = await wb.getSW();

      console.log('reg', { reg, sw, wb });
    }, 200);
  } else {
    notifySw.style.display = 'none';
    notifyText.style.display = 'none';
  }
}

window.addEventListener('load', init);
