import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Maximize2 } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import VideoPlayer from './VideoPlayer.tsx';
import CommentSection from './CommentSection.tsx';
import { getVideoDetails, getRelatedVideos, getChannelDetails } from '../services/youtube.ts';

const WatchPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [video, setVideo] = useState<any>(null);
    const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const details = await getVideoDetails(id);
                setVideo(details);

                const related = await getRelatedVideos(id);
                setRelatedVideos(related);

                if (details?.snippet?.channelId) {
                    const chDetails = await getChannelDetails(details.snippet.channelId);
                    setChannel(chDetails);
                }

                // Add to local history
                if (details) {
                    const localHistory = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
                    const updatedHistory = [
                        { ...details, watchedAt: new Date().toISOString() },
                        ...localHistory.filter((item: any) => (item.id.videoId || item.id) !== id)
                    ].slice(0, 50); // Keep last 50
                    localStorage.setItem('sandtube_history', JSON.stringify(updatedHistory));
                }
            } catch (error) {
                console.error("Error fetching watch data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllData();
    }, [id]);

    const formatCount = (count: string) => {
        if (!count) return '0';
        const num = parseInt(count);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return count;
    };

    if (loading || !video) {
        return <div style={{ color: 'white' }}>Loading video details...</div>;
    }

    return (
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease' }}>
            {/* Primary Content */}
            <div style={{ flex: '1 1 700px' }}>
                <VideoPlayer videoId={id || ''} />

                <h1 style={{ fontSize: '1.4rem', marginTop: '20px', fontWeight: 'bold', lineHeight: '1.4' }}>
                    {video.snippet.title}
                </h1>

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '15px',
                    flexWrap: 'wrap',
                    gap: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <img
                            src={channel?.snippet?.thumbnails?.default?.url || "https://i.pravatar.cc/150"}
                            alt="Channel"
                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                        />
                        <div>
                            <div style={{ fontWeight: 'bold' }}>{video.snippet.channelTitle}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                {formatCount(channel?.statistics?.subscriberCount)} subscribers
                            </div>
                        </div>
                        <button className="button-primary" style={{ padding: '8px 20px', marginLeft: '10px' }}>
                            Subscribe
                        </button>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            display: 'flex',
                            background: 'var(--surface)',
                            borderRadius: '50px',
                            overflow: 'hidden',
                            alignItems: 'center'
                        }}>
                            <button style={{ background: 'none', border: 'none', color: 'white', padding: '8px 15px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', borderRight: '1px solid var(--glass-border)' }}>
                                <ThumbsUp size={18} /> {formatCount(video.statistics.likeCount)}
                            </button>
                            <button style={{ background: 'none', border: 'none', color: 'white', padding: '8px 15px', cursor: 'pointer' }}>
                                <ThumbsDown size={18} />
                            </button>
                        </div>
                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Share2 size={18} /> Share
                        </button>
                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Download size={18} /> Download
                        </button>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('setMiniPlayer', { detail: id }));
                            }}
                            style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}
                            title="Mini Player"
                        >
                            <Maximize2 size={18} />
                        </button>
                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}>
                            <MoreHorizontal size={18} />
                        </button>
                    </div>
                </div>

                <div style={{
                    background: 'var(--surface)',
                    padding: '15px',
                    borderRadius: '12px',
                    marginTop: '20px',
                    fontSize: '0.9rem'
                }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
                        {formatCount(video.statistics.viewCount)} views • {new Date(video.snippet.publishedAt).toLocaleDateString()}
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                        {video.snippet.description}
                    </div>
                </div>

                <CommentSection videoId={id} />
            </div>

            {/* Recommendations */}
            <div style={{ flex: '1 1 350px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ padding: '0 0 10px', fontWeight: 'bold', fontSize: '1rem' }}>Up Next</div>
                {relatedVideos.map((vid, i) => (
                    <VideoCard
                        key={i}
                        id={vid.id.videoId || (typeof vid.id === 'string' ? vid.id : '')}
                        thumbnail={vid.snippet.thumbnails.high.url}
                        title={vid.snippet.title}
                        channel={vid.snippet.channelTitle}
                        views="" // Search API doesn't return viewCount easily without another call
                        timestamp={new Date(vid.snippet.publishedAt).toLocaleDateString()}
                        channelImage={vid.snippet.thumbnails.default.url}
                    />
                ))}
            </div>
        </div>
    );
};

export default WatchPage;
