// Auth + Firestore, loaded lazily (kept out of the main bundle).
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { app } from './firebase.ts';
export const auth = getAuth(app);
export const db = getFirestore(app);
