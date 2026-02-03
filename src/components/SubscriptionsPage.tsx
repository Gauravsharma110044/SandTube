import React, { useEffect, useState } from 'react';
import { History as SubIcon } from 'lucide-react';
import { getMySubscriptions, getPopularVideos } from '../services/youtube.ts';
import VideoCard from './VideoCard.tsx';

const SubscriptionsPage: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [videos, setVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchData = async () => {
            if (user?.accessToken) {
                try {
                    const subs = await getMySubscriptions(user.accessToken);
                    setSubscriptions(subs);
                    // For demo/sim, we fetch popular videos as "latest from subs" 
                    // since fetching multiple channel videos individually hits quota hard
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    Latest from Subscriptions
                </h1>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <button style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }}>Manage</button>
                </div>
            </div>

            {!user ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <h2>Sign in to see your subscriptions.</h2>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading subscriptions...</div>
            ) : (
                <>
                    <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', marginBottom: '30px', scrollbarWidth: 'none' }}>
                        {subscriptions.map(sub => (
                            <div key={sub.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '80px', cursor: 'pointer' }}>
                                <img src={sub.snippet.thumbnails.default.url} alt="" style={{ width: '56px', height: '56px', borderRadius: '50%' }} />
                                <span style={{ fontSize: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', whiteSpace: 'nowrap', width: '70px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {sub.snippet.title}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                        {videos.map((video) => (
                            <VideoCard
                                key={video.id}
                                id={video.id}
                                thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                                title={video.snippet.title}
                                channel={video.snippet.channelTitle}
                                views={formatViews(video.statistics?.viewCount)}
                                timestamp={new Date(video.snippet.publishedAt).toLocaleDateString()}
                                channelImage={video.snippet.thumbnails.default.url}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default SubscriptionsPage;
