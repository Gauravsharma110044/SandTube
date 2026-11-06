import React, { useEffect, useRef, useState } from 'react';
import { ThumbsUp, MessageSquare, Volume2, VolumeX, Music } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getShorts } from '../services/youtube.ts';

const formatCount = (count?: string) => {
    if (!count) return '';
    const num = parseInt(count);
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return String(num);
};

const Shorts: React.FC = () => {
    const [shorts, setShorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [muted, setMuted] = useState(true);
    const [active, setActive] = useState(0);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const navigate = useNavigate();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const f = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', f);
        return () => window.removeEventListener('resize', f);
    }, []);

    useEffect(() => {
        getShorts().then(setShorts).catch(() => setShorts([])).finally(() => setLoading(false));
    }, []);

    const onScroll = () => {
        const c = containerRef.current;
        if (!c || !c.clientHeight) return;
        const i = Math.round(c.scrollTop / c.clientHeight);
        if (i !== active) setActive(i);
    };

    const viewH = isMobile ? 'calc(100dvh - 130px)' : 'calc(100dvh - 70px)';

    if (loading) {
        return <div style={{ height: viewH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading shorts...</div>;
    }
    if (shorts.length === 0) {
        return <div style={{ height: viewH, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Could not load shorts right now.</div>;
    }

    return (
        <div style={{ position: 'relative', height: viewH, background: 'var(--bg-dark)' }}>
            <button
                onClick={() => setMuted(!muted)}
                aria-label={muted ? 'Unmute' : 'Mute'}
                style={{ position: 'absolute', top: 12, right: isMobile ? 12 : 'calc(50% - 190px)', zIndex: 30, background: 'rgba(0,0,0,0.55)', border: 'none', borderRadius: '50%', padding: 10, color: 'white', cursor: 'pointer' }}
            >
                {muted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>
            <div
                ref={containerRef}
                onScroll={onScroll}
                style={{ height: '100%', overflowY: 'auto', scrollSnapType: 'y mandatory', scrollbarWidth: 'none' }}
            >
                {shorts.map((short, index) => {
                    const id = short.id.videoId;
                    const near = Math.abs(index - active) <= 0;
                    return (
                        <div key={id} style={{ height: '100%', scrollSnapAlign: 'start', scrollSnapStop: 'always', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? 0 : '12px 0', boxSizing: 'border-box' }}>
                            <div style={{ position: 'relative', height: '100%', aspectRatio: '9 / 16', maxWidth: '100%', background: '#000', borderRadius: isMobile ? 0 : 16, overflow: 'hidden' }}>
                                {near ? (
                                    <iframe
                                        title={short.snippet.title}
                                        src={`https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&controls=0&modestbranding=1&playsinline=1&rel=0&mute=${muted ? 1 : 0}`}
                                        allow="autoplay; encrypted-media; picture-in-picture"
                                        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none' }}
                                    />
                                ) : (
                                    <img src={short.snippet.thumbnails?.high?.url || short.snippet.thumbnails?.medium?.url} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }} />
                                )}
                                <a href={`https://www.youtube.com/shorts/${id}`} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', top: 10, right: 10, zIndex: 30, color: 'white', background: 'rgba(0,0,0,0.55)', padding: '4px 10px', borderRadius: 14, fontSize: '0.72rem', textDecoration: 'none' }}>Open on YouTube</a>
                                <div style={{ position: 'absolute', left: 0, right: 56, bottom: 0, padding: '40px 14px 14px', background: 'linear-gradient(to top, rgba(0,0,0,0.85), transparent)', pointerEvents: 'none', zIndex: 10 }}>
                                    <div
                                        onClick={() => navigate(`/channel/${short.snippet.channelId}`)}
                                        style={{ pointerEvents: 'auto', color: 'white', fontWeight: 700, fontSize: '0.9rem', marginBottom: 6, cursor: 'pointer' }}
                                    >
                                        @{(short.snippet.channelTitle || '').replace(/\s+/g, '').toLowerCase()}
                                    </div>
                                    <div style={{ color: 'white', fontSize: '0.9rem', lineHeight: 1.3, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{short.snippet.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, color: 'white', fontSize: '0.75rem', opacity: 0.85 }}>
                                        <Music size={12} /> {short.snippet.channelTitle}
                                    </div>
                                </div>
                                <div style={{ position: 'absolute', right: 8, bottom: 60, display: 'flex', flexDirection: 'column', gap: 18, zIndex: 20, color: 'white', textAlign: 'center', fontSize: '0.7rem', pointerEvents: 'none' }}>
                                    {short.statistics?.likeCount && (<div><ThumbsUp size={26} /><div>{formatCount(short.statistics.likeCount)}</div></div>)}
                                    {short.statistics?.commentCount && (<div><MessageSquare size={26} /><div>{formatCount(short.statistics.commentCount)}</div></div>)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Shorts;
