import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPlaylistItems } from '../services/youtube.ts';
import { Play, Shuffle, MoreVertical, Share2, Download } from 'lucide-react';

const PlaylistPage: React.FC = () => {
    const { playlistId } = useParams<{ playlistId: string }>();
    const navigate = useNavigate();
    const [videos, setVideos] = useState<any[]>([]);
    const [playlistInfo, setPlaylistInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylistData = async () => {
            if (!playlistId) return;
            setLoading(true);
            try {
                const items = await getPlaylistItems(playlistId);
                setVideos(items);
                if (items.length > 0) {
                    setPlaylistInfo(items[0].snippet);
                }
            } catch (error) {
                console.error("Error fetching playlist:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlaylistData();
    }, [playlistId]);

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Playlist...</div>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', animation: 'fadeIn 0.5s ease', maxWidth: '1400px', margin: '0 auto', padding: '20px' }}>

            {/* Left Sidebar - Playlist Detail */}
            <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                <div style={{
                    background: 'linear-gradient(to bottom, rgba(230, 185, 120, 0.4), var(--surface))',
                    borderRadius: '24px',
                    padding: '24px',
                    color: 'white',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        <img src={playlistInfo?.thumbnails?.high?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '10px', backdropFilter: 'blur(5px)', textAlign: 'center', fontSize: '0.8rem' }}>
                            PLAY ALL
                        </div>
                    </div>

                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px' }}>{playlistInfo?.title || 'Playlist'}</h1>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>{playlistInfo?.channelTitle}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                        {videos.length} videos • Updated recently
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                        <button style={{ flex: 1, background: 'white', color: 'black', border: 'none', padding: '10px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Play size={18} fill="black" /> Play all
                        </button>
                        <button style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Shuffle size={18} /> Shuffle
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Share2 size={20} style={{ cursor: 'pointer' }} />
                        <Download size={20} style={{ cursor: 'pointer' }} />
                        <MoreVertical size={20} style={{ cursor: 'pointer' }} />
                    </div>
                </div>
            </div>

            {/* Right List - Playlist Videos */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {videos.map((video, index) => (
                    <div
                        key={video.id + index}
                        onClick={() => navigate(`/watch/${video.contentDetails?.videoId || video.id}`)}
                        style={{
                            display: 'flex',
                            gap: '15px',
                            padding: '10px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                        className="playlist-item"
                    >
                        <div style={{ color: 'var(--text-muted)', width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {index + 1}
                        </div>
                        <div style={{ width: '160px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={video.snippet.thumbnails.high.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {video.snippet.title}
                            </h3>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {video.snippet.videoOwnerChannelTitle || video.snippet.channelTitle}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .playlist-item:hover {
                    background: var(--surface-hover);
                }
            `}</style>
        </div>
    );
};

export default PlaylistPage;
