import React, { useEffect, useState } from 'react';
import { History, PlaySquare, Clock, ThumbsUp, ListVideo, User, Settings, Info, Crown, Download } from 'lucide-react';
import BackendAPI from '../services/backend.ts';
import VideoCard from './VideoCard.tsx';
import { getMyLikedVideos, getMyPlaylists, getMyChannel } from '../services/youtube.ts';
import { useNavigate } from 'react-router-dom';

const Library: React.FC = () => {
    const navigate = useNavigate();
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const [playlists, setPlaylists] = useState<any[]>([]);
    const [localHistory, setLocalHistory] = useState<any[]>([]);
    const [offlineVideos, setOfflineVideos] = useState<any[]>([]);
    const [isPremium, setIsPremium] = useState(false);
    const [myChannel, setMyChannel] = useState<any>(null);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchLibrary = async () => {
            // Fetch local history
            const history = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
            setLocalHistory(history);

            if (user?.sub) {
                const status = await BackendAPI.getPremiumStatus(user.sub);
                setIsPremium(status);
                if (status) {
                    const offline = await BackendAPI.getOfflineVideos(user.sub);
                    setOfflineVideos(offline);
                }
            }

            if (user?.accessToken) {
                try {
                    const [liked, myPlaylists, channel] = await Promise.all([
                        getMyLikedVideos(user.accessToken),
                        getMyPlaylists(user.accessToken),
                        getMyChannel(user.accessToken)
                    ]);
                    setLikedVideos(liked);
                    setPlaylists(myPlaylists);
                    setMyChannel(channel);
                } catch (error) {
                    console.error("Error fetching library data:", error);
                }
            }
        };
        fetchLibrary();
    }, [user?.accessToken]);

    const formatViews = (views: string) => {
        if (!views) return '0';
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

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '20px' }}>

            {user && (
                <div className="glass-morphism" style={{
                    padding: '40px',
                    borderRadius: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '30px',
                    marginBottom: '50px',
                    background: 'linear-gradient(135deg, rgba(230, 185, 120, 0.1), rgba(0,0,0,0.4))',
                    border: '1px solid var(--primary-low)'
                }}>
                    <img
                        src={user.picture}
                        alt=""
                        style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid var(--primary)' }}
                    />
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{user.name}</h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>{user.email} • {myChannel?.snippet?.customUrl || 'Loading handle...'}</p>
                        <div style={{ display: 'flex', gap: '20px', marginTop: '15px' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{likedVideos.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Likes</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{playlists.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Playlists</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{localHistory.length}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>History</div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/settings')}
                        style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                    >
                        <Settings size={18} /> Edit Profile
                    </button>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '40px' }}>

                <div className="library-left">
                    <section style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <History size={28} style={{ color: 'var(--primary)' }} /> Recent History
                            </h2>
                            <button
                                onClick={() => navigate('/history')}
                                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                            >
                                SEE ALL
                            </button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {localHistory.length > 0 ? (
                                localHistory.slice(0, 4).map((video) => (
                                    <VideoCard
                                        key={video.id.videoId || video.id}
                                        id={video.id.videoId || video.id}
                                        thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                        title={video.snippet.title}
                                        channel={video.snippet.channelTitle}
                                        channelId={video.snippet.channelId}
                                        views={formatViews(video.statistics?.viewCount)}
                                        timestamp={getTimeAgo(video.watchedAt || video.snippet.publishedAt)}
                                        channelImage={video.snippet.thumbnails.default.url}
                                    />
                                ))
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>No historical videos yet.</p>
                            )}
                        </div>
                    </section>

                    <section style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <Download size={28} style={{ color: isPremium ? '#FFD700' : 'var(--primary)' }} /> Offline Downloads
                            </h2>
                            {!isPremium && (
                                <button
                                    onClick={() => navigate('/premium')}
                                    style={{ background: 'rgba(255, 215, 0, 0.1)', border: '1px solid #FFD700', color: '#FFD700', padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    GET PREMIUM
                                </button>
                            )}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {isPremium ? (
                                offlineVideos.length > 0 ? (
                                    offlineVideos.map((video) => (
                                        <VideoCard
                                            key={video.id.videoId || video.id}
                                            id={video.id.videoId || video.id}
                                            thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                            title={video.snippet.title}
                                            channel={video.snippet.channelTitle}
                                            channelId={video.snippet.channelId}
                                            views={formatViews(video.statistics?.viewCount)}
                                            timestamp={getTimeAgo(video.downloadedAt || video.snippet.publishedAt)}
                                            channelImage={video.snippet.thumbnails.default.url}
                                        />
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>No offline videos. Start downloading!</p>
                                )
                            ) : (
                                <div className="glass-card" style={{ padding: '30px', textAlign: 'center', gridColumn: '1 / -1' }}>
                                    <Crown size={40} color="#FFD700" style={{ marginBottom: '15px' }} />
                                    <h3>Offline Viewing is a Premium Feature</h3>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Save your favorite videos for when you're on the go.</p>
                                    <button className="button-primary" onClick={() => navigate('/premium')}>Upgrade to Premium</button>
                                </div>
                            )}
                        </div>
                    </section>

                    <section style={{ marginBottom: '60px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                            <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <ListVideo size={28} style={{ color: 'var(--primary)' }} /> Playlists
                            </h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                            {user ? (
                                playlists.length > 0 ? (
                                    playlists.map(playlist => (
                                        <div
                                            key={playlist.id}
                                            className="playlist-card"
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => navigate(`/playlist/${playlist.id}`)}
                                        >
                                            <div style={{ position: 'relative', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', marginBottom: '10px' }}>
                                                <img src={playlist.snippet.thumbnails.high.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '35%', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(10px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>{playlist.contentDetails.itemCount}</span>
                                                    <ListVideo size={24} />
                                                </div>
                                            </div>
                                            <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{playlist.snippet.title}</div>
                                        </div>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)' }}>No playlists found.</p>
                                )
                            ) : (
                                <p style={{ color: 'var(--text-muted)' }}>Sign in to see playlists.</p>
                            )}
                        </div>
                    </section>
                </div>

                <div className="library-right">
                    <div className="glass-morphism" style={{ padding: '25px', borderRadius: '20px', position: 'sticky', top: '90px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div
                                onClick={() => navigate('/history')}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
                            >
                                <History size={20} /> History
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                                <PlaySquare size={20} /> Your videos
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}>
                                <Clock size={20} /> Watch later
                            </div>
                            <div
                                onClick={() => navigate('/liked-videos')}
                                style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '12px', borderRadius: '12px', cursor: 'pointer', background: 'rgba(255,255,255,0.05)' }}
                            >
                                <ThumbsUp size={20} /> Liked videos
                            </div>
                        </div>

                        <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '20px 0' }} />

                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <Info size={14} /> Total watched: {localHistory.length}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <User size={14} /> Channel name: {user?.name || 'Guest'}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Library;
