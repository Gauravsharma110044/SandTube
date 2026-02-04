import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard.tsx';
import AdBanner from './AdBanner.tsx';
import { getPopularVideos } from '../services/youtube.ts';
import BackendAPI from '../services/backend.ts';

const categories = ["All", "Sand Art", "Tech", "Gaming", "Music", "Live", "Artificial Intelligence", "Deserts", "Architecture", "Minimalism", "Coding", "Gadgets", "Travel"];

const VideoGrid: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const currentQuery = "All";

    useEffect(() => {
        const fetchVideos = async () => {
            setLoading(true);
            try {
                const youtubeVideos = await getPopularVideos();
                const localVideos = await BackendAPI.getAllVideos();
                setVideos([...localVideos, ...youtubeVideos]);
            } catch (error) {
                console.error("Error fetching videos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchVideos();
    }, [location.search]);

    const handleCategoryClick = (cat: string) => {
        if (cat === "All") {
            navigate('/');
        } else {
            navigate(`/search?q=${encodeURIComponent(cat)}`);
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

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            {/* Category Bar */}
            <div style={{
                display: 'flex',
                gap: '12px',
                paddingBottom: '20px',
                overflowX: 'auto',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                position: 'sticky',
                top: '70px',
                background: 'var(--bg-dark)',
                zIndex: 10,
                marginTop: '-20px',
                paddingTop: '20px',
                paddingLeft: '2px'
            }}>
                {categories.map((cat, i) => (
                    <button
                        key={i}
                        onClick={() => handleCategoryClick(cat)}
                        style={{
                            padding: '6px 14px',
                            background: currentQuery === cat ? 'white' : 'var(--surface)',
                            color: currentQuery === cat ? 'black' : 'white',
                            borderRadius: '8px',
                            whiteSpace: 'nowrap',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '500',
                            transition: 'all 0.2s ease',
                            border: currentQuery === cat ? 'none' : '1px solid var(--glass-border)'
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Top Banner Ad */}
            <AdBanner slot="home_top_banner" style={{ height: '90px', marginBottom: '30px' }} />

            {/* Video Grid */}
            <div className="responsive-grid" style={{
                marginTop: '10px'
            }}>
                {loading ? (
                    Array(12).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '12px', animation: 'pulse 1.5s infinite' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div style={{ height: '16px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                    <div style={{ height: '12px', width: '60%', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    videos.map((video, index) => (
                        <React.Fragment key={video.id.videoId || video.id}>
                            {index > 0 && index % 8 === 0 && (
                                <div style={{
                                    gridColumn: '1 / -1',
                                    background: 'var(--surface)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid var(--glass-border)'
                                }}>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>SPONSORED</span>
                                    <AdBanner slot={`home_grid_ad_${index}`} format="rectangle" style={{ height: '250px' }} />
                                </div>
                            )}
                            <VideoCard
                                id={video.id.videoId || video.id}
                                thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                title={video.snippet.title}
                                channel={video.snippet.channelTitle}
                                channelId={video.snippet.channelId}
                                views={formatViews(video.statistics?.viewCount)}
                                timestamp={getTimeAgo(video.snippet.publishedAt)}
                                channelImage={video.snippet.thumbnails.default.url}
                            />
                        </React.Fragment>
                    ))
                )}
            </div>

            <style>{`
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.5; }
                }
                @media (max-width: 768px) {
                  .responsive-grid {
                    grid-template-columns: 1fr;
                    gap: 30px;
                  }
                }
            `}</style>
        </div>
    );
};

export default VideoGrid;
