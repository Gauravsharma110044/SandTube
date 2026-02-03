import React, { useEffect, useState } from 'react';
import { History, PlaySquare, Clock, ThumbsUp, ListVideo } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import { getMyLikedVideos } from '../services/youtube.ts';

const Library: React.FC = () => {
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchLibrary = async () => {
            if (user?.accessToken) {
                try {
                    const liked = await getMyLikedVideos(user.accessToken);
                    setLikedVideos(liked);
                } catch (error) {
                    console.error("Error fetching library data:", error);
                }
            }
        };
        fetchLibrary();
    }, [user?.accessToken]);

    const listItems = [
        { icon: <History />, label: 'History', count: 'Recent' },
        { icon: <PlaySquare />, label: 'Your videos', count: '12 videos' },
        { icon: <Clock />, label: 'Watch later', count: '45 videos' },
        { icon: <ThumbsUp />, label: 'Liked videos', count: likedVideos.length > 0 ? `${likedVideos.length} videos` : 'Syncing...' }
    ];

    const formatViews = (views: string) => {
        if (!views) return 'N/A';
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return views;
    };

    const getTimeAgo = (publishedAt: string) => {
        const date = new Date(publishedAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days >= 365) return Math.floor(days / 365) + ' years ago';
        if (days >= 30) return Math.floor(days / 30) + ' months ago';
        if (days >= 7) return Math.floor(days / 7) + ' weeks ago';
        if (days > 0) return days + ' days ago';
        return 'Today';
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                {listItems.map((item, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.label}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.count}</div>
                        </div>
                    </div>
                ))}
            </div>

            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ThumbsUp size={24} /> Liked Videos (Real Data)</h2>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>See all</span>
                </div>
                {user ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {likedVideos.length > 0 ? (
                            likedVideos.map((video) => (
                                <VideoCard
                                    key={video.id}
                                    id={video.id}
                                    thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                    title={video.snippet.title}
                                    channel={video.snippet.channelTitle}
                                    views={formatViews(video.statistics?.viewCount)}
                                    timestamp={getTimeAgo(video.snippet.publishedAt)}
                                    channelImage={video.snippet.thumbnails.default.url}
                                />
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>Loading your likes...</p>
                        )}
                    </div>
                ) : (
                    <div className="glass-morphism" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)' }}>Sign in to see your liked videos.</p>
                    </div>
                )}
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ListVideo size={24} /> Playlists</h2>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>See all</span>
                </div>
                <div className="glass-morphism" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>Playlists sync coming soon.</p>
                </div>
            </section>
        </div>
    );
};

export default Library;
