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
}

const VideoCard: React.FC<VideoCardProps> = ({ id, thumbnail, title, channel, channelId, views, timestamp, channelImage }) => {
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
            className="video-card"
            onClick={() => navigate(`/watch/${id}`)}
            style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '12px', overflow: 'hidden' }}>
                <img
                    src={thumbnail}
                    alt={title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '0.8rem',
                    fontWeight: '500'
                }}>
                    12:45
                </div>
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
                <style>{`
                    .video-card:hover .mini-player-btn {
                        opacity: 1 !important;
                    }
                `}</style>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
                <img
                    src={channelImage}
                    alt={channel}
                    onClick={handleChannelClick}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ flex: 1 }}>
                    <h3 style={{
                        fontSize: '1rem',
                        margin: '0 0 4px 0',
                        lineHeight: '1.4',
                        fontWeight: '600',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                    }}>
                        {title}
                    </h3>
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div
                            onClick={handleChannelClick}
                            style={{ transition: 'color 0.2s' }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                            {channel}
                        </div>
                        <div>{views} views • {timestamp}</div>
                    </div>
                </div>
                <button style={{ background: 'none', border: 'none', color: 'white', alignSelf: 'flex-start', padding: '4px', cursor: 'pointer' }}>
                    <MoreVertical size={18} />
                </button>
            </div>
        </div>
    );
};

export default VideoCard;
