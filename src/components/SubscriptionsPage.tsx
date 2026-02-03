import React, { useEffect, useState } from 'react';
import { LayoutGrid, List, Bell } from 'lucide-react';
import { getMySubscriptions, getPopularVideos } from '../services/youtube.ts';
import { useNavigate } from 'react-router-dom';
import VideoCard from './VideoCard.tsx';

const SubscriptionsPage: React.FC = () => {
    const navigate = useNavigate();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewType, setViewType] = useState<'grid' | 'list'>('grid');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchData = async () => {
            if (user?.accessToken) {
                try {
                    const subs = await getMySubscriptions(user.accessToken);
                    setSubscriptions(subs);
                    // Fetch popular as a fallback for "latest from subs"
                    const popular = await getPopularVideos();
                    setVideos(popular);
                } catch (error) {
                    console.error("Error fetching subscriptions data:", error);
                }
            }
            setLoading(false);
        };
        fetchData();
    }, [user?.accessToken]);

    const formatViews = (views: string) => {
        if (!views) return 'N/A';
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return views;
    };

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '20px' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Latest</h1>
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}>Manage</button>
                    <div style={{ display: 'flex', background: 'var(--surface)', borderRadius: '10px', padding: '4px' }}>
                        <button
                            onClick={() => setViewType('grid')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewType === 'grid' ? 'var(--surface-hover)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <LayoutGrid size={20} />
                        </button>
                        <button
                            onClick={() => setViewType('list')}
                            style={{ padding: '8px', borderRadius: '8px', background: viewType === 'list' ? 'var(--surface-hover)' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}
                        >
                            <List size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {!user ? (
                <div style={{ textAlign: 'center', padding: '100px 0', border: '2px dashed var(--glass-border)', borderRadius: '24px' }}>
                    <Bell size={64} style={{ marginBottom: '20px', color: 'var(--primary)' }} />
                    <h2>Don't miss a thing</h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Sign in to see updates from your favorite YouTube channels</p>
                    <button className="button-primary" style={{ padding: '12px 30px' }}>Sign In</button>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>Creating your personal feed...</div>
            ) : (
                <>
                    {/* Subscription Avatars Horizontal Bar */}
                    <div style={{ display: 'flex', gap: '25px', overflowX: 'auto', paddingBottom: '30px', marginBottom: '40px', scrollbarWidth: 'none' }}>
                        {subscriptions.map(sub => (
                            <div
                                key={sub.id}
                                onClick={() => navigate(`/channel/${sub.snippet.resourceId.channelId}`)}
                                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', minWidth: '90px', cursor: 'pointer', transition: 'transform 0.2s' }}
                                className="sub-avatar"
                            >
                                <div style={{ position: 'relative' }}>
                                    <img src={sub.snippet.thumbnails.default.url} alt="" style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid transparent', padding: '2px' }} className="avatar-img" />
                                    <div style={{ position: 'absolute', bottom: '2px', right: '2px', width: '12px', height: '12px', background: '#3ea6ff', borderRadius: '50%', border: '2px solid var(--bg-dark)' }} />
                                </div>
                                <span style={{ fontSize: '0.8rem', textAlign: 'center', color: 'white', whiteSpace: 'nowrap', width: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {sub.snippet.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        display: viewType === 'grid' ? 'grid' : 'flex',
                        flexDirection: viewType === 'grid' ? 'unset' : 'column',
                        gridTemplateColumns: viewType === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'unset',
                        gap: '30px'
                    }}>
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                id={video.id}
                                thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                title={video.snippet.title}
                                channel={video.snippet.channelTitle}
                                channelId={video.snippet.channelId}
                                views={formatViews(video.statistics?.viewCount)}
                                timestamp={new Date(video.snippet.publishedAt).toLocaleDateString()}
                                channelImage={video.snippet.thumbnails.default.url}
                            />
                        ))}
                    </div>
                </>
            )}

            <style>{`
                .sub-avatar:hover .avatar-img {
                    border-color: var(--primary) !important;
                }
                .sub-avatar:hover {
                    transform: translateY(-5px);
                }
            `}</style>
        </div>
    );
};

export default SubscriptionsPage;
