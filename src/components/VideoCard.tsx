import { MoreVertical, Maximize2, ListPlus, Download, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BackendAPI from '../services/backend.ts';

interface VideoCardProps {
    id: string;
    thumbnail: string;
    title: string;
    channel: string;
    channelId?: string;
    views: string;
    timestamp: string;
    channelImage: string;
    horizontal?: boolean;
}

const VideoCard: React.FC<VideoCardProps> = ({ id, thumbnail, title, channel, channelId, views, timestamp, channelImage, horizontal = false }) => {
    const navigate = useNavigate();
    const [isPremium, setIsPremium] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user?.sub) {
            const unsubscribe = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsubscribe();
        }
    }, [user?.sub]);

    const handleChannelClick = (e: React.MouseEvent) => {
        if (channelId) {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/channel/${channelId}`);
        }
    };

    const handleAddToQueue = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPremium) {
            if (window.confirm('Queue is a Premium feature. Want to upgrade?')) navigate('/premium');
            return;
        }
        // Simulated queue
        window.dispatchEvent(new CustomEvent('addToQueue', { detail: { id, title, thumbnail } }));
    };

    const handleDownload = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPremium) {
            if (window.confirm('Downloads are a Premium feature. Want to upgrade?')) navigate('/premium');
            return;
        }
        BackendAPI.saveOfflineVideo(user.sub, { id, snippet: { thumbnails: { high: { url: thumbnail } }, title, channelTitle: channel, channelId, publishedAt: timestamp }, statistics: { viewCount: views } });
    };

    return (
        <div
            className={`video-card ${horizontal ? 'horizontal' : ''}`}
            onClick={() => navigate(`/watch/${id}`)}
            style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: horizontal ? 'row' : 'column',
                gap: '12px',
                width: '100%',
                marginBottom: horizontal ? '4px' : '0'
            }}
        >
            <div style={{
                position: 'relative',
                width: horizontal ? (window.innerWidth <= 480 ? '120px' : '160px') : '100%',
                flexShrink: 0,
                aspectRatio: '16/9',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                <img
                    src={thumbnail}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '1px 4px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                }}>
                    12:45
                </div>
                {!horizontal && (
                    <div className="card-actions-overlay" style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        zIndex: 10
                    }}>
                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.dispatchEvent(new CustomEvent('setMiniPlayer', { detail: id }));
                            }}
                            className="overlay-btn"
                            title="Play in Mini Player"
                        >
                            <Maximize2 size={16} />
                        </button>
                        <button
                            onClick={handleAddToQueue}
                            className="overlay-btn"
                            style={{ color: isPremium ? '#FFD700' : 'white' }}
                            title="Add to queue"
                        >
                            <ListPlus size={16} />
                        </button>
                        <button
                            onClick={handleDownload}
                            className="overlay-btn"
                            style={{ color: isPremium ? '#FFD700' : 'white' }}
                            title="Download"
                        >
                            <Download size={16} />
                        </button>
                    </div>
                )}
                {isPremium && !horizontal && (
                    <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,0,0,0.6)', padding: '4px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Crown size={10} color="#FFD700" />
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', gap: horizontal ? '0' : '12px', flex: 1 }}>
                {!horizontal && (
                    <img
                        src={channelImage}
                        alt={channel}
                        onClick={handleChannelClick}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                )}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <h3 style={{
                        fontSize: horizontal ? '0.9rem' : '1rem',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4',
                        fontWeight: '600',
                        color: 'white',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {title}
                    </h3>
                    <div style={{ fontSize: horizontal ? '0.8rem' : '0.9rem', color: 'var(--text-muted)' }}>
                        <div
                            onClick={handleChannelClick}
                            style={{ transition: 'color 0.2s', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                            {channel}
                        </div>
                        <div>{views && `${views} views • `}{timestamp}</div>
                    </div>
                </div>
                {!horizontal && (
                    <button style={{ background: 'none', border: 'none', color: 'white', alignSelf: 'flex-start', padding: '4px', cursor: 'pointer' }}>
                        <MoreVertical size={18} />
                    </button>
                )}
            </div>

            <style>{`
                .video-card:hover .card-actions-overlay {
                    opacity: 1 !important;
                }
                .overlay-btn {
                    background: rgba(0,0,0,0.8);
                    border: none;
                    color: white;
                    padding: 8px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justifyContent: center;
                    transition: all 0.2s;
                    backdrop-filter: blur(5px);
                }
                .overlay-btn:hover {
                    background: var(--primary) !important;
                    color: white !important;
                    transform: scale(1.1);
                }
                .video-card.horizontal:hover h3 {
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default VideoCard;
