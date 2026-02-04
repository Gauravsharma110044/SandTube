import React, { useState, useEffect } from 'react';
import VideoCard from './VideoCard.tsx';
import { Clock, Play } from 'lucide-react';
import BackendAPI from '../services/backend.ts';

const WatchLaterPage: React.FC = () => {
    const [watchLater, setWatchLater] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchWatchLater = async () => {
            if (user?.sub) {
                try {
                    const data = await BackendAPI.getWatchLaterByUser(user.sub);
                    setWatchLater(data);
                } catch (error) {
                    console.error("Error fetching watch later:", error);
                }
            } else {
                const localData = JSON.parse(localStorage.getItem('sandtube_watch_later') || '[]');
                setWatchLater(localData);
            }
            setLoading(false);
        };
        fetchWatchLater();
    }, [user?.sub]);

    const removeFromWatchLater = async (id: string) => {
        if (user?.sub) {
            try {
                await BackendAPI.removeFromWatchLater(user.sub, id);
                setWatchLater(prev => prev.filter(v => (v.id.videoId || v.id) !== id));
            } catch (error) {
                console.error("Error removing from watch later:", error);
            }
        } else {
            const updated = watchLater.filter(v => (v.id.videoId || v.id) !== id);
            setWatchLater(updated);
            localStorage.setItem('sandtube_watch_later', JSON.stringify(updated));
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

    if (watchLater.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', height: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={80} color="var(--text-muted)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                <h1 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Your Watch Later is empty</h1>
                <p style={{ color: 'var(--text-muted)' }}>Videos you save for later will appear here.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <div style={{ display: 'flex', gap: '40px', marginBottom: '40px', flexWrap: 'wrap' }}>
                {/* Playlist Sidebar Info */}
                <div className="glass-morphism" style={{
                    width: '350px',
                    padding: '30px',
                    borderRadius: '24px',
                    height: 'fit-content',
                    background: 'linear-gradient(to bottom, var(--primary-transparent), var(--surface))'
                }}>
                    <div style={{ aspectRatio: '16/9', background: '#222', borderRadius: '12px', marginBottom: '20px', overflow: 'hidden', position: 'relative' }}>
                        <img
                            src={watchLater[0]?.snippet.thumbnails.maxres?.url || watchLater[0]?.snippet.thumbnails.high?.url}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            alt=""
                        />
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Play size={40} fill="white" />
                        </div>
                    </div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Watch Later</h1>
                    <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>{watchLater.length} videos • Private</p>
                    <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                        <button className="button-primary" style={{ flex: 1, padding: '12px' }}>Play all</button>
                    </div>
                </div>

                {/* Video List */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {watchLater.map((video, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                            <VideoCard
                                id={video.id.videoId || video.id}
                                thumbnail={video.snippet.thumbnails.high.url}
                                title={video.snippet.title}
                                channel={video.snippet.channelTitle}
                                views=""
                                timestamp={new Date(video.snippet.publishedAt).toLocaleDateString()}
                                channelImage={video.snippet.thumbnails.default.url}
                                horizontal={true}
                            />
                            <button
                                onClick={() => removeFromWatchLater(video.id.videoId || video.id)}
                                style={{
                                    position: 'absolute',
                                    right: '10px',
                                    top: '10px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none',
                                    color: 'white',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    cursor: 'pointer',
                                    fontSize: '0.7rem'
                                }}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default WatchLaterPage;
