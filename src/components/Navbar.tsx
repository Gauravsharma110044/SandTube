import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Video, Bell, Mic, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { getSearchSuggestions } from '../services/youtube.ts';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
    const navigate = useNavigate();
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length > 1) {
                const results = await getSearchSuggestions(searchQuery);
                setSuggestions(results);
                setShowSuggestions(true);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
                    headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                const userData = {
                    ...res.data,
                    accessToken: tokenResponse.access_token
                };

                setUser(userData);
                localStorage.setItem('user', JSON.stringify(userData));
                window.location.reload();
            } catch (err) {
                console.error('Failed to fetch user profile', err);
            }
        },
        scope: 'https://www.googleapis.com/auth/youtube.readonly',
        onError: () => console.log('Login Failed'),
    });

    const handleSearch = (e?: React.FormEvent, queryOverride?: string) => {
        if (e) e.preventDefault();
        const finalQuery = queryOverride || searchQuery;
        if (finalQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(finalQuery)}`);
            setShowSuggestions(false);
            setSearchQuery(finalQuery);
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

            <div style={{ flex: 1, maxWidth: '600px', margin: '0 40px', position: 'relative' }} ref={suggestionsRef}>
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                            onFocus={() => searchQuery.length > 0 && setShowSuggestions(true)}
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

                {showSuggestions && suggestions.length > 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 50,
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--glass-border)',
                        overflow: 'hidden',
                        zIndex: 2000
                    }}>
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                onClick={() => handleSearch(undefined, suggestion)}
                                style={{
                                    padding: '10px 20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '15px',
                                    transition: 'background 0.2s'
                                }}
                                className="suggestion-item"
                            >
                                <Search size={16} color="var(--text-muted)" />
                                <span style={{ fontWeight: '600' }}>{suggestion}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
            <style>{`
                .suggestion-item:hover {
                    background: var(--surface-hover);
                    color: var(--primary);
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
