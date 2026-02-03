import React, { useState } from 'react';
import { ThumbsUp, MessageSquare, MoreVertical, User } from 'lucide-react';

interface Comment {
    id: string;
    user: string;
    avatar: string;
    text: string;
    timestamp: string;
    likes: string;
}

const mockComments: Comment[] = [
    {
        id: '1',
        user: 'Design Enthusiast',
        avatar: 'https://i.pravatar.cc/150?u=12',
        text: 'The glassmorphic design on SandTube is absolutely stunning! Love the attention to detail.',
        timestamp: '2 hours ago',
        likes: '245'
    },
    {
        id: '2',
        user: 'Tech Explorer',
        avatar: 'https://i.pravatar.cc/150?u=45',
        text: 'Finally a video platform that feels modern and fast. Great job on the transitions.',
        timestamp: '5 hours ago',
        likes: '1.2K'
    }
];

const CommentSection: React.FC = () => {
    const [newComment, setNewComment] = useState('');

    return (
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <h3 style={{ fontSize: '1.2rem' }}>{mockComments.length + 124} Comments</h3>
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
                {mockComments.map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: '15px' }}>
                        <img src={comment.avatar} alt={comment.user} style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                        <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>{comment.user}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{comment.timestamp}</span>
                            </div>
                            <p style={{ margin: '0 0 8px 0', fontSize: '0.95rem', lineHeight: '1.5' }}>{comment.text}</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <ThumbsUp size={16} /> <span style={{ fontSize: '0.8rem' }}>{comment.likes}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: 'var(--text-muted)' }}>
                                    <MessageSquare size={16} /> <span style={{ fontSize: '0.8rem' }}>Reply</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CommentSection;
