import React from 'react';
import { MoreVertical, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

    const handleChannelClick = (e: React.MouseEvent) => {
        if (channelId) {
            e.preventDefault();
            e.stopPropagation();
            navigate(`/channel/${channelId}`);
        }
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
                    <div
                        className="mini-player-btn"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.dispatchEvent(new CustomEvent('setMiniPlayer', { detail: id }));
                        }}
                        style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            background: 'rgba(0,0,0,0.6)',
                            padding: '8px',
                            borderRadius: '50%',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 5
                        }}
                        title="Play in Mini Player"
                    >
                        <Maximize2 size={18} />
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
                .video-card:hover .mini-player-btn {
                    opacity: 1 !important;
                }
                .video-card.horizontal:hover h3 {
                    color: var(--primary) !important;
                }
            `}</style>
        </div>
    );
};

export default VideoCard;
