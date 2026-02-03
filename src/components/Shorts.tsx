import React, { useEffect, useState, useRef } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getShorts } from '../services/youtube.ts';

const Shorts: React.FC = () => {
    const [shorts, setShorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchShorts = async () => {
            setLoading(true);
            try {
                const fetchedShorts = await getShorts();
                setShorts(fetchedShorts);
            } catch (error) {
                console.error("Error fetching shorts:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchShorts();
    }, []);

    const formatCount = (count: string) => {
        if (!count) return '0';
        const num = parseInt(count);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return count;
    };

    if (loading) {
        return (
            <div style={{ height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <div style={{ width: isMobile ? '100%' : '380px', height: isMobile ? '100%' : '600px', background: 'var(--surface)', borderRadius: isMobile ? '0' : '20px', animation: 'pulse 1.5s infinite' }} />
                <div style={{ color: 'var(--text-muted)' }}>Curating your daily shorts...</div>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', height: 'calc(100vh - 70px)', background: 'var(--bg-dark)' }}>

            {/* Navigation Overlay */}
            <div style={{ position: 'fixed', top: isMobile ? '80px' : '90px', left: isMobile ? '20px' : '260px', zIndex: 100, display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={() => navigate(-1)} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                    <ArrowLeft size={24} />
                </button>
            </div>

            {/* Mute Toggle */}
            <div style={{ position: 'fixed', top: isMobile ? '80px' : '90px', right: isMobile ? '20px' : '40px', zIndex: 100 }}>
                <button onClick={() => setMuted(!muted)} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', padding: '10px', color: 'white', cursor: 'pointer', backdropFilter: 'blur(10px)' }}>
                    {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </button>
            </div>

            <div
                ref={containerRef}
                style={{
                    height: '100%',
                    overflowY: 'auto',
                    scrollSnapType: 'y mandatory',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: isMobile ? '0' : '20px 0'
                }}
            >
                {shorts.map((short, index) => (
                    <div
                        key={short.id.videoId || index}
                        style={{
                            display: 'flex',
                            gap: isMobile ? '0' : '20px',
                            scrollSnapAlign: 'center',
                            height: isMobile ? 'calc(100vh - 70px)' : 'calc(100vh - 110px)',
                            minHeight: isMobile ? 'unset' : '600px',
                            marginBottom: isMobile ? '0' : '40px',
                            position: 'relative',
                            width: isMobile ? '100%' : 'auto'
                        }}
                    >
                        {/* Video Player Container */}
                        <div style={{
                            width: isMobile ? '100vw' : '380px',
                            height: '100%',
                            background: '#000',
                            borderRadius: isMobile ? '0' : '16px',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: isMobile ? 'none' : '0 20px 40px rgba(0,0,0,0.4)',
                            border: isMobile ? 'none' : '1px solid var(--glass-border)'
                        }}>
                            <iframe
                                width="100%"
                                height="100%"
                                src={`https://www.youtube.com/embed/${short.id.videoId}?autoplay=1&loop=1&controls=0&modestbranding=1&mute=${muted ? 1 : 0}&playlist=${short.id.videoId}`}
                                title={short.snippet.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', pointerEvents: 'none' }}
                            ></iframe>

                            {/* Content Info Overlay */}
                            <div style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                padding: isMobile ? '80px 20px 20px' : '60px 20px 20px',
                                background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, transparent 100%)',
                                pointerEvents: 'none',
                                zIndex: 10
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', pointerEvents: 'auto' }}>
                                    <div
                                        onClick={() => navigate(`/channel/${short.snippet.channelId}`)}
                                        style={{ width: '36px', height: '36px', borderRadius: '50%', border: '2px solid white', overflow: 'hidden', cursor: 'pointer' }}
                                    >
                                        <img src={short.snippet.thumbnails.default.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                    <span
                                        onClick={() => navigate(`/channel/${short.snippet.channelId}`)}
                                        style={{ fontWeight: 'bold', color: 'white', cursor: 'pointer', fontSize: '0.9rem' }}
                                    >
                                        @{(short.snippet.channelTitle || '').replace(/\s+/g, '').toLowerCase()}
                                    </span>
                                    <button style={{ background: 'var(--primary)', color: 'black', border: 'none', padding: '5px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer' }}>
                                        Subscribe
                                    </button>
                                </div>

                                <h3 style={{ fontSize: '0.95rem', fontWeight: '500', marginBottom: '10px', color: 'white', pointerEvents: 'auto', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {short.snippet.title}
                                </h3>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.15)', padding: '5px 12px', borderRadius: '50px', width: 'fit-content', pointerEvents: 'auto', backdropFilter: 'blur(5px)' }}>
                                    <Music size={12} color="white" />
                                    <span style={{ fontSize: '0.75rem', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                                        {short.snippet.channelTitle} • Original Audio
                                    </span>
                                </div>
                            </div>

                            {/* Click to Toggle Mute/Play Area */}
                            <div
                                onClick={() => setMuted(!muted)}
                                style={{ position: 'absolute', inset: 0, cursor: 'pointer', zIndex: 5 }}
                            />

                            {/* Mobile Integrated Engagement Bar */}
                            {isMobile && (
                                <div style={{ position: 'absolute', right: '12px', bottom: '100px', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 20, alignItems: 'center' }}>
                                    <div style={{ textAlign: 'center', color: 'white' }}>
                                        <ThumbsUp size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold' }}>{formatCount(short.statistics?.likeCount)}</div>
                                    </div>
                                    <div style={{ textAlign: 'center', color: 'white' }}>
                                        <ThumbsDown size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold' }}>Dislike</div>
                                    </div>
                                    <div style={{ textAlign: 'center', color: 'white' }}>
                                        <MessageSquare size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold' }}>{formatCount(short.statistics?.commentCount)}</div>
                                    </div>
                                    <div style={{ textAlign: 'center', color: 'white' }}>
                                        <Share2 size={28} style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                                        <div style={{ fontSize: '0.7rem', marginTop: '4px', fontWeight: 'bold' }}>Share</div>
                                    </div>
                                    <MoreVertical size={24} color="white" />
                                </div>
                            )}
                        </div>

                        {/* Desktop Engagement Bar */}
                        {!isMobile && (
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '25px', paddingBottom: '20px' }}>
                                <div className="engagement-item" style={{ textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)', marginBottom: '6px', transition: 'background 0.2s' }}>
                                        <ThumbsUp size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>{formatCount(short.statistics?.likeCount)}</span>
                                </div>

                                <div className="engagement-item" style={{ textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)', marginBottom: '6px' }}>
                                        <ThumbsDown size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>Dislike</span>
                                </div>

                                <div className="engagement-item" style={{ textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)', marginBottom: '6px' }}>
                                        <MessageSquare size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>{formatCount(short.statistics?.commentCount)}</span>
                                </div>

                                <div className="engagement-item" style={{ textAlign: 'center' }}>
                                    <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)', marginBottom: '6px' }}>
                                        <Share2 size={24} />
                                    </div>
                                    <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: '600' }}>Share</span>
                                </div>

                                <div style={{ background: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '50%', cursor: 'pointer', color: 'white', backdropFilter: 'blur(10px)' }}>
                                    <MoreVertical size={24} />
                                </div>

                                <div style={{ width: '45px', height: '45px', borderRadius: '10px', background: 'var(--surface)', border: '2px solid rgba(255,255,255,0.5)', overflow: 'hidden', padding: '2px', cursor: 'pointer' }}>
                                    <img src={short.snippet.thumbnails.default.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <style>{`
                ::-webkit-scrollbar { display: none; }
                .engagement-item div:hover {
                    background: rgba(255,255,255,0.2) !important;
                }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default Shorts;
