import React, { useState, useEffect } from 'react';

interface VideoPlayerProps {
    videoId: string;
    onEnded?: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoId, onEnded }) => {
    const [ambientActive, setAmbientActive] = useState(true);

    useEffect(() => {
        // Load YouTube Iframe API
        if (!(window as any).YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
        }

        let player: any;

        const onPlayerReady = (event: any) => {
            event.target.playVideo();
        };

        const onPlayerStateChange = (event: any) => {
            if (event.data === (window as any).YT.PlayerState.ENDED) {
                if (onEnded) onEnded();
            }
        };

        const initPlayer = () => {
            player = new (window as any).YT.Player(`youtube-player-${videoId}`, {
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
            if (player) {
                player.destroy();
            }
        };
    }, [videoId]);

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
                    background: `url(https://img.youtube.com/vi/${videoId}/maxresdefault.jpg)`,
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
                <div id={`youtube-player-${videoId}`} style={{ width: '100%', height: '100%' }}></div>
            </div>

            {/* Controls Overlay (Theatre/Ambient toggles can be added here) */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <span
                    onClick={() => setAmbientActive(!ambientActive)}
                    style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                    <div style={{ width: '30px', height: '14px', background: ambientActive ? 'var(--primary)' : '#444', borderRadius: '10px', position: 'relative', transition: '0.3s' }}>
                        <div style={{ width: '10px', height: '10px', background: 'white', borderRadius: '50%', position: 'absolute', top: '2px', left: ambientActive ? '18px' : '2px', transition: '0.3s' }} />
                    </div>
                    Ambient Mode
                </span>
            </div>
        </div>
    );
};

export default VideoPlayer;
