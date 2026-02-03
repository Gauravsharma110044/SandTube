import React, { useEffect, useState } from 'react';
import { History, PlaySquare, Clock, ThumbsUp, ListVideo } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import { getMyLikedVideos, getMyPlaylists } from '../services/youtube.ts';

const Library: React.FC = () => {
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [localHistory, setLocalHistory] = useState<any[]>([]);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchLibrary = async () => {


            // Fetch local history
            const history = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
            setLocalHistory(history);

            if (user?.accessToken) {
                try {
                    const [liked, myPlaylists] = await Promise.all([
                        getMyLikedVideos(user.accessToken),
                        getMyPlaylists(user.accessToken)
                    ]);
                    setLikedVideos(liked);
                    setPlaylists(myPlaylists);
                } catch (error) {
                    console.error("Error fetching library data:", error);
                }
            }

        };
        fetchLibrary();
    }, [user?.accessToken]);

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
        if (days > 0) return `${days} days ago`;
        return 'Today';
    };

    const listItems = [
        { icon: <History />, label: 'History', count: localHistory.length > 0 ? `${localHistory.length} videos` : 'Empty' },
        { icon: <PlaySquare />, label: 'Your videos', count: 'Syncing...' },
        { icon: <Clock />, label: 'Watch later', count: 'Private' },
        { icon: <ThumbsUp />, label: 'Liked videos', count: likedVideos.length > 0 ? `${likedVideos.length} videos` : '0 videos' }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Stats Grid */}
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

            {/* History Section */}
            <section style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><History size={24} /> Recent History</h2>
                    <span onClick={() => {
                        localStorage.removeItem('sandtube_history');
                        setLocalHistory([]);
                    }} style={{ color: 'var(--text-muted)', fontSize: '0.9rem', cursor: 'pointer' }}>Clear all</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {localHistory.length > 0 ? (
                        localHistory.slice(0, 4).map((video) => (
                            <VideoCard
                                key={video.id + (video.watchedAt || '')}
                                id={video.id}
                                thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                title={video.snippet.title}
                                channel={video.snippet.channelTitle}
                                views={formatViews(video.statistics?.viewCount)}
                                timestamp={getTimeAgo(video.watchedAt || video.snippet.publishedAt)}
                                channelImage={video.snippet.thumbnails.default.url}
                            />
                        ))
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No watch history found.</p>
                    )}
                </div>
            </section>

            {/* Playlists Section */}
            <section style={{ marginBottom: '50px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ListVideo size={24} /> Playlists (Real)</h2>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>See all</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {user ? (
                        playlists.length > 0 ? (
                            playlists.map(playlist => (
                                <div key={playlist.id} className="glass-morphism" style={{ borderRadius: '15px', overflow: 'hidden', cursor: 'pointer' }}>
                                    <div style={{ position: 'relative', aspectRatio: '16/9' }}>
                                        <img src={playlist.snippet.thumbnails.high.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '40%', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                            <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{playlist.contentDetails.itemCount}</span>
                                            <ListVideo size={20} />
                                        </div>
                                    </div>
                                    <div style={{ padding: '12px' }}>
                                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{playlist.snippet.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>View full playlist</div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p style={{ color: 'var(--text-muted)' }}>No playlists found.</p>
                        )
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Sign in to see your playlists.</p>
                    )}
                </div>
            </section>

            {/* Liked Videos Section */}
            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ThumbsUp size={24} /> Liked Videos (Real)</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {user ? (
                        likedVideos.length > 0 ? (
                            likedVideos.slice(0, 4).map((video) => (
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
                        )
                    ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Sign in to see your likes.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Library;
