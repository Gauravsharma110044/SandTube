import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, Share2, Download, MoreHorizontal, Plus, Sparkles, Users, Heart } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import VideoPlayer from './VideoPlayer.tsx';
import CommentSection from './CommentSection.tsx';
import PlaylistModal from './PlaylistModal.tsx';
import AdBanner from './AdBanner.tsx';
import { getVideoDetails, getRelatedVideos, getChannelDetails } from '../services/youtube.ts';
import { analyticsEngine, socialEngine, notificationEngine } from '../engines/index.ts';
import BackendAPI from '../services/backend.ts';

const WatchPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [video, setVideo] = useState<any>(null);
    const [relatedVideos, setRelatedVideos] = useState<any[]>([]);
    const [channel, setChannel] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPlaylistModal, setShowPlaylistModal] = useState(false);
    const [autoplayEnabled, setAutoplayEnabled] = useState(true);
    const [nextVideoCountdown, setNextVideoCountdown] = useState<number | null>(null);
    const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 1000);
    const [summary, setSummary] = useState<string[] | null>(null);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [partyId, setPartyId] = useState<string | null>(null);
    const [partyData, setPartyData] = useState<any>(null);

    // Real-time engagement state
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [hasLiked, setHasLiked] = useState(false);
    const [hasDisliked, setHasDisliked] = useState(false);
    const [viewCount, setViewCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const handleSummarize = async () => {
        if (!isPremium) {
            if (window.confirm('AI Summaries are a Premium feature. Want to upgrade?')) navigate('/premium');
            return;
        }

        setIsSummarizing(true);
        notificationEngine.createNotification('upload', 'AI Pulse', 'Analyzing video content...');

        // Simulate AI generation
        setTimeout(() => {
            const points = [
                `Video focuses on: ${video?.snippet?.title || 'this topic'}`,
                "Deep dive into the core concepts and real-world applications.",
                "Key takeaways: Practical steps for immediate implementation.",
                "Community verdict: Highly informative and well-produced."
            ];
            setSummary(points);
            setIsSummarizing(false);
            notificationEngine.createNotification('upload', 'AI Pulse', 'Summary generated!');
        }, 2000);
    };

    const handleStartWatchParty = async () => {
        if (!isPremium) {
            if (window.confirm('Watch Parties are a Premium feature. Want to upgrade?')) navigate('/premium');
            return;
        }
        if (!id) return;
        const newPartyId = await BackendAPI.createWatchParty(user.sub, id);
        setPartyId(newPartyId);
        notificationEngine.createNotification('upload', 'Watch Party', `Room created: ${newPartyId}. Share the ID with friends!`);
    };

    useEffect(() => {
        if (partyId) {
            const unsub = BackendAPI.subscribeToWatchParty(partyId, (data) => {
                setPartyData(data);
            });
            return () => unsub();
        }
    }, [partyId]);

    const handleTipCreator = async () => {
        if (!isPremium) {
            if (window.confirm('Creator Tipping is a Premium feature. Want to upgrade?')) navigate('/premium');
            return;
        }
        notificationEngine.createNotification('upload', 'Creator Boost', `Sending a Sand-Tip to ${channel?.snippet?.title || 'the creator'}! 💎`);
    };

    useEffect(() => {
        const handleResize = () => setIsSmallScreen(window.innerWidth <= 1000);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.sub) {
            const unsubscribe = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsubscribe();
        }
    }, [user?.sub]);

    useEffect(() => {
        const fetchAllData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                let details = await getVideoDetails(id);

                // If not found in YouTube, check Firebase
                if (!details) {
                    details = await BackendAPI.getVideo(id);
                }

                setVideo(details);

                // Fetch related videos (but only if it's likely a YouTube ID)
                try {
                    if (!id.startsWith('v_')) {
                        const related = await getRelatedVideos(id);
                        setRelatedVideos(related || []);
                    } else {
                        setRelatedVideos([]); // For now, keep it simple
                    }
                } catch (e) {
                    console.warn("Related videos fetch failed", e);
                    setRelatedVideos([]);
                }

                if (details?.snippet?.channelId && !details.snippet.channelId.startsWith('channel_')) {
                    try {
                        const chDetails = await getChannelDetails(details.snippet.channelId);
                        setChannel(chDetails);
                    } catch (e) {
                        console.warn("Channel details fetch failed", e);
                    }
                }

                if (details) {
                    const localHistory = JSON.parse(localStorage.getItem('sandtube_history') || '[]');
                    const vidId = details.id.videoId || details.id;
                    const updatedHistory = [
                        { ...details, watchedAt: new Date().toISOString() },
                        ...localHistory.filter((item: any) => (item.id.videoId || item.id) !== vidId)
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

    // Track video view and setup real-time listeners
    useEffect(() => {
        if (!id) return;

        // Track view in analytics engine
        const watchStartTime = Date.now();
        analyticsEngine.trackView(id, 0, user?.sub || 'anonymous');

        // Subscribe to real-time like/dislike counts
        const unsubscribeLikes = BackendAPI.subscribeToLikes(id, (count) => {
            setLikeCount(count);
        });

        const unsubscribeDislikes = BackendAPI.subscribeToDislikes(id, (count) => {
            setDislikeCount(count);
        });

        const unsubscribeViews = BackendAPI.subscribeToViewCount(id, (count) => {
            setViewCount(count);
        });

        // Track watch duration on unmount
        return () => {
            const watchDuration = Math.floor((Date.now() - watchStartTime) / 1000);
            analyticsEngine.trackView(id, watchDuration, user?.sub || 'anonymous');
            BackendAPI.trackView(id, user?.sub || 'anonymous', watchDuration);

            unsubscribeLikes();
            unsubscribeDislikes();
            unsubscribeViews();
        };
    }, [id, user]);

    // Handle like button click
    const handleLike = async () => {
        if (!user) {
            alert('Please sign in to like videos');
            return;
        }

        const result = await BackendAPI.likeVideo(id!, user.sub);
        setHasLiked(result.action === 'added');
        setHasDisliked(false);

        // Track in analytics
        if (result.action === 'added') {
            analyticsEngine.trackEngagement(id!, 'like');
            socialEngine.likeVideo(id!, user.sub);
        }
    };

    // Handle dislike button click
    const handleDislike = async () => {
        if (!user) {
            alert('Please sign in to dislike videos');
            return;
        }

        const result = await BackendAPI.dislikeVideo(id!, user.sub);
        setHasDisliked(result.action === 'added');
        setHasLiked(false);

        // Track in analytics
        if (result.action === 'added') {
            analyticsEngine.trackEngagement(id!, 'dislike');
            socialEngine.dislikeVideo(id!, user.sub);
        }
    };

    // Handle share button click
    const handleShare = (platform: 'twitter' | 'facebook' | 'whatsapp' | 'copy') => {
        const videoUrl = `${window.location.origin}/watch/${id}`;
        const result = socialEngine.shareVideo(id!, platform, video.snippet.title, videoUrl);

        if (result.url) {
            window.open(result.url, '_blank');
        } else if (platform === 'copy') {
            // Use 'upload' type as a workaround since 'share' is not in the allowed types
            notificationEngine.createNotification('upload', 'Link copied!', 'Video link copied to clipboard');
        }

        // Track in analytics
        analyticsEngine.trackEngagement(id!, 'share');
        BackendAPI.trackView(id!, user?.sub || 'anonymous', 0); // Track share as engagement
    };

    const handleWatchLater = async () => {
        if (!video) return;

        if (user?.sub) {
            try {
                // For the UI toggle, we'd ideally have an 'isSaved' state
                // But let's check current list first
                const currentList = await BackendAPI.getWatchLaterByUser(user.sub);
                const exists = currentList.find((v: any) => (v.id.videoId || v.id) === id);

                if (exists) {
                    await BackendAPI.removeFromWatchLater(user.sub, id!);
                    notificationEngine.createNotification('upload', 'Removed', 'Video removed from Watch Later');
                } else {
                    await BackendAPI.addToWatchLater(user.sub, id!, video);
                    notificationEngine.createNotification('upload', 'Saved', 'Video added to Watch Later');
                }
            } catch (error) {
                console.error("Error toggling watch later:", error);
            }
        } else {
            const currentList = JSON.parse(localStorage.getItem('sandtube_watch_later') || '[]');
            const exists = currentList.find((v: any) => (v.id.videoId || v.id) === id);

            if (exists) {
                const updated = currentList.filter((v: any) => (v.id.videoId || v.id) !== id);
                localStorage.setItem('sandtube_watch_later', JSON.stringify(updated));
                notificationEngine.createNotification('upload', 'Removed', 'Video removed from Watch Later');
            } else {
                const updated = [video, ...currentList].slice(0, 50);
                localStorage.setItem('sandtube_watch_later', JSON.stringify(updated));
                notificationEngine.createNotification('upload', 'Saved', 'Video added to Watch Later');
            }
        }
    };

    const handleDownload = async () => {
        if (!user) {
            notificationEngine.createNotification('upload', 'Sign In', 'Please sign in to download videos');
            return;
        }

        if (!isPremium) {
            if (window.confirm('Downloads are a Premium feature. Want to see our Premium plans?')) {
                navigate('/premium');
            }
            return;
        }

        try {
            await BackendAPI.saveOfflineVideo(user.sub, video);
            notificationEngine.createNotification('upload', 'Download Started', 'The video is being saved to your offline library');
        } catch (err) {
            console.error("Download error:", err);
        }
    };

    const formatCount = (count: any) => {
        if (!count) return '0';
        const num = typeof count === 'string' ? parseInt(count) : count;
        if (isNaN(num)) return count;
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return String(num);
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

    const effectiveTheatreMode = isSmallScreen;

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
                <VideoPlayer videoId={id || ''} videoUrl={video.videoUrl} onEnded={handleVideoEnd} />

                {nextVideoCountdown !== null && relatedVideos.length > 0 && (
                    <div className="glass-morphism" style={{ position: 'fixed', bottom: isSmallScreen ? '20px' : '100px', right: isSmallScreen ? '20px' : '40px', padding: '15px', borderRadius: '12px', border: '1px solid var(--primary)', zIndex: 1000, animation: 'slideIn 0.3s ease', maxWidth: '300px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Up Next in {nextVideoCountdown}s</div>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <img src={relatedVideos[0].snippet.thumbnails?.default?.url || relatedVideos[0].snippet.thumbnails?.medium?.url} style={{ width: '60px', borderRadius: '4px' }} alt="" />
                            <div style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{relatedVideos[0].snippet.title}</div>
                        </div>
                        <button onClick={() => setNextVideoCountdown(null)} style={{ width: '100%', marginTop: '10px', background: 'none', border: '1px solid var(--glass-border)', color: 'white', padding: '5px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                    </div>
                )}

                <div style={{ padding: isSmallScreen ? '0 15px' : '0' }}>
                    <h1 style={{ fontSize: isSmallScreen ? '1.1rem' : '1.3rem', marginTop: '15px', fontWeight: 'bold', lineHeight: '1.4' }}>
                        {video.snippet.title}
                    </h1>

                    {/* Banner below title */}
                    <AdBanner slot="3056171345" style={{ height: '60px', marginTop: '10px' }} />

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
                                <button
                                    onClick={handleLike}
                                    style={{
                                        background: hasLiked ? 'var(--primary)' : 'none',
                                        border: 'none',
                                        color: 'white',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        borderRight: '1px solid var(--glass-border)',
                                        fontSize: '0.85rem',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <ThumbsUp size={16} fill={hasLiked ? 'white' : 'none'} /> {formatCount(likeCount || video.statistics?.likeCount)}
                                </button>
                                <button
                                    onClick={handleDislike}
                                    style={{
                                        background: hasDisliked ? 'var(--primary)' : 'none',
                                        border: 'none',
                                        color: 'white',
                                        padding: '8px 12px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <ThumbsDown size={16} fill={hasDisliked ? 'white' : 'none'} /> {formatCount(dislikeCount)}
                                </button>
                            </div>
                            <button
                                onClick={() => handleShare('copy')}
                                style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <Share2 size={16} /> Share
                            </button>
                            <button
                                onClick={handleDownload}
                                style={{ background: 'var(--surface)', border: 'none', color: isPremium ? '#FFD700' : 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <Download size={16} /> Download
                            </button>
                            <button
                                onClick={handleWatchLater}
                                style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px 12px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}
                            >
                                <Plus size={16} /> Save
                            </button>
                            <button
                                onClick={handleSummarize}
                                disabled={isSummarizing}
                                style={{
                                    background: isPremium ? 'rgba(255, 215, 0, 0.1)' : 'var(--surface)',
                                    border: isPremium ? '1px solid rgba(255, 215, 0, 0.3)' : 'none',
                                    color: isPremium ? '#FFD700' : 'var(--text-muted)',
                                    padding: '8px 12px', borderRadius: '50px',
                                    cursor: isSummarizing ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                                }}
                            >
                                <Sparkles size={16} fill={isPremium ? '#FFD700' : 'none'} className={isSummarizing ? 'spinning' : ''} />
                                {isSummarizing ? 'Summarizing...' : 'AI Summary'}
                            </button>
                            <button
                                onClick={handleStartWatchParty}
                                style={{
                                    background: partyId ? 'var(--primary)' : (isPremium ? 'rgba(255, 69, 0, 0.1)' : 'var(--surface)'),
                                    border: isPremium ? '1px solid rgba(255, 69, 0, 0.3)' : 'none',
                                    color: partyId ? 'black' : (isPremium ? '#FF4500' : 'var(--text-muted)'),
                                    padding: '8px 12px', borderRadius: '50px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                                }}
                            >
                                <Users size={16} /> {partyId ? `Party: ${partyId}` : 'Watch Party'}
                            </button>
                            <button
                                onClick={handleTipCreator}
                                style={{
                                    background: isPremium ? 'rgba(255, 20, 147, 0.1)' : 'var(--surface)',
                                    border: isPremium ? '1px solid rgba(255, 20, 147, 0.3)' : 'none',
                                    color: isPremium ? '#FF1493' : 'var(--text-muted)',
                                    padding: '8px 12px', borderRadius: '50px',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem'
                                }}
                            >
                                <Heart size={16} fill={isPremium ? '#FF1493' : 'none'} /> Tip
                            </button>
                            <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '8px', borderRadius: '50%', cursor: 'pointer' }}><MoreHorizontal size={18} /></button>
                        </div>
                    </div>

                    {summary && (
                        <div className="glass-card" style={{ padding: '20px', marginTop: '15px', border: '1px solid rgba(255, 215, 0, 0.3)', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#FFD700', fontWeight: 'bold' }}>
                                <Sparkles size={18} fill="#FFD700" /> AI Pulse Summary
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem', color: '#f1f1f1' }}>
                                {summary.map((point: string, i: number) => (
                                    <div key={i} style={{ display: 'flex', gap: '10px' }}>
                                        <div style={{ color: '#FFD700', marginTop: '4px' }}>•</div>
                                        <div>{point}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setSummary(null)}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '15px', cursor: 'pointer' }}
                            >
                                Close Summary
                            </button>
                        </div>
                    )}

                    {partyId && partyData && (
                        <div className="glass-card" style={{ padding: '15px', marginTop: '15px', border: '1px solid var(--primary)', animation: 'fadeIn 0.5s ease' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '10px', height: '10px', background: '#00e676', borderRadius: '50%', animation: 'pulse 1s infinite' }} />
                                    <span style={{ fontWeight: 'bold' }}>Active Watch Party</span>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                    {Object.keys(partyData.members || {}).length} members watching
                                </div>
                            </div>
                        </div>
                    )}

                    <div style={{ background: 'var(--surface)', padding: '12px', borderRadius: '12px', marginTop: '15px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{formatCount(viewCount || video.statistics?.viewCount)} views • {new Date(video.snippet.publishedAt).toLocaleDateString()}</div>
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

                {/* Watch Page Sidebar Ad */}
                <div style={{
                    background: 'var(--surface)',
                    padding: '15px',
                    borderRadius: '12px',
                    border: '1px solid var(--glass-border)',
                    marginBottom: '10px'
                }}>
                    <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>ADVERTISEMENT</span>
                    <AdBanner slot="3056171345" format="rectangle" style={{ height: '250px' }} />
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
        </div >
    );
};

export default WatchPage;
