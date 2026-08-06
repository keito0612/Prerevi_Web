'use client';

console.log('=== usePushNotification.ts module loaded ===');

import { useEffect, useState, useCallback, useRef } from 'react';
import { getFirebaseMessaging, getToken, onMessage } from '@/lib/firebase';
import { AuthService } from '@/service/authServise';
import { UtilApi } from '@/Util/Util_api';

console.log('=== usePushNotification.ts imports completed ===');

const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

export function usePushNotification() {
  console.log('%c=== usePushNotification hook called ===', 'background: red; color: white; font-size: 16px;');

  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const tokenFetchedRef = useRef(false);

  const saveFcmTokenToServer = async (token: string) => {
    const authToken = AuthService.getSesstion();
    console.log('saveFcmTokenToServer called, authToken:', authToken ? 'exists' : 'null');
    if (!authToken) {
      console.warn('No auth token, skipping FCM token save');
      return;
    }

    try {
      console.log('Sending FCM token to server:', token.substring(0, 30) + '...');
      const response = await fetch(`${UtilApi.API_URL}/api/fcm/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify({ fcm_token: token }),
      });
      const data = await response.json();
      console.log('FCM token save response:', response.status, data);
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const getFcmToken = useCallback(async () => {
    console.log('getFcmToken called');

    const messaging = getFirebaseMessaging();
    console.log('messaging:', messaging ? 'exists' : 'null');

    if (!messaging) {
      console.warn('Firebase messaging not available');
      return null;
    }

    try {
      console.log('Registering service worker...');
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service worker registered:', registration);

      await navigator.serviceWorker.ready;
      console.log('Service worker ready, getting FCM token...');
      console.log('VAPID_KEY:', VAPID_KEY ? VAPID_KEY.substring(0, 20) + '...' : 'null');

      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });
      console.log('FCM token received:', token ? token.substring(0, 30) + '...' : 'null');

      if (token) {
        setFcmToken(token);
        await saveFcmTokenToServer(token);
      }

      return token;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }, []);

  const requestPermission = useCallback(async () => {
    console.log('requestPermission called');
    console.log('Notification in window:', 'Notification' in window);

    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return null;
    }

    try {
      const currentPermission = Notification.permission;
      console.log('Current permission:', currentPermission);

      // 既に許可されている場合は、トークンのみ取得
      if (currentPermission === 'granted') {
        console.log('Permission already granted, getting FCM token...');
        return await getFcmToken();
      }

      // 権限をリクエスト
      console.log('Requesting notification permission...');
      const result = await Notification.requestPermission();
      console.log('Permission result:', result);
      setPermission(result);

      if (result === 'granted') {
        return await getFcmToken();
      }

      return null;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return null;
    }
  }, [getFcmToken]);

  // 初期化時に権限状態を確認し、許可済みならFCMトークンを自動取得
  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const currentPermission = Notification.permission;
    console.log('%cInitial permission check: ' + currentPermission, 'background: blue; color: white; font-size: 14px;');
    setPermission(currentPermission);

    // 既に許可されていて、まだトークンを取得していない場合
    if (currentPermission === 'granted' && !tokenFetchedRef.current) {
      tokenFetchedRef.current = true;
      console.log('Permission already granted on mount, getting FCM token...');
      getFcmToken();
    }
  }, [getFcmToken]);

  // フォアグラウンドメッセージの処理
  useEffect(() => {
    const messaging = getFirebaseMessaging();
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Foreground message received:', payload);
      if (Notification.permission === 'granted') {
        new Notification(payload.notification?.title || 'お知らせ', {
          body: payload.notification?.body || '',
          icon: '/icon-192x192.png',
        });
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    permission,
    fcmToken,
    requestPermission,
  };
}
