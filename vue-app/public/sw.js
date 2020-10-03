importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.20.0/firebase-messaging.js');

const version = {
  major: 1.0,
  feat: 1.6,
  fix: 0,
  build: 0,
};

self.addEventListener('fetch', (e) => {
  e.respondWith((async () => {
    const normalizedUrl = new URL(e.request.url);

    if (
      (
        !normalizedUrl.hostname.includes('usp-3.fr')
        && !normalizedUrl.hostname.includes('fonts')
      )
      || normalizedUrl.pathname.includes('/socket.io')
      || normalizedUrl.protocol === 'chrome-extension:'
    ) return fetch(e.request);

    const fetchResponseP = fetch(normalizedUrl);
    const fetchResponseCloneP = fetchResponseP.then((r) => r.clone());

    e.waitUntil((async () => {
      const cache = await caches.open('app');
      await cache.put(normalizedUrl, await fetchResponseCloneP);
    })());

    return (await caches.match(normalizedUrl)) || fetchResponseP;
  })());
});

firebase.initializeApp({
  apiKey: 'AIzaSyBR7DCsR_W3C3OHY8QRpTkQXk8Pcd7Do_E',
  authDomain: 'iridium-blast.firebaseapp.com',
  databaseURL: 'https://iridium-blast.firebaseio.com',
  projectId: 'iridium-blast',
  storageBucket: 'iridium-blast.appspot.com',
  messagingSenderId: '273479070895',
  appId: '1:273479070895:web:e5b1b8e71061dd96f6d05a',
  measurementId: 'G-STPWJL47YY',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log(payload);
});

messaging.setBackgroundMessageHandler((payload) => {
  console.log(payload.data);
  return self.registration.showNotification(payload.data.title, {
    body: payload.data.body,
    badge: 'https://pronotif.usp-3.fr/img/badge.png',
    icon: 'https://pronotif.usp-3.fr/img/logo-256.png',
    renotify: false,
    tag: payload.data.tag || 'BASE',
    vibrate: [100, 50, 100],
  });
});

self.addEventListener('message', async (e) => {
  if (!e.data || !e.data.type) return;
  if (e.data.type === 'update') {
    await caches.delete('app');
    return self.skipWaiting();
  }
  if (e.data.type === 'setHours') return daysHours = e.data.hours;
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  console.log(clients);
  e.waitUntil(clients.matchAll().then((cList) => {
    for (let i = 0; i < cList.length; i++) {
      if ('focus' in cList[i]) return cList[i].focus();
    }
    if (clients.openWindow) return clients.openWindow('./');
  }));
});

let daysHours = {};

const addZeros = (nbr) => (parseInt(nbr) < 10 ? `0${nbr}` : `${nbr}`);
const getHour = (d = new Date()) => `${addZeros(d.getHours())}:${addZeros(d.getMinutes())}`;
const getMins = (date = new Date()) => (date.getHours() * 60) + date.getMinutes();

setInterval(() => {
  const day = new Date().getDay();
  const now = getMins(new Date());

  if (!daysHours[day]) return;

  let diff = false;
  let nearest = false;
  let diffBef = false;

  Object.keys(daysHours[day]).forEach((h) => {
    const hr = parseInt(h);
    const newDiff = getMins(new Date(hr)) - now;
    const newDiffBef = getMins(new Date(daysHours[day][h].to)) - now;

    if (!diff || !nearest
      || (
        Math.abs(newDiff) < Math.abs(diff)
        && now < getMins(new Date(daysHours[day][h].to))
      )
    ) {
      diff = newDiff;
      nearest = hr;
    }

    if (!diffBef || (
      Math.abs(newDiffBef) < Math.abs(diffBef)
      && now > getMins(new Date(daysHours[day][h].to))
    )) diffBef = newDiffBef;
  });

  const next = daysHours[day][nearest];

  if (!next || (
    Math.abs(diff) > 60
    && Math.abs(diffBef) > 200
  )) return;

  const title = ((getMins(new Date(nearest)) < now)
    ? (now < getMins(new Date(next.to)))
      ? `Cours actuel (Plus que ${getMins(new Date(next.to)) - now} minutes)`
      : false
    : `Prochain cours dans ${getMins(new Date(nearest)) - now} minutes`
  );

  if (title) return self.registration.showNotification(
    `[${getHour(new Date(nearest))}] ${title}`,
    {
      body: `(${next.room}) ${next.subject} avec ${next.teacher}`,
      badge: 'https://pronotif.usp-3.fr/img/badge.png',
      icon: 'https://pronotif.usp-3.fr/img/logo-256.png',
      renotify: false,
      tag: 'LESSON',
      timestamp: Date.now(),
    }
  );
  else self.registration.getNotifications().then((notifs) => {
    notifs.forEach((notif) => {
      if (notif.tag === 'LESSON') notif.close();
    });
  });
}, 60000);
