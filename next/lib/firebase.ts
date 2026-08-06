console.log('=== firebase.ts module loading ===');

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

console.log('=== firebase.ts imports completed ===');

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | null = null;
let messagingInstance: Messaging | null = null;

// クライアントサイドでのみFirebaseを初期化
function getFirebaseApp(): FirebaseApp | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  return app;
}

// クライアントサイドでのみMessagingを初期化
function getFirebaseMessaging(): Messaging | null {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported');
    return null;
  }

  if (!messagingInstance) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) {
      try {
        messagingInstance = getMessaging(firebaseApp);
        console.log('Firebase messaging initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Firebase messaging:', error);
        return null;
      }
    }
  }
  return messagingInstance;
}

// 遅延初期化のためのgetter
const messaging = typeof window !== 'undefined' ? {
  get instance() {
    return getFirebaseMessaging();
  }
} : null;

export { getFirebaseApp as app, messaging, getToken, onMessage, getFirebaseMessaging };
