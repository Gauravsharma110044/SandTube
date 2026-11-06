// Device-local library: watch history, watch later and playlists.
// Everything is stored in this browser's localStorage. There is no sign-in and no sync.

const PLAYLISTS_KEY = 'sandtube_playlists_v2';
const WATCH_LATER_KEY = 'sandtube_watch_later';

export interface LocalPlaylist {
    id: string;
    title: string;
    createdAt: string;
    videos: any[];
}

export const videoIdOf = (v: any): string => (v?.id?.videoId || (typeof v?.id === 'string' ? v.id : '') || '');

const read = <T,>(key: string, fallback: T): T => {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
};
const write = (key: string, value: any) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
};

// Keep only what lists need, so storage stays small.
export const slimVideo = (v: any) => ({
    id: videoIdOf(v),
    snippet: {
        title: v?.snippet?.title || '',
        channelTitle: v?.snippet?.channelTitle || '',
        channelId: v?.snippet?.channelId || '',
        publishedAt: v?.snippet?.publishedAt || new Date().toISOString(),
        description: (v?.snippet?.description || '').slice(0, 200),
        thumbnails: {
            high: { url: v?.snippet?.thumbnails?.high?.url || v?.snippet?.thumbnails?.medium?.url || v?.snippet?.thumbnails?.default?.url || `https://i.ytimg.com/vi/${videoIdOf(v)}/hqdefault.jpg` },
            default: { url: v?.snippet?.thumbnails?.default?.url || v?.snippet?.thumbnails?.high?.url || '' }
        }
    },
    statistics: v?.statistics ? { viewCount: v.statistics.viewCount } : undefined,
    contentDetails: v?.contentDetails ? { duration: v.contentDetails.duration } : undefined
});

// Watch later
export const getWatchLater = (): any[] => read<any[]>(WATCH_LATER_KEY, []);
export const isInWatchLater = (id: string) => getWatchLater().some(v => videoIdOf(v) === id);
export const toggleWatchLater = (video: any): boolean => {
    const id = videoIdOf(video);
    const list = getWatchLater();
    if (list.some(v => videoIdOf(v) === id)) {
        write(WATCH_LATER_KEY, list.filter(v => videoIdOf(v) !== id));
        return false;
    }
    write(WATCH_LATER_KEY, [slimVideo(video), ...list].slice(0, 200));
    return true;
};
export const removeFromWatchLater = (id: string) => write(WATCH_LATER_KEY, getWatchLater().filter(v => videoIdOf(v) !== id));

// Playlists
export const getPlaylists = (): LocalPlaylist[] => read<LocalPlaylist[]>(PLAYLISTS_KEY, []);
export const getPlaylist = (id: string) => getPlaylists().find(p => p.id === id) || null;
export const createPlaylist = (title: string): LocalPlaylist => {
    const p: LocalPlaylist = { id: 'local-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: title.trim(), createdAt: new Date().toISOString(), videos: [] };
    write(PLAYLISTS_KEY, [...getPlaylists(), p]);
    return p;
};
export const deletePlaylist = (id: string) => write(PLAYLISTS_KEY, getPlaylists().filter(p => p.id !== id));
export const renamePlaylist = (id: string, title: string) =>
    write(PLAYLISTS_KEY, getPlaylists().map(p => p.id === id ? { ...p, title: title.trim() || p.title } : p));
export const isInPlaylist = (playlistId: string, videoId: string) =>
    !!getPlaylist(playlistId)?.videos.some(v => videoIdOf(v) === videoId);
export const togglePlaylistVideo = (playlistId: string, video: any): boolean => {
    const vid = videoIdOf(video);
    let added = false;
    write(PLAYLISTS_KEY, getPlaylists().map(p => {
        if (p.id !== playlistId) return p;
        if (p.videos.some(v => videoIdOf(v) === vid)) return { ...p, videos: p.videos.filter(v => videoIdOf(v) !== vid) };
        added = true;
        return { ...p, videos: [...p.videos, slimVideo(video)] };
    }));
    return added;
};
export const removeFromPlaylist = (playlistId: string, videoId: string) =>
    write(PLAYLISTS_KEY, getPlaylists().map(p => p.id === playlistId ? { ...p, videos: p.videos.filter(v => videoIdOf(v) !== videoId) } : p));

// Duration helper: ISO 8601 (PT1H2M3S) to 1:02:03. Returns '' when unknown (no fake values).
export const formatDuration = (iso?: string): string => {
    if (!iso) return '';
    const m = /^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(iso);
    if (!m) return '';
    const h = parseInt(m[1] || '0'), min = parseInt(m[2] || '0'), s = parseInt(m[3] || '0');
    if (h === 0 && min === 0 && s === 0) return '';
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${String(min).padStart(2, '0')}:${ss}` : `${min}:${ss}`;
};
