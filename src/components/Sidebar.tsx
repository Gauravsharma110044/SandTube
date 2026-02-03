import React, { useEffect, useState } from 'react';
import { Home, PlaySquare, Clock, ThumbsUp, History, Library as LibraryIcon, Settings, Flag, HelpCircle, MessageSquare, Compass as ExploreIcon, Music, Trophy, Newspaper, Gamepad2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMySubscriptions } from '../services/youtube.ts';

interface SidebarProps {
    isOpen: boolean;
}

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '20px',
            padding: '12px 20px',
            borderRadius: '12px',
            cursor: 'pointer',
            background: active ? 'var(--surface-hover)' : 'transparent',
            color: active ? 'var(--primary)' : 'white',
            transition: 'all 0.2s ease',
            margin: '4px 10px',
        }}
        className="sidebar-item"
    >
        {icon}
        <span style={{
            fontSize: '0.95rem',
            fontWeight: active ? '600' : '400',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        }}>{label}</span>
    </div>
);

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchSubs = async () => {
            if (user?.accessToken) {
                try {
                    const subs = await getMySubscriptions(user.accessToken);
                    setSubscriptions(subs);
                } catch (error) {
                    console.error("Error fetching subscriptions:", error);
                }
            }
        };
        fetchSubs();
    }, [user?.accessToken]);

    const isActive = (path: string) => location.pathname === path;

    const handleExploreClick = (label: string) => {
        navigate(`/?search=${encodeURIComponent(label)}`);
    };

    return (
        <aside style={{
            position: 'fixed',
            left: 0,
            top: '70px',
            bottom: 0,
            width: '240px',
            background: 'var(--bg-dark)',
            overflowY: 'auto',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRight: '1px solid var(--glass-border)',
            paddingTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1500,
            transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
            boxShadow: isOpen && window.innerWidth <= 768 ? '10px 0 30px rgba(0,0,0,0.5)' : 'none'
        }}>
            <SidebarItem icon={<Home size={22} />} label="Home" active={isActive('/')} onClick={() => navigate('/')} />
            <SidebarItem icon={<PlaySquare size={22} />} label="Shorts" active={isActive('/shorts')} onClick={() => navigate('/shorts')} />
            <SidebarItem icon={<History size={22} />} label="Subscriptions" active={isActive('/subscriptions')} onClick={() => navigate('/subscriptions')} />

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '15px 20px' }} />

            <div style={{ padding: '0 30px 10px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>You</div>
            <SidebarItem icon={<LibraryIcon size={22} />} label="Library" active={isActive('/library')} onClick={() => navigate('/library')} />
            <SidebarItem icon={<History size={22} />} label="History" active={isActive('/history')} onClick={() => navigate('/history')} />
            <SidebarItem icon={<PlaySquare size={22} />} label="Your videos" />
            <SidebarItem icon={<Clock size={22} />} label="Watch later" />
            <SidebarItem icon={<ThumbsUp size={22} />} label="Liked videos" active={isActive('/liked-videos')} onClick={() => navigate('/liked-videos')} />

            {user && subscriptions.length > 0 && (
                <>
                    <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '15px 20px' }} />
                    <div style={{ padding: '0 30px 10px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Subscriptions</div>
                    {subscriptions.map(sub => (
                        <div
                            key={sub.id}
                            onClick={() => handleExploreClick(sub.snippet.title)}
                            style={{ display: 'flex', alignItems: 'center', gap: '20px', padding: '10px 20px', cursor: 'pointer', borderRadius: '12px', margin: '2px 10px' }}
                            className="sidebar-item"
                        >
                            <img src={sub.snippet.thumbnails.default.url} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{sub.snippet.title}</span>
                        </div>
                    ))}
                </>
            )}

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '15px 20px' }} />

            <div style={{ padding: '0 30px 10px', fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>Explore</div>
            <SidebarItem icon={<ExploreIcon size={22} />} label="Trending" onClick={() => handleExploreClick('Trending')} />
            <SidebarItem icon={<Music size={22} />} label="Music" onClick={() => handleExploreClick('Music')} />
            <SidebarItem icon={<Trophy size={22} />} label="Gaming" onClick={() => handleExploreClick('Gaming')} />
            <SidebarItem icon={<Newspaper size={22} />} label="News" onClick={() => handleExploreClick('News')} />
            <SidebarItem icon={<Gamepad2 size={22} />} label="Sports" onClick={() => handleExploreClick('Sports')} />

            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)', margin: '15px 20px' }} />

            <SidebarItem icon={<Settings size={22} />} label="Settings" active={isActive('/settings')} onClick={() => navigate('/settings')} />
            <SidebarItem icon={<Flag size={22} />} label="Report history" />
            <SidebarItem icon={<HelpCircle size={22} />} label="Help" />
            <SidebarItem icon={<MessageSquare size={22} />} label="Send feedback" />
        </aside>
    );
};

export default Sidebar;
