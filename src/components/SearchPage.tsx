import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getEnrichedSearchResults } from '../services/youtube.ts';
import { SlidersHorizontal, X } from 'lucide-react';
import BackendAPI from '../services/backend.ts';

const SearchPage: React.FC = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);

    // Filter states
    const [uploadDate, setUploadDate] = useState('any');
    const [duration, setDuration] = useState('any');
    const [sortBy, setSortBy] = useState('relevance');

    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search).get('q');

    const getPublishedAfter = (val: string) => {
        const now = new Date();
        if (val === 'hour') now.setHours(now.getHours() - 1);
        else if (val === 'today') now.setHours(0, 0, 0, 0);
        else if (val === 'week') now.setDate(now.getDate() - 7);
        else if (val === 'month') now.setMonth(now.getMonth() - 1);
        else if (val === 'year') now.setFullYear(now.getFullYear() - 1);
        else return undefined;
        return now.toISOString();
    };

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) return;
            setLoading(true);
            try {
                const filters: any = {
                    order: sortBy,
                };

                if (uploadDate !== 'any') {
                    filters.publishedAfter = getPublishedAfter(uploadDate);
                }

                if (duration !== 'any') {
                    filters.videoDuration = duration;
                }

                const results = await getEnrichedSearchResults(query, filters);

                // Fetch local results
                let localResults: any[] = [];
                try {
                    localResults = await BackendAPI.searchVideos(query);
                    // Map local results to match YouTube structure if needed
                    localResults = localResults.map(v => ({
                        ...v,
                        id: { videoId: v.id }, // Wrap ID to match YouTube structure
                        isLocal: true
                    }));
                } catch (err) {
                    console.error("Local search error:", err);
                }

                setVideos([...localResults, ...results]);
            } catch (error) {
                console.error("Error fetching search results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query, uploadDate, duration, sortBy]);

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

    const FilterSection = ({ title, options, current, onChange }: any) => (
        <div style={{ flex: 1, minWidth: '150px' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', color: 'white', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>{title}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {options.map((opt: any) => (
                    <div
                        key={opt.value}
                        onClick={() => onChange(opt.value)}
                        style={{
                            fontSize: '0.85rem',
                            color: current === opt.value ? 'white' : 'var(--text-muted)',
                            fontWeight: current === opt.value ? 'bold' : 'normal',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {opt.label}
                        {current === opt.value && <X size={12} onClick={(e) => { e.stopPropagation(); onChange('any'); }} style={{ marginLeft: 'auto', opacity: 0.5 }} />}
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div style={{ maxWidth: '1100px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{ background: 'none', border: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', padding: '8px 16px', borderRadius: '8px', transition: 'background 0.2s' }}
                    className="filter-btn"
                >
                    <SlidersHorizontal size={18} /> Filters
                </button>

                {showFilters && (
                    <div style={{
                        display: 'flex',
                        gap: '40px',
                        padding: '20px 0',
                        animation: 'slideDown 0.3s ease',
                        borderBottom: '1px solid var(--glass-border)',
                        marginBottom: '20px',
                        flexWrap: 'wrap'
                    }}>
                        <FilterSection
                            title="Upload Date"
                            current={uploadDate}
                            onChange={setUploadDate}
                            options={[
                                { label: 'Last hour', value: 'hour' },
                                { label: 'Today', value: 'today' },
                                { label: 'This week', value: 'week' },
                                { label: 'This month', value: 'month' },
                                { label: 'This year', value: 'year' },
                            ]}
                        />
                        <FilterSection
                            title="Duration"
                            current={duration}
                            onChange={setDuration}
                            options={[
                                { label: 'Under 4 minutes', value: 'short' },
                                { label: '4 - 20 minutes', value: 'medium' },
                                { label: 'Over 20 minutes', value: 'long' },
                            ]}
                        />
                        <FilterSection
                            title="Sort By"
                            current={sortBy}
                            onChange={setSortBy}
                            options={[
                                { label: 'Relevance', value: 'relevance' },
                                { label: 'Upload date', value: 'date' },
                                { label: 'View count', value: 'viewCount' },
                                { label: 'Rating', value: 'rating' },
                            ]}
                        />
                    </div>
                )}
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
            ) : videos.length > 0 ? (
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
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <h2>No results found for your filters. Try widening your search.</h2>
                </div>
            )}

            <style>{`
                .search-result-card:hover h3 {
                    color: var(--primary);
                }
                .filter-btn:hover {
                    background: var(--surface-hover);
                }
                @keyframes pulse {
                    0% { opacity: 0.5; }
                    50% { opacity: 0.8; }
                    100% { opacity: 0.5; }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default SearchPage;
