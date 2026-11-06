import React, { useState } from 'react';
import VideoCard from './VideoCard.tsx';
import { Clock, Trash2 } from 'lucide-react';
import { getWatchLater, removeFromWatchLater, videoIdOf, formatDuration } from '../services/localLibrary.ts';

const WatchLaterPage: React.FC = () => {
    const [items, setItems] = useState<any[]>(getWatchLater());

    const remove = (id: string) => {
        removeFromWatchLater(id);
        setItems(getWatchLater());
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '6px' }}>Watch later</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '24px' }}>Saved on this device only. Optional cloud backup is in Library.</p>
            {items.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-muted)' }}>
                    <Clock size={64} style={{ opacity: 0.3, marginBottom: '16px' }} />
                    <h2 style={{ color: 'white' }}>Your Watch later list is empty</h2>
                    <p>Open a video and tap "Watch later" to save it here.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {items.map(v => (
                        <div key={videoIdOf(v)} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1 }}>
                                <VideoCard id={videoIdOf(v)} thumbnail={v.snippet.thumbnails?.high?.url} title={v.snippet.title}
                                    channel={v.snippet.channelTitle} views="" timestamp={new Date(v.snippet.publishedAt).toLocaleDateString()}
                                    channelImage="" duration={formatDuration(v.contentDetails?.duration)} horizontal />
                            </div>
                            <button onClick={() => remove(videoIdOf(v))} title="Remove" style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer' }}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WatchLaterPage;
