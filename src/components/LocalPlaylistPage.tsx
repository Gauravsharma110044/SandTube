import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Trash2 } from 'lucide-react';
import PlaylistPage from './PlaylistPage.tsx';
import VideoCard from './VideoCard.tsx';
import { getPlaylist, removeFromPlaylist, videoIdOf, formatDuration } from '../services/localLibrary.ts';

const LocalView: React.FC<{ id: string }> = ({ id }) => {
    const navigate = useNavigate();
    const [playlist, setPlaylist] = useState(getPlaylist(id));

    if (!playlist) {
        return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>This playlist is not on this device. <span style={{ color: '#3ea6ff', cursor: 'pointer' }} onClick={() => navigate('/playlists')}>Go to playlists</span></div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>{playlist.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{playlist.videos.length} video{playlist.videos.length === 1 ? '' : 's'} - saved on this device only</p>
            {playlist.videos.length > 0 && (
                <button onClick={() => navigate(`/watch/${videoIdOf(playlist.videos[0])}`)} style={{ background: 'white', color: 'black', border: 'none', padding: '10px 18px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, marginBottom: '20px' }}>
                    <Play size={16} /> Play first video
                </button>
            )}
            {playlist.videos.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Empty. Open a video and use "Playlist" to add it.</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {playlist.videos.map(v => (
                    <div key={videoIdOf(v)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ flex: 1 }}>
                            <VideoCard id={videoIdOf(v)} thumbnail={v.snippet.thumbnails?.high?.url} title={v.snippet.title} channel={v.snippet.channelTitle}
                                views="" timestamp={new Date(v.snippet.publishedAt).toLocaleDateString()} channelImage=""
                                duration={formatDuration(v.contentDetails?.duration)} horizontal />
                        </div>
                        <button onClick={() => { removeFromPlaylist(id, videoIdOf(v)); setPlaylist(getPlaylist(id)); }} title="Remove from playlist"
                            style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}><Trash2 size={18} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LocalPlaylistPage: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    if (playlistId && playlistId.startsWith('local-')) return <LocalView id={playlistId} />;
    return <PlaylistPage />;
};

export default LocalPlaylistPage;
