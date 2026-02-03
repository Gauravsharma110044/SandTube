import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEnrichedSearchResults } from '../services/youtube.ts';
import { SlidersHorizontal } from 'lucide-react';

const SearchPage: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const results = await getEnrichedSearchResults(query);
                setVideos(results);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

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
        <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                <button style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600' }}>
                    <SlidersHorizontal size={18} /> Filters
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ width: '360px', aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ height: '20px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ height: '15px', width: '40%', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />
                                    <div style={{ height: '12px', width: '100px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                </div>
                                <div style={{ height: '12px', width: '80%', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {videos.map((video) => (
                        <div
                            key={video.id.videoId}
                            onClick={() => navigate(`/watch/${video.id.videoId}`)}
                            style={{ display: 'flex', gap: '15px', cursor: 'pointer' }}
                            className="search-result-card"
                        >
                            <div style={{ position: 'relative', width: '360px', flexShrink: 0 }}>
                                <img
                                    src={video.snippet.thumbnails.high.url}
                                    alt=""
                                    style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '12px' }}
                                />
                                {video.contentDetails?.duration && (
                                    <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '500' }}>
                                        {video.contentDetails.duration.replace('PT', '').replace('H', ':').replace('M', ':').replace('S', '')}
                                    </div>
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: '500', marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {video.snippet.title}
                                </h3>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                    {formatViews(video.statistics?.viewCount)} views • {getTimeAgo(video.snippet.publishedAt)}
                                </div>
                                <div
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/channel/${video.snippet.channelId}`);
                                    }}
                                    style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}
                                >
                                    <img
                                        src={video.channelDetails?.snippet?.thumbnails?.default?.url}
                                        alt=""
                                        style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                    />
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{video.snippet.channelTitle}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {video.snippet.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                .search-result-card:hover h3 {
                    color: var(--primary);
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.5; }
                }
            `}</style>
        </div>
    );
};

export default SearchPage;
