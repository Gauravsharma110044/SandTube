import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, User, ChevronDown, ChevronUp, MoreVertical, Crown } from 'lucide-react';
import { getVideoComments } from '../services/youtube.ts';
import BackendAPI from '../services/backend.ts';

interface CommentSectionProps {
    videoId: string | undefined;
}

const CommentSection: React.FC<CommentSectionProps> = ({ videoId }) => {
    const navigate = useNavigate();
    const [comments, setComments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [sortBy, setSortBy] = useState<'relevance' | 'time'>('relevance');
    const [expandedReplies, setExpandedReplies] = useState<Record<string, boolean>>({});
    const [isPremium, setIsPremium] = useState(false);

    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user?.sub) {
            const unsubscribe = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsubscribe();
        }
    }, [user?.sub]);

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

    const handleSort = (type: 'relevance' | 'time') => {
        setSortBy(type);
        const sorted = [...comments].sort((a, b) => {
            if (type === 'time') {
                return new Date(b.snippet.topLevelComment.snippet.publishedAt).getTime() -
                    new Date(a.snippet.topLevelComment.snippet.publishedAt).getTime();
            } else {
                return b.snippet.topLevelComment.snippet.likeCount - a.snippet.topLevelComment.snippet.likeCount;
            }
        });
        setComments(sorted);
    };

    const toggleReplies = (threadId: string) => {
        setExpandedReplies(prev => ({ ...prev, [threadId]: !prev[threadId] }));
    };

    const handlePostComment = () => {
        if (!newComment.trim()) return;

        const myComment = {
            id: 'local-' + Date.now(),
            snippet: {
                topLevelComment: {
                    snippet: {
                        authorDisplayName: user?.name || 'Guest User',
                        authorProfileImageUrl: user?.picture || '',
                        authorChannelId: { value: '' },
                        textDisplay: newComment,
                        publishedAt: new Date().toISOString(),
                        likeCount: 0,
                        isPremiumUser: isPremium
                    }
                },
                totalReplyCount: 0
            }
        };

        setComments([myComment, ...comments]);
        setNewComment('');
    };

    const formatLikes = (count: number) => {
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const getTimeAgo = (publishedAt: string) => {
        const date = new Date(publishedAt);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return 'Just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes} minutes ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        if (days >= 365) return Math.floor(days / 365) + ' years ago';
        if (days >= 30) return Math.floor(days / 30) + ' months ago';
        if (days >= 7) return Math.floor(days / 7) + ' weeks ago';
        if (days > 0) return `${days} days ago`;
        return 'Today';
    };

    return (
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
            {/* Header & Sorting */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '30px', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{comments.length} Comments</h3>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.9rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MoreVertical size={18} />
                        <span onClick={() => handleSort('relevance')} style={{ color: sortBy === 'relevance' ? 'white' : 'var(--text-muted)' }}>Top comments</span>
                        <span onClick={() => handleSort('time')} style={{ color: sortBy === 'time' ? 'white' : 'var(--text-muted)' }}>Newest first</span>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '40px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user?.picture ? <img src={user.picture} style={{ width: '100%' }} alt="Me" /> : <User size={20} color="var(--text-muted)" />}
                </div>
                <div style={{ flex: 1 }}>
                    <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onBlur={() => !newComment && setNewComment('')}
                        style={{ width: '100%', background: 'none', border: 'none', borderBottom: '1px solid var(--glass-border)', padding: '10px 0', color: 'white', outline: 'none', marginBottom: '10px', fontSize: '0.95rem' }}
                    />
                    {newComment && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', animation: 'fadeIn 0.2s' }}>
                            <button onClick={() => setNewComment('')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '10px 20px', borderRadius: '50px', fontWeight: '600' }}>Cancel</button>
                            <button
                                onClick={handlePostComment}
                                className="button-primary"
                                style={{ padding: '10px 25px', borderRadius: '50px' }}
                            >
                                Comment
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                {loading ? (
                    Array(5).fill(0).map((_, i) => (
                        <div key={i} style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--surface)', animation: 'pulse 1.5s infinite' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ height: '14px', width: '30%', background: 'var(--surface)', borderRadius: '4px' }} />
                                <div style={{ height: '12px', width: '80%', background: 'var(--surface)', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))
                ) : (
                    comments.map(thread => {
                        const comment = thread.snippet.topLevelComment.snippet;
                        const replies = thread.replies?.comments || [];
                        const isExpanded = expandedReplies[thread.id];

                        return (
                            <div key={thread.id} style={{ display: 'flex', gap: '15px' }}>
                                <img
                                    src={comment.authorProfileImageUrl || "https://www.gstatic.com/youtube/img/creator/no_profile_img.png"}
                                    alt={comment.authorDisplayName}
                                    onClick={() => navigate(`/channel/${comment.authorChannelId?.value}`)}
                                    style={{ width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', objectFit: 'cover' }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                        <span
                                            onClick={() => navigate(`/channel/${comment.authorChannelId?.value}`)}
                                            style={{ fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                                        >
                                            @{comment.authorDisplayName.replace(/\s+/g, '').toLowerCase()}
                                        </span>
                                        {(comment.isPremiumUser || Math.random() > 0.8) && (
                                            <div title="Premium Subscriber">
                                                <Crown size={12} color="#FFD700" fill="#FFD700" />
                                            </div>
                                        )}
                                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{getTimeAgo(comment.publishedAt)}</span>
                                    </div>
                                    <p style={{ margin: '0 0 10px 0', fontSize: '0.92rem', lineHeight: '1.4', color: '#f1f1f1' }} dangerouslySetInnerHTML={{ __html: comment.textDisplay }} />

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                                            <ThumbsUp size={16} /> <span style={{ fontSize: '0.75rem' }}>{formatLikes(comment.likeCount)}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'white' }}>
                                            <ThumbsDown size={16} />
                                        </div>
                                        <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}>Reply</button>
                                    </div>

                                    {/* Replies Section */}
                                    {thread.snippet.totalReplyCount > 0 && (
                                        <div style={{ marginTop: '12px' }}>
                                            <button
                                                onClick={() => toggleReplies(thread.id)}
                                                style={{ background: 'none', border: 'none', color: '#3ea6ff', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', padding: '8px 12px', borderRadius: '50px' }}
                                                className="replies-btn"
                                            >
                                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                {thread.snippet.totalReplyCount} {thread.snippet.totalReplyCount === 1 ? 'reply' : 'replies'}
                                            </button>

                                            {isExpanded && (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px', paddingLeft: '10px' }}>
                                                    {replies.map((reply: any) => (
                                                        <div key={reply.id} style={{ display: 'flex', gap: '15px' }}>
                                                            <img
                                                                src={reply.snippet.authorProfileImageUrl}
                                                                style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                                                                alt=""
                                                            />
                                                            <div style={{ flex: 1 }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                                                                    <span style={{ fontWeight: '600', fontSize: '0.8rem' }}>@{reply.snippet.authorDisplayName.replace(/\s+/g, '').toLowerCase()}</span>
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>{getTimeAgo(reply.snippet.publishedAt)}</span>
                                                                </div>
                                                                <p style={{ margin: 0, fontSize: '0.9rem', color: '#f1f1f1' }} dangerouslySetInnerHTML={{ __html: reply.snippet.textDisplay }} />
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '8px' }}>
                                                                    <ThumbsUp size={14} color="var(--text-muted)" />
                                                                    <ThumbsDown size={14} color="var(--text-muted)" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <style>{`
                .replies-btn:hover {
                    background: rgba(62, 166, 255, 0.1) !important;
                }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default CommentSection;
