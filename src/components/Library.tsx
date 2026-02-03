import React from 'react';
import { History, PlaySquare, Clock, ThumbsUp, ListVideo } from 'lucide-react';
import VideoCard from './VideoCard.tsx';

const Library: React.FC = () => {
    const listItems = [
        { icon: <History />, label: 'History', count: '200+ videos' },
        { icon: <PlaySquare />, label: 'Your videos', count: '12 videos' },
        { icon: <Clock />, label: 'Watch later', count: '45 videos' },
        { icon: <ThumbsUp />, label: 'Liked videos', count: '1.2K videos' }
    ];

    return (
        <div style={{ animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px', marginBottom: '50px' }}>
                {listItems.map((item, i) => (
                    <div key={i} className="glass-morphism" style={{ padding: '25px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '15px', cursor: 'pointer', transition: 'transform 0.2s' }}>
                        <div style={{ color: 'var(--primary)' }}>{item.icon}</div>
                        <div>
                            <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{item.label}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.count}</div>
                        </div>
                    </div>
                ))}
            </div>

            <section style={{ marginBottom: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><History size={24} /> Recent History</h2>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>See all</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {/* Reuse Mock Data Strategy */}
                    {[1, 2, 3, 4].map(i => (
                        <VideoCard
                            key={i}
                            id={`history-${i}`}
                            thumbnail="https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&q=80&w=800"
                            title={`History Video ${i} - Modern Architecture`}
                            channel="Design Studio"
                            views="500K"
                            timestamp="2 hours ago"
                            channelImage="https://i.pravatar.cc/150?u=library"
                        />
                    ))}
                </div>
            </section>

            <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '10px' }}><ListVideo size={24} /> Playlists</h2>
                    <span style={{ color: 'var(--primary)', fontSize: '0.9rem', cursor: 'pointer' }}>See all</span>
                </div>
                <div className="glass-morphism" style={{ padding: '40px', borderRadius: '20px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-muted)' }}>You haven't created any playlists yet.</p>
                    <button className="button-primary" style={{ marginTop: '10px' }}>Create Playlist</button>
                </div>
            </section>
        </div>
    );
};

export default Library;
