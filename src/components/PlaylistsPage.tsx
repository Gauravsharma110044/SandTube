import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ListVideo, Plus, Trash2 } from 'lucide-react';
import { getPlaylists, createPlaylist, deletePlaylist } from '../services/localLibrary.ts';

const PlaylistsPage: React.FC = () => {
    const navigate = useNavigate();
    const [playlists, setPlaylists] = useState(getPlaylists());
    const [title, setTitle] = useState('');

    const add = () => {
        if (!title.trim()) return;
        createPlaylist(title);
        setTitle('');
        setPlaylists(getPlaylists());
    };

    return (
        <div style={{ maxWidth: '900px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Playlists</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '20px' }}>Saved on this device only. No sign-in, no sync.</p>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px' }}>
                <input value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="New playlist name"
                    style={{ flex: 1, background: 'var(--surface)', border: 'none', color: 'white', padding: '12px', borderRadius: '10px', outline: 'none' }} />
                <button onClick={add} style={{ background: 'white', color: 'black', border: 'none', padding: '0 18px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                    <Plus size={16} /> Create
                </button>
            </div>
            {playlists.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
                    <ListVideo size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <p>No playlists yet. Create one here or use "Playlist" on a video.</p>
                </div>
            ) : playlists.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface)', borderRadius: '12px', padding: '14px 16px', marginBottom: '10px' }}>
                    <div onClick={() => navigate(`/playlist/${p.id}`)} style={{ flex: 1, cursor: 'pointer' }}>
                        <div style={{ fontWeight: 600 }}>{p.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.videos.length} video{p.videos.length === 1 ? '' : 's'}</div>
                    </div>
                    <button onClick={() => { if (window.confirm(`Delete playlist "${p.title}"?`)) { deletePlaylist(p.id); setPlaylists(getPlaylists()); } }}
                        title="Delete playlist" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </div>
            ))}
        </div>
    );
};

export default PlaylistsPage;
