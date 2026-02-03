import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getChannelDetails, getChannelVideos } from '../services/youtube.ts';
import VideoCard from './VideoCard.tsx';
import { Search, Bell, ChevronDown, Share2, Info, Youtube } from 'lucide-react';

const ChannelPage: React.FC = () => {
    const { channelId } = useParams<{ channelId: string }>();
    const [channel, setChannel] = useState<any>(null);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Home');

    useEffect(() => {
        const fetchChannelData = async () => {
            if (!channelId) return;
            setLoading(true);
            try {
                const [details, channelVideos] = await Promise.all([
                    getChannelDetails(channelId),
                    getChannelVideos(channelId)
                ]);
                setChannel(details);
                setVideos(channelVideos);
            } catch (error) {
                console.error("Error fetching channel data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchChannelData();
    }, [channelId]);

    const formatCount = (count: string) => {
        if (!count) return '0';
        const num = parseInt(count);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return count;
    };

    if (loading) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }} className="glass-morphism">Loading Channel Engine...</div>;
    if (!channel) return <div style={{ color: 'white', textAlign: 'center', marginTop: '100px' }}>Channel not found.</div>;

    const bannerUrl = channel.brandingSettings?.image?.bannerExternalUrl || "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format&fit=crop&q=80&w=2600";

    return (
        <div style={{ animation: 'fadeIn 0.5s ease', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Channel Banner */}
            <div style={{
                width: '100%',
                height: '240px',
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'var(--surface)',
                marginBottom: '30px',
                position: 'relative'
            }}>
                <img
                    src={bannerUrl}
                    alt="Banner"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Channel Info Header */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', padding: '0 40px', marginBottom: '40px' }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={channel.snippet.thumbnails.high.url}
                        alt={channel.snippet.title}
                        style={{ width: '180px', height: '180px', borderRadius: '50%', border: '6px solid var(--bg-dark)', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}
                    />
                </div>
                <div style={{ flex: 1, paddingTop: '10px' }}>
                    <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        {channel.snippet.title}
                        {parseInt(channel.statistics.subscriberCount) > 100000 && <div title="Verified" style={{ width: '24px', height: '24px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', color: 'black' }}>✓</div>}
                    </h1>
                    <div style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '20px', display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <span style={{ color: 'white', fontWeight: 'bold' }}>{channel.snippet.customUrl}</span>
                        <span>•</span>
                        <span>{formatCount(channel.statistics.subscriberCount)} subscribers</span>
                        <span>•</span>
                        <span>{formatCount(channel.statistics.videoCount)} videos</span>
                    </div>
                    <p style={{ fontSize: '1rem', color: 'var(--text-muted)', maxWidth: '900px', lineHeight: '1.6', marginBottom: '25px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {channel.snippet.description}
                    </p>
                    <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                        <button className="button-primary" style={{ padding: '12px 35px', borderRadius: '50px', fontSize: '1rem' }}>Subscribe</button>
                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '50px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontWeight: '600' }}>
                            <Bell size={20} /> Subscribed <ChevronDown size={16} />
                        </button>
                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '50px', fontWeight: '600', cursor: 'pointer' }}>Join</button>
                        <div style={{ display: 'flex', gap: '15px', marginLeft: '20px' }}>
                            <Share2 size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                            <Search size={24} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Bar */}
            <div style={{ borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '40px', padding: '0 40px', marginBottom: '40px', position: 'sticky', top: '70px', background: 'var(--bg-dark)', zIndex: 10 }}>
                {['Home', 'Videos', 'Shorts', 'Live', 'Playlists', 'Community', 'About'].map(tab => (
                    <div
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '20px 0',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '600',
                            color: activeTab === tab ? 'white' : 'var(--text-muted)',
                            borderBottom: activeTab === tab ? '3px solid var(--primary)' : '3px solid transparent',
                            transition: 'all 0.2s',
                            whiteSpace: 'nowrap'
                        }}
                    >
                        {tab}
                    </div>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '0 40px 60px' }}>
                {activeTab === 'About' ? (
                    <div className="glass-morphism" style={{ padding: '40px', borderRadius: '24px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '60px' }}>
                        <div>
                            <h2 style={{ marginBottom: '20px' }}>Description</h2>
                            <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-muted)' }}>{channel.snippet.description}</p>

                            <h2 style={{ margin: '40px 0 20px' }}>Details</h2>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <span style={{ color: 'var(--text-muted)', width: '150px' }}>For business inquiries:</span>
                                    <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '5px', cursor: 'pointer' }}>VIEW EMAIL ADDRESS</button>
                                </div>
                                <div style={{ display: 'flex', gap: '20px' }}>
                                    <span style={{ color: 'var(--text-muted)', width: '150px' }}>Location:</span>
                                    <span>{channel.snippet.country || 'Not specified'}</span>
                                </div>
                            </div>
                        </div>
                        <div style={{ borderLeft: '1px solid var(--glass-border)', paddingLeft: '40px' }}>
                            <h3 style={{ marginBottom: '25px' }}>Stats</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Info size={20} style={{ color: 'var(--text-muted)' }} />
                                    <span>Joined {new Date(channel.snippet.publishedAt).toLocaleDateString()}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <Youtube size={20} style={{ color: 'var(--text-muted)' }} />
                                    <span>{parseInt(channel.statistics.viewCount).toLocaleString()} views</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '40px 25px' }}>
                        {videos.map(video => {
                            const videoId = typeof video.id === 'string' ? video.id : video.id.videoId;
                            return (
                                <VideoCard
                                    key={videoId}
                                    id={videoId}
                                    thumbnail={video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url}
                                    title={video.snippet.title}
                                    channel={channel.snippet.title}
                                    channelId={channelId}
                                    views="Recent Upload"
                                    timestamp={new Date(video.snippet.publishedAt).toLocaleDateString()}
                                    channelImage={channel.snippet.thumbnails?.default?.url}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChannelPage;
