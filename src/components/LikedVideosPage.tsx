import React, { useEffect, useState } from 'react';
import { ThumbsUp } from 'lucide-react';
import VideoCard from './VideoCard.tsx';
import { getMyLikedVideos } from '../services/youtube.ts';

const LikedVideosPage: React.FC = () => {
    const [likedVideos, setLikedVideos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchLikes = async () => {
            if (user?.accessToken) {
                try {
                    const liked = await getMyLikedVideos(user.accessToken);
                    setLikedVideos(liked);
                } catch (error) {
                    console.error("Error fetching likes:", error);
                }
            }
            setLoading(false);
        };
        fetchLikes();
    }, [user?.accessToken]);

    const formatViews = (views: string) => {
        if (!views) return 'N/A';
        const num = parseInt(views);
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return views;
    };

    const getTimeAgo = (publishedAt: string) => {
        const date = new Date(publishedAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (days >= 365) return Math.floor(days / 365) + ' years ago';
        if (days >= 30) return Math.floor(days / 30) + ' months ago';
        if (days >= 7) return Math.floor(days / 7) + ' weeks ago';
        if (days > 0) return `${days} days ago`;
        return 'Today';
    };

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ marginBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <ThumbsUp size={32} /> Liked Videos
                </h1>
                {user && <p style={{ color: 'var(--text-muted)' }}>{likedVideos.length} videos</p>}
            </div>

            {!user ? (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <h2>Sign in to see your liked videos.</h2>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>Loading your likes...</div>
            ) : likedVideos.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px' }}>
                    {likedVideos.map((video) => (
                        <VideoCard
                            key={video.id}
                            id={video.id}
                            thumbnail={video.snippet.thumbnails.maxres?.url || video.snippet.thumbnails.high?.url}
                            title={video.snippet.title}
                            channel={video.snippet.channelTitle}
                            views={formatViews(video.statistics?.viewCount)}
                            timestamp={getTimeAgo(video.snippet.publishedAt)}
                            channelImage={video.snippet.thumbnails.default.url}
                        />
                    ))}
                </div>
            ) : (
                <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
                    <h2>No liked videos yet.</h2>
                </div>
            )}
        </div>
    );
};

export default LikedVideosPage;
