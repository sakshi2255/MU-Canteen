import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
// @ts-ignore
import { initializeAuth, getReactNativePersistence, getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

// Environment variables or fallback sample credentials
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDemoSampleKey1234567890MUProject',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || 'mu-canteen-demo.firebaseapp.com',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || 'mu-canteen-demo',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || 'mu-canteen-demo.firebasestorage.app',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || '1:123456789012:android:demoMuCanteenAppId',
};

export function isFirebaseConfigured(): boolean {
  const key = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
  const project = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;
  return Boolean(
    key &&
    project &&
    !key.includes('DemoSampleKey') &&
    !project.includes('demo')
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

try {
  if (isFirebaseConfigured()) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    try {
      auth = initializeAuth(app, {
        persistence: getReactNativePersistence(ReactNativeAsyncStorage),
      });
    } catch {
      // If already initialized
      auth = getAuth(app);
    }
    db = getFirestore(app);
  }
} catch (e) {
  console.warn('[Firebase] Initialization skipped. Using local Demo Provider adapter.', e);
}

export { app, auth, db, firebaseConfig };
