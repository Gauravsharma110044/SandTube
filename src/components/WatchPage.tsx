import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Maximize2, Plus } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import VideoPlayer from './VideoPlayer.tsx';
import CommentSection from './CommentSection.tsx';
import PlaylistModal from './PlaylistModal.tsx';
import { getVideoDetails, getRelatedVideos, getChannelDetails } from '../services/youtube.ts';

const WatchPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [video, setVideo] = useState<any>(null);
    const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [isTheatreMode, setIsTheatreMode] = useState(false);
    const [autoplayEnabled, setAutoplayEnabled] = useState(true);
    const [nextVideoCountdown, setNextVideoCountdown] = useState<number | null>(null);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1000);

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth <= 1000);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

                if (details) {
                    const localHistory = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
                    const updatedHistory = [
                        { ...details, watchedAt: new Date().toISOString() },
                        ...localHistory.filter((item: any) => (item.id.videoId || item.id) !== id)
                    ].slice(0, 50);
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
        return (
            <div style={{ height: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div style={{ width: '90%', maxWidth: '1200px', aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '16px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ color: 'var(--text-muted)' }}>Preparing your viewing...</div>
            </div>
        );
    }

    const handleVideoEnd = () => {
        if (autoplayEnabled && relatedVideos.length > 0) {
            setNextVideoCountdown(5);
        }
    };

    useEffect(() => {
        if (nextVideoCountdown === null) return;
        if (nextVideoCountdown === 0) {
            const nextVid = relatedVideos[0];
            const nextId = nextVid.id.videoId || (typeof nextVid.id === 'string' ? nextVid.id : '');
            navigate(`/watch/${nextId}`);
            setNextVideoCountdown(null);
            return;
        }
        const timer = setTimeout(() => setNextVideoCountdown(nextVideoCountdown - 1), 1000);
        return () => clearTimeout(timer);
    }, [nextVideoCountdown, relatedVideos, navigate]);

    const effectiveTheatreMode = isTheatreMode || isSmallScreen;

    return (
        <div style={{
            display: 'flex',
            flexDirection: effectiveTheatreMode ? 'column' : 'row',
            gap: '24px',
            animation: 'fadeIn 0.5s ease',
            padding: effectiveTheatreMode ? '0' : '0 20px',
            maxWidth: '1700px',
            margin: '0 auto'
        }}>
            {/* Primary Content */}
            <div style={{ flex: effectiveTheatreMode ? 'none' : '1', width: effectiveTheatreMode ? '100%' : 'unset' }}>
                <VideoPlayer videoId={id || ''} onEnded={handleVideoEnd} />

                {nextVideoCountdown !== null && (
                    <div className="glass-morphism" style={{ position: 'fixed', bottom: isSmallScreen ? '20px' : '100px', right: isSmallScreen ? '20px' : '40px', padding: '15px', borderRadius: '12px', border: '1px solid var(--primary)', zIndex: 1000, animation: 'slideIn 0.3s ease', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Up Next in {nextVideoCountdown}s</div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <img src={relatedVideos[0].snippet.thumbnails.default.url} style={{ width: '60px', borderRadius: '4px' }} alt="" />
                            <div style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{relatedVideos[0].snippet.title}</div>
                        </div>
                        <button onClick={() => setNextVideoCountdown(null)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '5px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                )}

                <div style={{ padding: isSmallScreen ? '0 15px' : '0' }}>
                    <h1 style={{ fontSize: isSmallScreen ? '1.1rem' : '1.3rem', marginTop: '15px', fontWeight: 'bold', lineHeight: '1.4' }}>
                        {video.snippet.title}
                    </h1>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px', flexWrap: 'wrap', gap: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <img
                                src={channel?.snippet?.thumbnails?.default?.url || "https://i.pravatar.cc/150"}
                                alt="Channel"
                                onClick={() => navigate(`/channel/${video.snippet.channelId}`)}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
                            />
                            <div>
                                <div onClick={() => navigate(`/channel/${video.snippet.channelId}`)} style={{ fontWeight: 'bold', cursor: 'pointer', fontSize: '0.95rem' }}>{video.snippet.channelTitle}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatCount(channel?.statistics?.subscriberCount)} subscribers</div>
                            </div>
                            <button className="button-primary" style={{ padding: '8px 18px', marginLeft: '5px', fontSize: '0.85rem' }}>Subscribe</button>
                        </div>

                        <div className="watch-actions" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', maxWidth: '100%' }}>
                            <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '50px', overflow: 'hidden', alignItems: 'center' }}>
                                <button style={{ background: 'none', border: 'none', color: 'white', padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', borderRight: '1px solid var(--glass-border)', fontSize: '0.85rem' }}>
                                    <ThumbsUp size={16} /> {formatCount(video.statistics.likeCount)}
                                </button>
                                <button style={{ background: 'none', border: 'none', color: 'white', padding: '8px 12px', cursor: 'pointer' }}><ThumbsDown size={16} /></button>
                            </div>
                            <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Share2 size={16} /> Share</button>
                            {!isSmallScreen && <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Download size={16} /> Download</button>}
                            <button onClick={() => setShowPlaylistModal(true)} style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}><Plus size={16} /> Save</button>
                            <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                        </div>
                    </div>

                    <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', marginTop: '15px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{formatCount(video.statistics.viewCount)} views • {new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
                        <div style={{ whiteSpace: 'pre-wrap', maxHeight: '100px', overflow: 'hidden', maskImage: 'linear-gradient(to bottom, black 50%, transparent 100%)' }}>{video.snippet.description}</div>
                        <button style={{ background: 'none', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px', fontSize: '0.8rem' }}>Show more</button>
                    </div>

                    <CommentSection videoId={id} />
                </div>
            </div>

            {/* Recommendations */}
            <div style={{
                width: effectiveTheatreMode ? '100%' : '400px',
                maxWidth: effectiveTheatreMode ? '1280px' : '400px',
                margin: effectiveTheatreMode ? '20px auto' : '0',
                padding: effectiveTheatreMode ? '0 15px' : '0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Up Next</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Autoplay
                        <div onClick={() => setAutoplayEnabled(!autoplayEnabled)} style={{ width: '30px', height: '16px', background: autoplayEnabled ? 'var(--primary)' : '#444', borderRadius: '10px', position: 'relative', cursor: 'pointer', transition: '0.3s' }}>
                            <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: autoplayEnabled ? '17px' : '3px', transition: '0.3s' }} />
                        </div>
                    </div>
                </div>
                {relatedVideos.map((vid, i) => (
                    <VideoCard
                        key={i}
                        id={vid.id.videoId || (typeof vid.id === 'string' ? vid.id : '')}
                        thumbnail={vid.snippet.thumbnails.high.url}
                        title={vid.snippet.title}
                        channel={vid.snippet.channelTitle}
                        channelId={vid.snippet.channelId}
                        views=""
                        timestamp={new Date(vid.snippet.publishedAt).toLocaleDateString()}
                        channelImage={vid.snippet.thumbnails.default.url}
                        horizontal={!effectiveTheatreMode || window.innerWidth > 1000}
                    />
                ))}
            </div>

            {showPlaylistModal && <PlaylistModal videoId={id || ''} onClose={() => setShowPlaylistModal(false)} />}
        </div>
    );
};

export default WatchPage;
