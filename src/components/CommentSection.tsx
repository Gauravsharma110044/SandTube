import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, MessageSquare, MoreVertical, User } from 'lucide-react';
import { getVideoComments } from '../services/youtube.ts';

interface CommentSectionProps {
    videoId: string | undefined;
}

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        const fetchComments = async () => {
            if (!videoId) return;
            setLoading(true);
            try {
                const fetchedComments = await getVideoComments(videoId);
                setComments(fetchedComments);
            } catch (error) {
                console.error("Error fetching comments:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [videoId]);

    const formatLikes = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
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
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>{comments.length} Comments</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <MoreVertical size={16} /> Sort by
                </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={20} color="#0a0a0a" />
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--glass-border)', padding: '8px 0', color: 'white', outline: 'none', marginBottom: '10px' }}
                    />
                    {newComment && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button onClick={() => setNewComment('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px 15px' }}>Cancel</button>
                            <button className="button-primary" style={{ padding: '8px 20px' }}>Comment</button>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {loading ? (
                    <p style={{ color: 'var(--text-muted)' }}>Loading comments...</p>
                ) : (
                    comments.map(thread => {
                        const comment = thread.snippet.topLevelComment.snippet;
                        return (
                            <div key={thread.id} style={{ display: 'flex', gap: '15px' }}>
                                <img
                                    src={comment.authorProfileImageUrl}
                                    alt={comment.authorDisplayName}
                                    onClick={() => navigate(`/channel/${comment.authorChannelId.value}`)}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                        <span
                                            onClick={() => navigate(`/channel/${comment.authorChannelId.value}`)}
                                            style={{ fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}
                                        >
                                            {comment.authorDisplayName}
                                        </span>
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{getTimeAgo(comment.publishedAt)}</span>
                                    </div>
                                    <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }} dangerouslySetInnerHTML={{ __html: comment.textDisplay }} />
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <ThumbsUp size={16} /> <span style={{ fontSize: '0.8rem' }}>{formatLikes(comment.likeCount)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                            <MessageSquare size={16} /> <span style={{ fontSize: '0.8rem' }}>Reply</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default CommentSection;
