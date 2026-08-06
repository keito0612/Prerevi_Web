// Auto-generated Firebase Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
    "apiKey": (process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "").replace(/,$/, "").trim(),
    "authDomain": (process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "").trim(),
    "projectId": (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "").trim(),
    "storageBucket": (process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "").trim(),
    "messagingSenderId": (process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "").trim(),
    "appId": (process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "").trim(),
    "measurementId": (process.env.NEXT_PUBLIC_MEASUREMENT_ID || "").trim()
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'お知らせ';
    const notificationOptions = {
        body: payload.notification?.body || '',
        icon: '/icon-192x192.png',
        data: payload.data,
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const url = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
