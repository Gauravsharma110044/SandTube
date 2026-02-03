import React from 'react';
import { Settings, Circle } from 'lucide-react';

const NotificationPanel: React.FC = () => {
    const notifications = [
        { id: 1, type: 'upload', author: 'Sand Art Pro', title: 'New Technique: Kinetic Sand Painting', time: '2 hours ago', unread: true, image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
        { id: 2, type: 'comment', author: 'John Doe', title: 'replied to your comment: "That looks amazing!"', time: '5 hours ago', unread: true, image: 'https://i.pravatar.cc/150?u=john' },
        { id: 3, type: 'mention', author: 'Creative Minds', title: 'mentioned you in a post', time: '1 day ago', unread: false, image: 'https://i.pravatar.cc/150?u=creative' },
        { id: 4, type: 'upload', author: 'Beach Vlogs', title: 'The hidden caves of Carmel', time: '2 days ago', unread: false, image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' },
    ];

    const isMobile = window.innerWidth <= 768;

    return (
        <div style={{
            position: 'absolute',
            top: '55px',
            right: isMobile ? '-80px' : '0',
            width: isMobile ? 'calc(100vw - 40px)' : '480px',
            maxWidth: '480px',
            background: 'var(--surface)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.6)',
            border: '1px solid var(--glass-border)',
            zIndex: 3000,
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease',
            backdropFilter: 'blur(16px)'
        }}>
            <div style={{ padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold' }}>Notifications</span>
                <Settings size={18} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} />
            </div>

            <div style={{ maxHeight: 'min(600px, 70vh)', overflowY: 'auto', scrollbarWidth: 'thin' }}>
                {notifications.map(n => (
                    <div key={n.id} style={{ padding: '15px 20px', display: 'flex', gap: '15px', position: 'relative', background: n.unread ? 'rgba(255,255,255,0.03)' : 'transparent', cursor: 'pointer', transition: 'background 0.2s' }} className="notif-item">
                        {n.unread && <Circle size={8} fill="var(--primary)" color="var(--primary)" style={{ position: 'absolute', left: '6px', top: '50%', transform: 'translateY(-50%)' }} />}

                        <img src={n.image} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} alt="" />

                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.9rem', lineHeight: '1.4', color: n.unread ? 'white' : 'var(--text-muted)' }}>
                                <span style={{ fontWeight: 'bold', color: 'white' }}>{n.author}</span> {n.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{n.time}</div>
                        </div>

                        {n.type === 'upload' && !isMobile && (
                            <div style={{ width: '86px', height: '48px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                                <img src={n.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div style={{ padding: '10px', textAlign: 'center', borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <button style={{ background: 'none', border: 'none', color: '#3ea6ff', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer' }}>View all notifications</button>
            </div>

            <style>{`
                .notif-item:hover { background: var(--surface-hover) !important; }
            `}</style>
        </div>
    );
};

export default NotificationPanel;
