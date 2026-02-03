import React, { useEffect, useState } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music } from 'lucide-react';
import { getShorts } from '../services/youtube.ts';

const Shorts: React.FC = () => {
    const [shorts, setShorts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return <div style={{ color: 'white', textAlign: 'center', marginTop: '50px' }}>Loading Shorts...</div>;
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            height: 'calc(100vh - 110px)',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            padding: '20px 0',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            {shorts.map(short => (
                <div key={short.id.videoId} style={{
                    display: 'flex',
                    gap: '20px',
                    scrollSnapAlign: 'start',
                    height: '80vh',
                    minHeight: '600px'
                }}>
                    <div style={{
                        width: '380px',
                        height: '100%',
                        background: '#000',
                        borderRadius: '20px',
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                        border: '1px solid var(--glass-border)'
                    }}>
                        <iframe
                            width="100%"
                            height="100%"
                            src={`https://www.youtube.com/embed/${short.id.videoId}?autoplay=0&loop=1&controls=0&modestbranding=1`}
                            title={short.snippet.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                        ></iframe>

                        <div style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            padding: '40px 20px 20px',
                            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)',
                            pointerEvents: 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', pointerEvents: 'auto' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white', overflow: 'hidden' }}>
                                    <img src={short.snippet.thumbnails.default.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>{short.snippet.channelTitle}</span>
                                <button style={{ background: 'white', color: 'black', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', cursor: 'pointer' }}>Subscribe</button>
                            </div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px', color: 'white', pointerEvents: 'auto' }}>{short.snippet.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: 'white', pointerEvents: 'auto' }}>
                                <Music size={14} /> <span>Original Audio - {short.snippet.channelTitle}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><ThumbsUp size={24} /></div>
                            <span style={{ fontSize: '0.8rem', color: 'white' }}>Like</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><ThumbsDown size={24} /></div>
                            <span style={{ fontSize: '0.8rem', color: 'white' }}>Dislike</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><MessageSquare size={24} /></div>
                            <span style={{ fontSize: '0.8rem', color: 'white' }}>Comm</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><Share2 size={24} /></div>
                            <span style={{ fontSize: '0.8rem', color: 'white' }}>Share</span>
                        </div>
                        <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer', color: 'white' }}><MoreVertical size={24} /></div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'var(--primary)', border: '2px solid white', overflow: 'hidden' }}>
                            <img src={short.snippet.thumbnails.default.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shorts;
