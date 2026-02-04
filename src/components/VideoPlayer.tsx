import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Zap, Crown, Star, Mic, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BackendAPI from '../services/backend.ts';

interface VideoPlayerProps {
    videoId: string;
    videoUrl?: string; // Optional direct URL for user-uploaded videos
    onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, videoUrl, onEnded }) => {
    const [ambientActive, setAmbientActive] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [highBitrate, setHighBitrate] = useState(false);
    const [studioClear, setStudioClear] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const navigate = useNavigate();
    const playerRef = useRef<any>(null);

    useEffect(() => {
        if (user?.sub) {
            const unsubscribe = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsubscribe();
        }
    }, [user?.sub]);

    const handleJumpToBestPart = () => {
        if (playerRef.current) {
            // Simulate jumping to a "high engagement" part (e.g., 35% into the video)
            const duration = playerRef.current.getDuration();
            playerRef.current.seekTo(duration * 0.35, true);
        }
    };

    const handlePip = async () => {
        const videoElement = document.querySelector('video');
        if (videoElement && document.pictureInPictureEnabled) {
            try {
                if (document.pictureInPictureElement) {
                    await document.exitPictureInPicture();
                } else {
                    await videoElement.requestPictureInPicture();
                }
            } catch (error) {
                console.error("PiP error:", error);
            }
        }
    };

    useEffect(() => {
        if (videoUrl) return; // Don't init YouTube if we have a direct URL

        // Load YouTube Iframe API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        const onPlayerReady = (event: any) => {
            playerRef.current = event.target;
            event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
                if (onEnded) onEnded();
            }
        };

        const initPlayer = () => {
            new (window as any).YT.Player(`youtube-player-${videoId}`, {
                videoId: videoId,
                playerVars: {
                    autoplay: 1,
                    modestbranding: 1,
                    rel: 0,
                    origin: window.location.origin
                },
                events: {
                    onReady: onPlayerReady,
                    onStateChange: onPlayerStateChange,
                },
            });
        };

        if ((window as any).YT && (window as any).YT.Player) {
            initPlayer();
        } else {
            (window as any).onYouTubeIframeAPIReady = initPlayer;
        }

        return () => {
            if (playerRef.current) {
                playerRef.current.destroy();
                playerRef.current = null;
            }
        };
    }, [videoId, videoUrl, onEnded]);

    return (
        <div style={{ position: 'relative', width: '100%', borderRadius: '16px' }}>
            {/* Ambient Background Glow */}
            {ambientActive && (
                <div style={{
                    position: 'absolute',
                    top: '-5%',
                    left: '-5%',
                    width: '110%',
                    height: '110%',
                    background: `url(${videoUrl ? '' : `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`})`,
                    backgroundColor: videoUrl ? '#111' : 'transparent',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(80px) saturate(2) brightness(0.6)',
                    opacity: 0.6,
                    zIndex: -1,
                    borderRadius: '40px',
                    transition: 'all 0.8s ease'
                }} />
            )}

            <div
                className="video-player-container"
                style={{
                    width: '100%',
                    aspectRatio: '16/9',
                    background: '#000',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 20px 80px rgba(0,0,0,0.8)',
                    zIndex: 1
                }}
            >
                {videoUrl ? (
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        onEnded={onEnded}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                ) : (
                    <div id={`youtube-player-${videoId}`} style={{ width: '100%', height: '100%' }}></div>
                )}
            </div>

            {/* Controls Overlay */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', padding: '0 5px' }}>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <span
                        onClick={() => setAmbientActive(!ambientActive)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: ambientActive ? 'var(--primary)' : 'var(--text-muted)', transition: '0.3s' }}
                    >
                        <div style={{ width: '34px', height: '18px', background: ambientActive ? 'rgba(255, 61, 0, 0.2)' : 'rgba(255,255,255,0.05)', borderRadius: '10px', position: 'relative', border: `1px solid ${ambientActive ? 'var(--primary)' : 'var(--glass-border)'}` }}>
                            <div style={{ width: '10px', height: '10px', background: ambientActive ? 'var(--primary)' : 'white', borderRadius: '50%', position: 'absolute', top: '3px', left: ambientActive ? '19px' : '3px', transition: '0.3s' }} />
                        </div>
                        Ambient Mode
                    </span>

                    {isPremium && (
                        <span
                            onClick={() => setHighBitrate(!highBitrate)}
                            style={{
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '0.85rem', color: highBitrate ? '#FFD700' : 'var(--text-muted)', transition: '0.3s'
                            }}
                            title="1080p Premium (Enhanced Bitrate)"
                        >
                            <Zap size={16} fill={highBitrate ? '#FFD700' : 'none'} />
                            Enhanced Quality
                        </span>
                    )}

                    {isPremium && (
                        <span
                            onClick={handleJumpToBestPart}
                            style={{
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '0.85rem', color: '#FFD700', transition: '0.3s'
                            }}
                            title="Jump to most rewatched part"
                        >
                            <Star size={16} fill="#FFD700" />
                            Best Part
                        </span>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <button
                        onClick={handlePip}
                        style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem' }}
                        title="Picture in Picture"
                    >
                        <Maximize size={16} /> PiP
                    </button>
                    {isPremium && (
                        <button
                            onClick={() => setStudioClear(!studioClear)}
                            style={{
                                background: 'none', border: 'none',
                                color: studioClear ? '#FFD700' : 'var(--text-muted)',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem',
                                transition: '0.3s'
                            }}
                            title="Enhance vocals and remove background noise"
                        >
                            {studioClear ? <Mic size={16} fill="#FFD700" /> : <Volume2 size={16} />}
                            Studio Clear
                        </button>
                    )}
                    {isPremium ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#FFD700', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            <Crown size={14} /> Premium active
                        </div>
                    ) : (
                        <div
                            onClick={() => navigate('/premium')}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)', fontSize: '0.8rem', cursor: 'pointer' }}
                        >
                            <Crown size={14} /> Get Premium
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
