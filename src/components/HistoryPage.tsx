import React, { useEffect, useState } from 'react';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import VideoCard from './VideoCard.tsx';

const HistoryPage: React.FC = () => {
    const [localHistory, setLocalHistory] = useState<any[]>([]);

    useEffect(() => {
        const history = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
        setLocalHistory(history);
    }, []);

    const clearHistory = () => {
        localStorage.removeItem('sandtube_history');
        setLocalHistory([]);
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

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <HistoryIcon size={32} /> Watch History
                </h1>
                {localHistory.length > 0 && (
                    <button
                        onClick={clearHistory}
                        style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                        <Trash2 size={18} /> Clear all history
                    </button>
                )}
            </div>

            {localHistory.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {localHistory.map((video) => (
                        <VideoCard
                            key={video.id + (video.watchedAt || '')}
                            id={video.id.videoId || video.id}
                            thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                            title={video.snippet.title}
                            channel={video.snippet.channelTitle}
                            views={formatViews(video.statistics?.viewCount)}
                            timestamp={getTimeAgo(video.watchedAt || video.snippet.publishedAt)}
                            channelImage={video.snippet.thumbnails.default.url}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <HistoryIcon size={64} style={{ marginBottom: '20px', opacity: 0.5 }} />
                    <h2>This list has no videos.</h2>
                    <p>When you watch videos, they will appear here.</p>
                </div>
            )}
        </div>
    );
};

export default HistoryPage;
