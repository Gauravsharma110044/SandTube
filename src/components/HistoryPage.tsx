import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2, Search, Settings, Pause, Play } from 'lucide-react';
import VideoCard from './VideoCard.tsx';

const HistoryPage: React.FC = () => {
    const [localHistory, setLocalHistory] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
        setLocalHistory(history);
    }, []);

    const clearHistory = () => {
        if (window.confirm('Clear entire watch history?')) {
            localStorage.removeItem('sandtube_history');
            setLocalHistory([]);
        }
    };

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

    const filteredHistory = localHistory.filter(video =>
        video.snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.snippet.channelTitle.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '50px', animation: 'fadeIn 0.5s ease', padding: '20px' }}>

            <div className="history-list">
                <h1 style={{ fontSize: '2rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    Watch History
                </h1>

                {filteredHistory.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {filteredHistory.map((video, i) => (
                            <div key={video.id + i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
                                <div style={{ width: '280px', flexShrink: 0 }}>
                                    <VideoCard
                                        id={video.id.videoId || video.id}
                                        thumbnail={video.snippet.thumbnails.high?.url}
                                        title=""
                                        channel=""
                                        views=""
                                        timestamp=""
                                        channelImage=""
                                    />
                                </div>
                                <div style={{ flex: 1, padding: '10px 0' }}>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '8px', lineHeight: '1.4' }}>{video.snippet.title}</h3>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>
                                        {video.snippet.channelTitle} • {formatViews(video.statistics?.viewCount)} views
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.5' }}>
                                        {video.snippet.description}
                                    </p>
                                    <div style={{ marginTop: '15px', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                                        Watched {getTimeAgo(video.watchedAt)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                        <HistoryIcon size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                        <h2>No videos found.</h2>
                        <p>Your watch history will appear here.</p>
                    </div>
                )}
            </div>

            <div className="history-controls" style={{ position: 'sticky', top: '90px', height: 'fit-content' }}>
                <div style={{ position: 'relative', marginBottom: '30px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Search watch history"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ width: '100%', background: 'var(--surface)', border: 'none', padding: '12px 12px 12px 45px', borderRadius: '12px', color: 'white', outline: 'none' }}
                    />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <button
                        onClick={clearHistory}
                        style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', borderRadius: '8px' }}
                        className="control-item"
                    >
                        <Trash2 size={20} /> Clear all watch history
                    </button>
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', borderRadius: '8px' }}
                        className="control-item"
                    >
                        {isPaused ? <Play size={20} /> : <Pause size={20} />} {isPaused ? 'Resume' : 'Pause'} watch history
                    </button>
                    <button
                        style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '10px', borderRadius: '8px' }}
                        className="control-item"
                    >
                        <Settings size={20} /> Manage all history
                    </button>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '25px 0' }} />

                <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold', marginBottom: '15px' }}>History Type</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ color: 'var(--primary)', padding: '8px 10px', borderRadius: '8px', background: 'rgba(230, 185, 120, 0.1)', cursor: 'pointer' }}>Watch history</div>
                    <div style={{ padding: '8px 10px', cursor: 'pointer' }}>Search history</div>
                    <div style={{ padding: '8px 10px', cursor: 'pointer' }}>Comments</div>
                    <div style={{ padding: '8px 10px', cursor: 'pointer' }}>Community</div>
                </div>
            </div>

            <style>{`
                .control-item:hover {
                    background: var(--surface-hover) !important;
                }
            `}</style>
        </div>
    );
};

export default HistoryPage;
