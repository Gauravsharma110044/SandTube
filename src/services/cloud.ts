// SandTube cloud account (Firebase Auth + Firestore, free Spark plan).
// - Sign-in reuses the Google token from the existing YouTube sign-in. No extra scope is requested.
// - Nothing is uploaded unless the user taps a sync button. Local data is never migrated silently.
// - This never writes to YouTube.
import { GoogleAuthProvider, signInWithCredential, signOut } from 'firebase/auth';
import {
    addDoc, collection, deleteDoc, doc, getDocs, limit, onSnapshot, orderBy, query,
    serverTimestamp, setDoc, where, writeBatch
} from 'firebase/firestore';
import { auth, db } from '../config/firebaseCloud.ts';
import { videoIdOf, slimVideo, getWatchLater, getPlaylists } from './localLibrary.ts';

const HISTORY_KEY = 'sandtube_history';
const WATCH_LATER_KEY = 'sandtube_watch_later';
const PLAYLISTS_KEY = 'sandtube_playlists_v2';

const clean = (x: any) => JSON.parse(JSON.stringify(x)); // Firestore rejects undefined fields
const readJson = (k: string): any[] => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };

export const cloudUser = () => auth.currentUser;

// Link the current YouTube sign-in to a SandTube cloud account.
export const connectCloud = async () => {
    if (auth.currentUser) return auth.currentUser;
    const u = JSON.parse(localStorage.getItem('user') || 'null');
    if (!u?.accessToken) throw new Error('Sign in with Google first.');
    const cred = GoogleAuthProvider.credential(null, u.accessToken);
    const res = await signInWithCredential(auth, cred);
    await setDoc(doc(db, 'users', res.user.uid), {
        displayName: (res.user.displayName || u.name || '').slice(0, 100),
        updatedAt: new Date().toISOString(),
    });
    return res.user;
};
export const disconnectCloud = () => signOut(auth);

export interface SyncReport { uploaded: { watchLater: number; history: number; playlists: number } }

// Upload this device's lists to the signed-in account (merge by id). Explicit user action only.
export const backUpToCloud = async (): Promise<SyncReport> => {
    const user = await connectCloud();
    const uid = user.uid;
    const now = new Date().toISOString();
    const wl = getWatchLater().slice(0, 200);
    const hist = readJson(HISTORY_KEY).slice(0, 200);
    const pls = getPlaylists().slice(0, 50);
    const batch = writeBatch(db);
    wl.forEach(v => { const id = videoIdOf(v); if (id) batch.set(doc(db, 'users', uid, 'watchLater', id), { video: clean(slimVideo(v)), addedAt: now }); });
    hist.forEach(v => { const id = videoIdOf(v); if (id) batch.set(doc(db, 'users', uid, 'history', id), { video: clean(slimVideo(v)), watchedAt: now }); });
    pls.forEach(p => batch.set(doc(db, 'users', uid, 'playlists', p.id), {
        title: (p.title || 'Untitled').slice(0, 100), createdAt: p.createdAt || now, videos: (p.videos || []).slice(0, 200).map(v => clean(slimVideo(v))),
    }));
    await batch.commit();
    return { uploaded: { watchLater: wl.length, history: hist.length, playlists: pls.length } };
};

// Pull the account's lists into this device (merge, never deletes local items). Explicit user action only.
export const restoreFromCloud = async () => {
    const user = await connectCloud();
    const uid = user.uid;
    const [wl, hs, pl] = await Promise.all([
        getDocs(collection(db, 'users', uid, 'watchLater')),
        getDocs(collection(db, 'users', uid, 'history')),
        getDocs(collection(db, 'users', uid, 'playlists')),
    ]);
    const mergeById = (key: string, incoming: any[]) => {
        const cur = readJson(key);
        const have = new Set(cur.map(videoIdOf));
        const add = incoming.filter(v => !have.has(videoIdOf(v)));
        localStorage.setItem(key, JSON.stringify([...cur, ...add]));
        return add.length;
    };
    const a = mergeById(WATCH_LATER_KEY, wl.docs.map(d => d.data().video));
    const b = mergeById(HISTORY_KEY, hs.docs.map(d => d.data().video));
    const curPl = getPlaylists();
    const haveP = new Set(curPl.map(p => p.id));
    const newPl = pl.docs.filter(d => !haveP.has(d.id)).map(d => ({ id: d.id, ...(d.data() as any) }));
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify([...curPl, ...newPl]));
    return { watchLater: a, history: b, playlists: newPl.length };
};

// Public SandTube comments (separate from private lists).
export interface CloudComment { id: string; authorUid: string; authorName: string; text: string; createdAt: Date | null; }

export const subscribeComments = (videoId: string, cb: (c: CloudComment[]) => void, onError: (e: any) => void) => {
    const q = query(collection(db, 'comments'), where('videoId', '==', videoId), limit(100));
    return onSnapshot(q, snap => {
        const rows = snap.docs.map(d => {
            const x: any = d.data();
            return { id: d.id, authorUid: x.authorUid, authorName: x.authorName, text: x.text, createdAt: x.createdAt?.toDate ? x.createdAt.toDate() : null } as CloudComment;
        }).sort((a, b) => (b.createdAt?.getTime() || Date.now()) - (a.createdAt?.getTime() || Date.now()));
        cb(rows);
    }, onError);
};

export const postCloudComment = async (videoId: string, text: string) => {
    const user = await connectCloud();
    const t = text.trim().slice(0, 500);
    if (!t) throw new Error('Empty comment');
    await addDoc(collection(db, 'comments'), {
        videoId, authorUid: user.uid, authorName: (user.displayName || 'SandTube user').slice(0, 100), text: t, createdAt: serverTimestamp(),
    });
};
export const deleteCloudComment = (id: string) => deleteDoc(doc(db, 'comments', id));
// keep imports used
void orderBy;
