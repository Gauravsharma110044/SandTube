import React, { useEffect, useState } from 'react';
import { ThumbsUp, Play, Shuffle, Search, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getMyLikedVideos } from '../services/youtube.ts';
import BackendAPI from '../services/backend.ts';

const LikedVideosPage: React.FC = () => {
    const navigate = useNavigate();
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchLikes = async () => {
            let youtubeLikes: any[] = [];
            let localLikes: any[] = [];

            if (user?.accessToken) {
                try {
                    youtubeLikes = await getMyLikedVideos(user.accessToken) || [];
                } catch (error) {
                    console.error("Error fetching YouTube likes:", error);
                }
            }

            if (user?.sub) {
                try {
                    localLikes = await BackendAPI.getLikedVideosByUser(user.sub);
                } catch (error) {
                    console.error("Error fetching local likes:", error);
                }
            }

            setLikedVideos([...localLikes, ...youtubeLikes]);
            setLoading(false);
        };
        fetchLikes();
    }, [user?.accessToken, user?.sub]);

    const formatViews = (views: string) => {
        if (!views) return 'N/A';
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return views;
    };

    const filteredVideos = likedVideos.filter(video =>
    (video.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.snippet.channelTitle.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', animation: 'fadeIn 0.5s ease', padding: '20px' }}>

            {/* Left Box */}
            <div style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                <div style={{
                    background: 'linear-gradient(to bottom, rgba(230, 185, 120, 0.3), var(--surface))',
                    borderRadius: '24px',
                    padding: '24px',
                    color: 'white',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '15px', overflow: 'hidden', marginBottom: '20px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                        {likedVideos.length > 0 ? (
                            <img src={likedVideos[0].snippet.thumbnails?.high?.url || likedVideos[0].snippet.thumbnails?.medium?.url || likedVideos[0].snippet.thumbnails?.default?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ width: '100%', height: '100%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <ThumbsUp size={48} opacity={0.3} />
                            </div>
                        )}
                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.6)', padding: '10px', backdropFilter: 'blur(5px)', textAlign: 'center', fontSize: '0.8rem' }}>
                            PLAY ALL
                        </div>
                    </div>

                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '10px' }}>Liked Videos</h1>
                    <div style={{ fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>{user?.name || 'Guest'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', marginBottom: '20px' }}>
                        {likedVideos.length} videos • Updated today
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
                        <button style={{ flex: 1, background: 'white', color: 'black', border: 'none', padding: '10px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Play size={18} fill="black" /> Play all
                        </button>
                        <button style={{ flex: 1, background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', padding: '10px', borderRadius: '50px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                            <Shuffle size={18} /> Shuffle
                        </button>
                    </div>

                    <div style={{ position: 'relative', marginTop: '20px' }}>
                        <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)' }} />
                        <input
                            type="text"
                            placeholder="Search liked videos"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: 'none', padding: '10px 10px 10px 35px', borderRadius: '10px', color: 'white', outline: 'none', fontSize: '0.85rem' }}
                        />
                    </div>
                </div>
            </div>

            {/* Right List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {!user ? (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                        <h2>Sign in to see your liked videos.</h2>
                    </div>
                ) : loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading your collection...</div>
                ) : filteredVideos.length > 0 ? (
                    filteredVideos.map((video, index) => (
                        <div
                            key={video.id + index}
                            onClick={() => navigate(`/watch/${video.id}`)}
                            style={{ display: 'flex', gap: '15px', padding: '10px', borderRadius: '12px', cursor: 'pointer', transition: 'background 0.2s' }}
                            className="liked-item"
                        >
                            <div style={{ color: 'var(--text-muted)', width: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {index + 1}
                            </div>
                            <div style={{ width: '160px', height: '90px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{video.snippet.title}</h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    {video.snippet.channelTitle} • {formatViews(video.statistics?.viewCount)} views
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <MoreVertical size={20} style={{ color: 'var(--text-muted)' }} />
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                        <h2>No videos found.</h2>
                    </div>
                )}
            </div>

            <style>{`
                .liked-item:hover {
                    background: var(--surface-hover);
                }
            `}</style>
        </div>
    );
};

export default LikedVideosPage;
