import React, { useState } from 'react';
import { Menu, Search, Video, Bell, Mic, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                // Fetch profile info using the access token
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                const userData = {
                    ...res.data,
                    accessToken: tokenResponse.access_token
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                window.location.reload(); // Refresh to update all components with the new token
            } catch (err) {
                console.error('Failed to fetch user profile', err);
            }
        },
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        onError: () => console.log('Login Failed'),
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleLogout = () => {
        googleLogout();
        setUser(null);
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <nav className="glass-morphism" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '70px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 1000,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button
                    onClick={onMenuClick}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                >
                    <Menu size={24} />
                </button>
                <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img
                        src="/logo.svg"
                        alt="SandTube Logo"
                        style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            boxShadow: '0 0 15px rgba(226, 179, 90, 0.4)'
                        }}
                    />
                    <span style={{ fontSize: '1.4rem', fontWeight: 'bold', letterSpacing: '-1px' }}>SandTube</span>
                </Link>
            </div>

            <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: 1, maxWidth: '600px', margin: '0 40px' }}>
                <div style={{
                    display: 'flex',
                    flex: 1,
                    background: 'var(--surface)',
                    borderRadius: '50px',
                    padding: '2px 2px 2px 20px',
                    alignItems: 'center',
                    border: '1px solid var(--glass-border)'
                }}>
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            flex: 1,
                            padding: '10px 0',
                            outline: 'none',
                            fontSize: '1rem'
                        }}
                    />
                    <button type="submit" style={{
                        background: 'var(--surface-hover)',
                        border: 'none',
                        borderLeft: '1px solid var(--glass-border)',
                        padding: '10px 20px',
                        borderTopRightRadius: '50px',
                        borderBottomRightRadius: '50px',
                        color: 'white',
                        cursor: 'pointer'
                    }}>
                        <Search size={20} />
                    </button>
                </div>
                <button type="button" style={{ background: 'var(--surface)', border: 'none', borderRadius: '50%', padding: '12px', color: 'white', cursor: 'pointer' }}>
                    <Mic size={20} />
                </button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                {user ? (
                    <>
                        <Video
                            size={24}
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/upload')}
                        />
                        <Bell size={24} style={{ cursor: 'pointer' }} />
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div
                                onClick={() => navigate('/settings')}
                                style={{
                                    width: '35px',
                                    height: '35px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    border: '2px solid var(--primary)',
                                    cursor: 'pointer'
                                }}
                            >
                                <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    </>
                ) : (
                    <button
                        onClick={() => login()}
                        className="button-primary"
                        style={{ padding: '8px 20px' }}
                    >
                        Sign In
                    </button>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
