import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { getPlaylists, createPlaylist, togglePlaylistVideo, isInPlaylist, videoIdOf } from '../services/localLibrary.ts';

interface PlaylistModalProps {
    video: any;
    onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ video, onClose }) => {
    const [playlists, setPlaylists] = useState(getPlaylists());
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [, force] = useState(0);
    const vid = videoIdOf(video);

    const toggle = (playlistId: string) => {
        togglePlaylistVideo(playlistId, video);
        setPlaylists(getPlaylists());
        force(n => n + 1);
    };

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        const p = createPlaylist(newTitle);
        togglePlaylistVideo(p.id, video);
        setPlaylists(getPlaylists());
        setNewTitle('');
        setShowCreate(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div onClick={(e) => e.stopPropagation()} style={{ width: '320px', maxWidth: '92vw', borderRadius: '12px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 500 }}>Save to playlist</span>
                    <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>
                <div style={{ padding: '8px 20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Playlists are saved on this device only. They do not sync to other devices.
                </div>
                <div style={{ padding: '5px 10px 10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {playlists.length === 0 && (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>No playlists yet.</div>
                    )}
                    {playlists.map(p => {
                        const checked = isInPlaylist(p.id, vid);
                        return (
                            <div key={p.id} onClick={() => toggle(p.id)} className="playlist-opt"
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}>
                                <input type="checkbox" readOnly checked={checked} style={{ width: 18, height: 18, accentColor: 'white' }} />
                                <span style={{ fontSize: '0.9rem', flex: 1 }}>{p.title}</span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.videos.length}</span>
                            </div>
                        );
                    })}
                </div>
                {!showCreate ? (
                    <div onClick={() => setShowCreate(true)} className="playlist-opt"
                        style={{ padding: '15px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <Plus size={20} /> <span style={{ fontSize: '0.9rem' }}>Create new playlist</span>
                    </div>
                ) : (
                    <div style={{ padding: '15px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <input autoFocus type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
                            placeholder="Playlist name"
                            style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid white', color: 'white', outline: 'none', padding: '5px 0' }} />
                        <button onClick={handleCreate} style={{ background: 'none', border: 'none', color: '#3ea6ff', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}>CREATE AND SAVE</button>
                    </div>
                )}
            </div>
            <style>{`.playlist-opt:hover { background: var(--surface-hover); }`}</style>
        </div>
    );
};

export default PlaylistModal;
