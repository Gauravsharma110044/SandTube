import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, PlaySquare, History, Library, PlusCircle } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    return (
        <nav style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'var(--bg-dark)',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center',
            zIndex: 2000,
            backdropFilter: 'blur(20px)',
            padding: '4px 0'
        }}>
            <NavItem
                icon={<Home size={22} />}
                label="Home"
                active={isActive('/')}
                onClick={() => navigate('/')}
            />
            <NavItem
                icon={<PlaySquare size={22} />}
                label="Shorts"
                active={isActive('/shorts')}
                onClick={() => navigate('/shorts')}
            />
            <div
                onClick={() => navigate('/studio')}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    marginBottom: '4px'
                }}
            >
                <PlusCircle size={32} />
            </div>
            <NavItem
                icon={<History size={22} />}
                label="Subs"
                active={isActive('/subscriptions')}
                onClick={() => navigate('/subscriptions')}
            />
            <NavItem
                icon={<Library size={22} />}
                label="Library"
                active={isActive('/library')}
                onClick={() => navigate('/library')}
            />
        </nav>
    );
};

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
    <div
        onClick={onClick}
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
            color: active ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flex: 1
        }}
    >
        {icon}
        <span style={{ fontSize: '0.65rem', fontWeight: active ? '600' : '400' }}>{label}</span>
    </div>
);

export default MobileBottomNav;
