import React, { useState, useEffect, useRef } from 'react';
import { Menu, Search, Video, Bell, LogOut, Clock, ArrowLeft, Crown } from 'lucide-react';
import BackendAPI from '../services/backend.ts';
import { useNavigate, Link } from 'react-router-dom';
import { useGoogleLogin, googleLogout } from '@react-oauth/google';
import axios from 'axios';
import { getSearchSuggestions } from '../services/youtube.ts';
import NotificationPanel from './NotificationPanel.tsx';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [searchHistory, setSearchHistory] = useState<string[]>(JSON.parse(localStorage.getItem('sandtube_search_history') || '[]'));
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isSearchVisibleMobile, setIsSearchVisibleMobile] = useState(false);
    const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('user') || 'null'));
    const [showNotifications, setShowNotifications] = useState(false);
    const [isPremium, setIsPremium] = useState(false);
    const navigate = useNavigate();
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
    const suggestionsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (user?.sub) {
            const unsubscribe = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsubscribe();
        }
    }, [user?.sub]);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (searchQuery.trim().length > 1) {
                const results = await getSearchSuggestions(searchQuery);
                setSuggestions(results);
                setShowSuggestions(true);
            } else if (searchQuery.trim().length === 0) {
                setSuggestions([]);
                setShowSuggestions(searchHistory.length > 0);
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 200);
        return () => clearTimeout(timer);
    }, [searchQuery, searchHistory]);

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
            setIsSearchVisibleMobile(false);

            const newHistory = [finalQuery, ...searchHistory.filter(q => q !== finalQuery)].slice(0, 10);
            setSearchHistory(newHistory);
            localStorage.setItem('sandtube_search_history', JSON.stringify(newHistory));
        }
    };

    const removeFromHistory = (e: React.MouseEvent, q: string) => {
        e.stopPropagation();
        const newHistory = searchHistory.filter(item => item !== q);
        setSearchHistory(newHistory);
        localStorage.setItem('sandtube_search_history', JSON.stringify(newHistory));
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
            {/* Logo Section */}
            {!isSearchVisibleMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '15px' }}>
                    {!isMobile && (
                        <button
                            onClick={onMenuClick}
                            style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                        >
                            <Menu size={24} />
                        </button>
                    )}
                    <Link to="/" style={{ textDecoration: 'none', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img
                            src="/logo.svg"
                            alt="SandTube Logo"
                            style={{
                                width: '36px',
                                height: '36px',
                                borderRadius: '10px',
                                boxShadow: '0 0 15px rgba(226, 179, 90, 0.4)'
                            }}
                        />
                        <span className="desktop-only" style={{ fontSize: '1.2rem', fontWeight: 'bold', letterSpacing: '-1px' }}>SandTube</span>
                        {isPremium && (
                            <span style={{
                                fontSize: '0.65rem', background: '#FFD700', color: 'black',
                                padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold',
                                marginLeft: '2px', alignSelf: 'flex-start', marginTop: '4px'
                            }}>
                                PREMIUM
                            </span>
                        )}
                    </Link>
                </div>
            )}

            {/* Mobile Back Button for Search */}
            {isSearchVisibleMobile && (
                <button
                    onClick={() => setIsSearchVisibleMobile(false)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '10px' }}
                >
                    <ArrowLeft size={24} />
                </button>
            )}

            {/* Search Section */}
            <div
                style={{
                    flex: 1,
                    maxWidth: '600px',
                    margin: isSearchVisibleMobile ? '0' : '0 40px',
                    position: isSearchVisibleMobile ? 'absolute' : 'relative',
                    left: isSearchVisibleMobile ? '60px' : 'auto',
                    right: isSearchVisibleMobile ? '20px' : 'auto',
                    display: (isSearchVisibleMobile || window.innerWidth > 768) ? 'block' : 'none'
                }}
                ref={suggestionsRef}
            >
                <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center' }}>
                    <div style={{
                        display: 'flex',
                        flex: 1,
                        background: 'var(--surface)',
                        borderRadius: '50px',
                        padding: '2px 2px 2px 20px',
                        alignItems: 'center',
                        border: '1px solid var(--glass-border)',
                        boxShadow: showSuggestions ? '0 0 0 1px var(--primary)' : 'none',
                        transition: 'box-shadow 0.2s'
                    }}>
                        <input
                            type="text"
                            placeholder="Search videos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onFocus={() => setShowSuggestions(true)}
                            autoFocus={isSearchVisibleMobile}
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
                            padding: '10px 15px',
                            borderTopRightRadius: '50px',
                            borderBottomRightRadius: '50px',
                            color: 'white',
                            cursor: 'pointer'
                        }}>
                            <Search size={20} />
                        </button>
                    </div>
                </form>

                {showSuggestions && (
                    <div style={{
                        position: 'absolute',
                        top: '110%',
                        left: 0,
                        right: 0,
                        background: 'var(--surface)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        border: '1px solid var(--glass-border)',
                        overflow: 'hidden',
                        zIndex: 2000,
                        animation: 'fadeIn 0.2s ease'
                    }}>
                        {searchQuery === '' && searchHistory.map((q, index) => (
                            <div
                                key={`hist-${index}`}
                                onClick={() => handleSearch(undefined, q)}
                                style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
                                className="suggestion-item history-item"
                            >
                                <Clock size={16} color="var(--primary)" />
                                <span style={{ fontWeight: '600', flex: 1, color: 'var(--primary)' }}>{q}</span>
                                <span onClick={(e) => removeFromHistory(e, q)} style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Remove</span>
                            </div>
                        ))}
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={`sug-${index}`}
                                onClick={() => handleSearch(undefined, suggestion)}
                                style={{ padding: '12px 20px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px' }}
                                className="suggestion-item"
                            >
                                <Search size={16} color="var(--text-muted)" />
                                <span style={{ fontWeight: '600' }}>{suggestion}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Actions Section */}
            {!isSearchVisibleMobile && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                        className="tablet-only"
                        onClick={() => setIsSearchVisibleMobile(true)}
                        style={{ background: 'none', border: 'none', color: 'white', padding: '10px', cursor: 'pointer', display: window.innerWidth <= 768 ? 'block' : 'none' }}
                    >
                        <Search size={24} />
                    </button>

                    {user ? (
                        <>
                            <Video
                                size={24}
                                className="desktop-only"
                                style={{ cursor: 'pointer' }}
                                onClick={() => navigate('/studio')}
                            />
                            <div style={{ position: 'relative' }}>
                                <Bell
                                    size={24}
                                    style={{ cursor: 'pointer', color: showNotifications ? 'var(--primary)' : 'white' }}
                                    onClick={() => setShowNotifications(!showNotifications)}
                                />
                                {showNotifications && <NotificationPanel />}
                            </div>
                            <div
                                onClick={() => navigate('/settings')}
                                style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${isPremium ? '#FFD700' : 'var(--primary)'}`, cursor: 'pointer', position: 'relative' }}
                            >
                                <img src={user.picture} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                {isPremium && (
                                    <div style={{ position: 'absolute', top: -1, right: -1, background: '#FFD700', borderRadius: '50%', padding: '2px', boxShadow: '0 0 5px rgba(0,0,0,0.5)' }}>
                                        <Crown size={8} color="black" fill="black" />
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleLogout}
                                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                title="Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => login()}
                            className="button-primary"
                            style={{ padding: '6px 15px', fontSize: '0.9rem' }}
                        >
                            Sign In
                        </button>
                    )}
                </div>
            )}

            <style>{`
                .suggestion-item:hover { background: var(--surface-hover); color: var(--primary); }
                @media (max-width: 768px) {
                  .tablet-only { display: block !important; }
                  .desktop-only { display: none !important; }
                }
            `}</style>
        </nav>
    );
};

export default Navbar;
