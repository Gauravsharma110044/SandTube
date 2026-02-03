import React from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Share2, MoreVertical, Music } from 'lucide-react';

const Shorts: React.FC = () => {
    const shorts = [
        { id: 1, title: 'Satisfying Sand Art #shorts', channel: '@sandartist', views: '1.2M', tint: '#e2b35a' },
        { id: 2, title: 'Fast Coding in 2026', channel: '@codepro', views: '500K', tint: '#4CAF50' },
        { id: 3, title: 'Amazing Desert Sunset', channel: '@traveler', views: '2.1M', tint: '#FF5722' }
    ];

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            height: 'calc(100vh - 110px)',
            overflowY: 'auto',
            scrollSnapType: 'y mandatory',
            padding: '20px 0'
        }}>
            {shorts.map(short => (
                <div key={short.id} style={{
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
                        <div style={{
                            width: '100%',
                            height: '100%',
                            background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.8)), ${short.tint}`,
                            opacity: 0.8
                        }} />
                        <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'white' }} />
                                <span style={{ fontWeight: 'bold' }}>{short.channel}</span>
                                <button style={{ background: 'white', color: 'black', border: 'none', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>Subscribe</button>
                            </div>
                            <h3 style={{ fontSize: '1rem', marginBottom: '10px' }}>{short.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' }}>
                                <Music size={14} /> <span>Original Audio - {short.channel}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '20px', paddingBottom: '20px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}><ThumbsUp size={24} /></div>
                            <span style={{ fontSize: '0.8rem' }}>1.2K</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}><ThumbsDown size={24} /></div>
                            <span style={{ fontSize: '0.8rem' }}>Dislike</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}><MessageSquare size={24} /></div>
                            <span style={{ fontSize: '0.8rem' }}>456</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}><Share2 size={24} /></div>
                            <span style={{ fontSize: '0.8rem' }}>Share</span>
                        </div>
                        <div style={{ background: 'var(--surface)', padding: '15px', borderRadius: '50%', cursor: 'pointer' }}><MoreVertical size={24} /></div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: short.tint, border: '2px solid white' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Shorts;
