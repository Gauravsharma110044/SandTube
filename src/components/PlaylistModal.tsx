import React, { useState, useEffect } from 'react';
import { X, Plus, Lock, Globe } from 'lucide-react';
import { getMyPlaylists } from '../services/youtube.ts';

interface PlaylistModalProps {
    videoId: string;
    onClose: () => void;
}

const PlaylistModal: React.FC<PlaylistModalProps> = ({ videoId, onClose }) => {
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [savedPlaylists, setSavedPlaylists] = useState<string[]>([]); // Array of playlist IDs
    const [showCreate, setShowCreate] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [privacy, setPrivacy] = useState('private');

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (user?.accessToken) {
                try {
                    const data = await getMyPlaylists(user.accessToken);
                    setPlaylists(data);

                    // Mock: Check which ones have this video
                    const saved = JSON.parse(localStorage.getItem(`sandtube_video_saved_${videoId}`) || '[]');
                    setSavedPlaylists(saved);
                } catch (error) {
                    console.error("Error fetching playlists:", error);
                }
            } else {
                // Mock local playlists
                const local = JSON.parse(localStorage.getItem('sandtube_local_playlists') || '[]');
                setPlaylists(local);
                const saved = JSON.parse(localStorage.getItem(`sandtube_video_saved_${videoId}`) || '[]');
                setSavedPlaylists(saved);
            }
            setLoading(false);
        };
        fetchPlaylists();
    }, [user?.accessToken, videoId]);

    const togglePlaylist = (id: string) => {
        let newSaved;
        if (savedPlaylists.includes(id)) {
            newSaved = savedPlaylists.filter(p => p !== id);
        } else {
            newSaved = [...savedPlaylists, id];
        }
        setSavedPlaylists(newSaved);
        localStorage.setItem(`sandtube_video_saved_${videoId}`, JSON.stringify(newSaved));
    };

    const handleCreate = () => {
        if (!newTitle.trim()) return;
        const newP = {
            id: 'local-' + Date.now(),
            snippet: { title: newTitle },
            status: { privacyStatus: privacy }
        };

        const local = JSON.parse(localStorage.getItem('sandtube_local_playlists') || '[]');
        const updated = [...local, newP];
        localStorage.setItem('sandtube_local_playlists', JSON.stringify(updated));

        setPlaylists([...playlists, newP]);
        setNewTitle('');
        setShowCreate(false);
    };

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="glass-morphism" style={{ width: '300px', borderRadius: '12px', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: '500' }}>Save to...</span>
                    <X size={20} style={{ cursor: 'pointer' }} onClick={onClose} />
                </div>

                <div style={{ padding: '15px 10px', maxHeight: '300px', overflowY: 'auto' }}>
                    {loading ? (
                        <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading playlists...</div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                            {playlists.map(p => (
                                <div
                                    key={p.id}
                                    onClick={() => togglePlaylist(p.id)}
                                    style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '10px 10px', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s' }}
                                    className="playlist-opt"
                                >
                                    <div style={{ width: '18px', height: '18px', border: '2px solid white', borderRadius: '2px', position: 'relative', background: savedPlaylists.includes(p.id) ? 'white' : 'transparent' }}>
                                        {savedPlaylists.includes(p.id) && <div style={{ position: 'absolute', top: '1px', left: '4px', width: '5px', height: '10px', borderRight: '2px solid black', borderBottom: '2px solid black', transform: 'rotate(45deg)' }} />}
                                    </div>
                                    <span style={{ fontSize: '0.9rem', flex: 1 }}>{p.snippet.title}</span>
                                    {p.status?.privacyStatus === 'private' ? <Lock size={14} color="var(--text-muted)" /> : <Globe size={14} color="var(--text-muted)" />}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {!showCreate ? (
                    <div
                        onClick={() => setShowCreate(true)}
                        style={{ padding: '15px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                        className="playlist-opt"
                    >
                        <Plus size={20} />
                        <span style={{ fontSize: '0.9rem' }}>Create new playlist</span>
                    </div>
                ) : (
                    <div style={{ padding: '15px 20px', borderTop: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Name</label>
                            <input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                placeholder="Enter playlist name..."
                                style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid white', color: 'white', outline: 'none', padding: '5px 0' }}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', marginBottom: '5px' }}>Privacy</label>
                            <select
                                value={privacy}
                                onChange={(e) => setPrivacy(e.target.value)}
                                style={{ width: '100%', background: 'var(--surface)', border: 'none', color: 'white', padding: '8px', borderRadius: '4px' }}
                            >
                                <option value="private">Private</option>
                                <option value="public">Public</option>
                            </select>
                        </div>
                        <button
                            onClick={handleCreate}
                            style={{ background: 'none', border: 'none', color: '#3ea6ff', fontWeight: 'bold', cursor: 'pointer', alignSelf: 'flex-end' }}
                        >
                            CREATE
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                .playlist-opt:hover {
                    background: var(--surface-hover);
                }
            `}</style>
        </div>
    );
};

export default PlaylistModal;
