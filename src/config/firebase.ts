// Firebase (Spark plan, no billing): Auth (Google) + Firestore only.
// These web config values are public identifiers by design. Access is controlled by firestore.rules.
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from 'firebase/storage';

const env = (import.meta as any).env;
const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'sandtube.firebaseapp.com',
    projectId: env.VITE_FIREBASE_PROJECT_ID || 'sandtube',
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
// Legacy: services/backend.ts still targets Realtime Database, which is not provisioned. Not used by the new cloud layer.
export const database = getDatabase(app);
// Legacy: Cloud Storage needs the paid Blaze plan, so uploads (Creator Studio) cannot work on the free plan.
export const storage = getStorage(app);
