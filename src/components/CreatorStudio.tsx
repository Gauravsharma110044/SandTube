import React, { useState, useEffect } from 'react';
import {
    Upload,
    Video,
    BarChart2,
    MessageSquare,
    Settings,
    Plus,
    X,
    Image as ImageIcon,
    CheckCircle2,
    Trash2
} from 'lucide-react';
import { storage, database } from '../config/firebase.ts';
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, push, set } from 'firebase/database';
import { analyticsEngine } from '../engines/index.ts';
import BackendAPI from '../services/backend.ts';

const CreatorStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'content' | 'analytics' | 'comments' | 'settings'>('dashboard');
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Upload state
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category] = useState('Entertainment');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

    // Profile state
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [channelName, setChannelName] = useState('');
    const [channelDescription, setChannelDescription] = useState('');
    const [profileStatus, setProfileStatus] = useState<'idle' | 'saving' | 'success'>('idle');
    const [channelStats, setChannelStats] = useState({
        bannerUrl: 'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2000',
        avatarUrl: 'https://i.pravatar.cc/150',
    });
    const [userVideos, setUserVideos] = useState<any[]>([]);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);


    const fetchUserVideos = async () => {
        if (!user) return;
        setIsLoadingVideos(true);
        try {
            const allVideos = await BackendAPI.getAllVideos();
            const filtered = allVideos.filter((v: any) => v.snippet.channelId === user.sub);
            setUserVideos(filtered);
        } catch (error) {
            console.error("Error fetching studio videos:", error);
        } finally {
            setIsLoadingVideos(false);
        }
    };

    const fetchChannelProfile = async () => {
        if (!user) return;
        try {
            const profile = await BackendAPI.getChannelProfile(user.sub);
            if (profile) {
                setChannelName(profile.name || user.name);
                setChannelDescription(profile.description || '');
                setChannelStats(prev => ({
                    ...prev,
                    bannerUrl: profile.bannerUrl || prev.bannerUrl,
                    avatarUrl: profile.avatarUrl || prev.avatarUrl
                }));
            }
        } catch (error) {
            console.error("Error fetching channel profile:", error);
        }
    };

    const handleDeleteVideo = async (videoId: string) => {
        if (window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) {
            try {
                await BackendAPI.deleteVideo(videoId);
                fetchUserVideos(); // Refresh
            } catch (error) {
                console.error("Error deleting video:", error);
            }
        }
    };

    useEffect(() => {
        analyticsEngine.trackEngagement('studio', 'share'); // Using 'share' as a placeholder for studio access
        fetchUserVideos();
        fetchChannelProfile();
    }, []);


    const handleUpload = async () => {
        if (!uploadFile || !title) return;

        setUploadStatus('uploading');

        try {
            // 1. Upload Video to Firebase Storage
            const videoPath = `videos/${user?.sub || 'anonymous'}/${Date.now()}_${uploadFile.name}`;
            const vRef = storageRef(storage, videoPath);
            const uploadTask = uploadBytesResumable(vRef, uploadFile);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadProgress(progress);
                },
                (error) => {
                    console.error("Upload error:", error);
                    setUploadStatus('error');
                },
                async () => {
                    const videoUrl = await getDownloadURL(uploadTask.snapshot.ref);

                    // 2. Upload Thumbnail if exists
                    let thumbUrl = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000';
                    if (thumbnailFile) {
                        const thumbPath = `thumbnails/${user?.sub || 'anonymous'}/${Date.now()}_${thumbnailFile.name}`;
                        const tRef = storageRef(storage, thumbPath);
                        await uploadBytesResumable(tRef, thumbnailFile);
                        thumbUrl = await getDownloadURL(tRef);
                    }

                    // 3. Save Metadata to Database
                    const videoData = {
                        id: `v_${Date.now()}`,
                        snippet: {
                            title,
                            description,
                            thumbnails: {
                                high: { url: thumbUrl },
                                default: { url: thumbUrl }
                            },
                            channelTitle: user?.name || 'My Channel',
                            channelId: user?.sub || 'channel_1',
                            publishedAt: new Date().toISOString(),
                            categoryId: category,
                            tags: title.toLowerCase().split(' ')
                        },
                        statistics: {
                            viewCount: '0',
                            likeCount: '0',
                            favoriteCount: '0',
                            commentCount: '0'
                        },
                        contentDetails: {
                            duration: 'PT0M0S', // Placeholder
                            definition: 'hd'
                        },
                        videoUrl, // Real file URL
                        isUserUploaded: true
                    };

                    const newVideoRef = push(dbRef(database, 'videos'));
                    await set(newVideoRef, videoData);

                    setUploadStatus('success');
                    fetchUserVideos(); // Refresh the list
                    setTimeout(() => {
                        setIsUploadModalOpen(false);
                        resetUpload();
                    }, 2000);
                }
            );
        } catch (error) {
            setUploadStatus('error');
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth <= 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const resetUpload = () => {
        setUploadFile(null);
        setThumbnailFile(null);
        setTitle('');
        setDescription('');
        setUploadProgress(0);
        setUploadStatus('idle');
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            minHeight: '100vh',
            background: 'var(--background)',
            color: 'var(--text)',
            paddingBottom: isMobile ? '70px' : '0'
        }}>
            {/* Sidebar */}
            {!isMobile && (
                <aside style={{
                    width: '260px',
                    borderRight: '1px solid var(--glass-border)',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px 0'
                }}>
                    <div style={{ padding: '0 24px 20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: 'linear-gradient(45deg, var(--primary), #ff8c00)',
                            borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Video color="white" size={20} />
                        </div>
                        <span style={{ fontWeight: '800', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>SandStudio</span>
                    </div>

                    <nav style={{ flex: 1 }}>
                        {[
                            { id: 'dashboard', icon: <BarChart2 size={20} />, label: 'Dashboard' },
                            { id: 'content', icon: <Video size={20} />, label: 'Content' },
                            { id: 'analytics', icon: <BarChart2 size={20} />, label: 'Analytics' },
                            { id: 'comments', icon: <MessageSquare size={20} />, label: 'Comments' },
                            { id: 'settings', icon: <Settings size={20} />, label: 'Customization' },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                style={{
                                    width: '100%',
                                    padding: '12px 24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '16px',
                                    background: activeTab === item.id ? 'rgba(255, 61, 0, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderLeft: `4px solid ${activeTab === item.id ? 'var(--primary)' : 'transparent'}`,
                                    color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    fontWeight: activeTab === item.id ? '600' : '400'
                                }}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div style={{ padding: '20px 24px', borderTop: '1px solid var(--glass-border)' }}>
                        <button style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                        }}>
                            <Settings size={20} /> Settings
                        </button>
                    </div>
                </aside>
            )}

            {/* Main Content */}
            <main style={{ flex: 1, padding: isMobile ? '20px' : '40px', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
                            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Welcome back, Creator!</p>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => setIsLiveModalOpen(true)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--primary)',
                                background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold'
                            }}
                        >
                            <Video size={18} /> Go Live
                        </button>
                        <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="button-primary"
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
                        >
                            <Plus size={20} /> Create
                        </button>
                    </div>
                </header>

                {activeTab === 'dashboard' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                        {/* Stats Cards */}
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Total Subscribers</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userVideos.length > 0 ? (userVideos.length * 12).toLocaleString() : '12,458'}</div>
                            <div style={{ color: '#00e676', fontSize: '0.9rem', marginTop: '8px' }}>↑ 12% this month</div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Total Views</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                                {userVideos.reduce((acc, v) => acc + parseInt(v.statistics?.viewCount || '0'), 0).toLocaleString()}
                            </div>
                            <div style={{ color: '#00e676', fontSize: '0.9rem', marginTop: '8px' }}>↑ 8.2% this month</div>
                        </div>
                        <div className="glass-card" style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Uploaded Videos</h3>
                            <div style={{ fontSize: '2.5rem', fontWeight: '800' }}>{userVideos.length}</div>
                            <div style={{ color: '#00e676', fontSize: '0.9rem', marginTop: '8px' }}>All live & healthy</div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Channel Content</h3>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{userVideos.length} videos found</div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead style={{ background: 'rgba(255,255,255,0.02)', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                    <tr>
                                        <th style={{ padding: '16px 24px' }}>Video</th>
                                        <th style={{ padding: '16px 24px' }}>Visibility</th>
                                        <th style={{ padding: '16px 24px' }}>Date</th>
                                        <th style={{ padding: '16px 24px' }}>Views</th>
                                        <th style={{ padding: '16px 24px' }}>Likes</th>
                                        <th style={{ padding: '16px 24px' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingVideos ? (
                                        Array(3).fill(0).map((_, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '40px', background: 'var(--surface)', borderRadius: '8px', animation: 'pulse 1.5s infinite' }} /></td>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', width: '60px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} /></td>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', width: '80px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} /></td>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', width: '40px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} /></td>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', width: '40px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} /></td>
                                                <td style={{ padding: '16px 24px' }}><div style={{ height: '20px', width: '40px', background: 'var(--surface)', borderRadius: '4px', animation: 'pulse 1.5s infinite' }} /></td>
                                            </tr>
                                        ))
                                    ) : userVideos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ padding: '60px', textAlign: 'center' }}>
                                                <div style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No videos uploaded yet.</div>
                                                <button onClick={() => setIsUploadModalOpen(true)} className="button-primary" style={{ padding: '10px 20px' }}>Upload your first video</button>
                                            </td>
                                        </tr>
                                    ) : (
                                        userVideos.map(video => (
                                            <tr key={video.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }} className="table-row-hover">
                                                <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                    <img src={video.snippet.thumbnails.default.url} style={{ width: '80px', aspectRatio: '16/9', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                                    <div>
                                                        <div style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '4px' }}>{video.snippet.title}</div>
                                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{video.snippet.description.substring(0, 40)}...</div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <span style={{ fontSize: '0.75rem', padding: '4px 8px', background: 'rgba(0, 230, 118, 0.1)', color: '#00e676', borderRadius: '4px' }}>Public</span>
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>
                                                    {new Date(video.snippet.publishedAt).toLocaleDateString()}
                                                </td>
                                                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{video.statistics?.viewCount || 0}</td>
                                                <td style={{ padding: '16px 24px', fontSize: '0.85rem' }}>{video.statistics?.likeCount || 0}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <button
                                                        onClick={() => handleDeleteVideo(video.id)}
                                                        style={{ background: 'none', border: 'none', color: '#ff5252', cursor: 'pointer', padding: '8px', borderRadius: '50%', transition: 'background 0.2s' }}
                                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,82,82,0.1)'}
                                                        onMouseLeave={e => e.currentTarget.style.background = 'none'}
                                                        title="Delete Video"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <style>{`
                            .table-row-hover:hover { background: rgba(255,255,255,0.02); }
                        `}</style>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px' }}>Channel Growth (Last 30 Days)</h3>
                            <div style={{ height: '300px', width: '100%', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '20px' }}>
                                {[40, 60, 45, 90, 65, 85, 100, 75, 95, 110, 80, 120].map((h, i) => (
                                    <div key={i} style={{ flex: 1, height: `${h}%`, background: 'linear-gradient(to top, var(--primary), #ffa726)', borderRadius: '6px', position: 'relative' }}>
                                        <div style={{ position: 'absolute', bottom: '-25px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', color: 'var(--text-muted)' }}>Day {i + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Audience Geography</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {[
                                        { l: 'United States', p: 45 },
                                        { l: 'India', p: 25 },
                                        { l: 'United Kingdom', p: 15 },
                                        { l: 'Other', p: 15 }
                                    ].map(item => (
                                        <div key={item.l}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '0.85rem' }}>
                                                <span>{item.l}</span>
                                                <span>{item.p}%</span>
                                            </div>
                                            <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                                <div style={{ width: `${item.p}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '24px' }}>
                                <h3 style={{ marginBottom: '16px', fontSize: '1rem' }}>Device Type</h3>
                                <div style={{ display: 'flex', height: '150px', alignItems: 'center', justifyContent: 'center' }}>
                                    {/* Simple SVG Donut Chart */}
                                    <svg viewBox="0 0 36 36" style={{ width: '120px', height: '120px' }}>
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="3" />
                                        <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary)" strokeWidth="3" strokeDasharray="70, 100" />
                                    </svg>
                                    <div style={{ marginLeft: '20px', fontSize: '0.85rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '2px' }} /> Mobile (70%)</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}><div style={{ width: '10px', height: '10px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px' }} /> Desktop (30%)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'comments' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
                            <MessageSquare size={64} style={{ opacity: 0.2, marginBottom: '24px', margin: '0 auto' }} />
                            <h3>Community Interactions</h3>
                            <p style={{ color: 'var(--text-muted)', marginTop: '8px' }}>Manage your video comments and community mentions here.</p>
                            <div style={{ marginTop: '32px', padding: '12px 24px', background: 'rgba(255, 61, 0, 0.1)', color: 'var(--primary)', borderRadius: '12px', display: 'inline-block' }}>
                                Community Engagement Engine coming soon!
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                        <div className="glass-card" style={{ padding: '32px' }}>
                            <h3 style={{ marginBottom: '24px' }}>Branding</h3>

                            <div style={{ marginBottom: '32px' }}>
                                <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Banner Image</label>
                                <div
                                    onClick={() => document.getElementById('bannerIn')?.click()}
                                    style={{
                                        width: '100%', height: '150px', borderRadius: '12px', overflow: 'hidden',
                                        position: 'relative', border: '1px solid var(--glass-border)', cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={bannerFile ? URL.createObjectURL(bannerFile) : channelStats.bannerUrl}
                                        alt="Banner"
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                        <Plus color="white" />
                                    </div>
                                </div>
                                <input type="file" id="bannerIn" hidden accept="image/*" onChange={e => setBannerFile(e.target.files?.[0] || null)} />
                            </div>

                            <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Avatar</label>
                                    <div
                                        onClick={() => document.getElementById('avatarIn')?.click()}
                                        style={{
                                            width: '120px', height: '120px', borderRadius: '50%', overflow: 'hidden',
                                            position: 'relative', border: '2px solid var(--primary)', cursor: 'pointer'
                                        }}
                                    >
                                        <img
                                            src={avatarFile ? URL.createObjectURL(avatarFile) : channelStats.avatarUrl}
                                            alt="Avatar"
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: '0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '1'} onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                                            <Plus color="white" />
                                        </div>
                                    </div>
                                    <input type="file" id="avatarIn" hidden accept="image/*" onChange={e => setAvatarFile(e.target.files?.[0] || null)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ display: 'block', marginBottom: '8px' }}>Channel Name</label>
                                    <input
                                        type="text"
                                        value={channelName || user?.name || ''}
                                        onChange={e => setChannelName(e.target.value)}
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }}
                                    />
                                    <label style={{ display: 'block', marginBottom: '8px', marginTop: '16px' }}>Description</label>
                                    <textarea
                                        rows={3}
                                        value={channelDescription}
                                        onChange={e => setChannelDescription(e.target.value)}
                                        placeholder="About your channel..."
                                        style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white', resize: 'none' }}
                                    />
                                </div>
                            </div>

                            <button
                                onClick={async () => {
                                    if (!user) return;
                                    setProfileStatus('saving');
                                    try {
                                        let updatedBanner = channelStats.bannerUrl;
                                        let updatedAvatar = channelStats.avatarUrl;

                                        // Upload files if they changed
                                        if (bannerFile) {
                                            const bRef = storageRef(storage, `branding/${user.sub}/banner_${Date.now()}`);
                                            await uploadBytesResumable(bRef, bannerFile);
                                            updatedBanner = await getDownloadURL(bRef);
                                        }
                                        if (avatarFile) {
                                            const aRef = storageRef(storage, `branding/${user.sub}/avatar_${Date.now()}`);
                                            await uploadBytesResumable(aRef, avatarFile);
                                            updatedAvatar = await getDownloadURL(aRef);
                                        }

                                        await BackendAPI.updateChannelProfile(user.sub, {
                                            name: channelName,
                                            description: channelDescription,
                                            bannerUrl: updatedBanner,
                                            avatarUrl: updatedAvatar
                                        });

                                        setChannelStats(prev => ({
                                            ...prev,
                                            bannerUrl: updatedBanner,
                                            avatarUrl: updatedAvatar
                                        }));

                                        setProfileStatus('success');
                                        setTimeout(() => setProfileStatus('idle'), 3000);
                                    } catch (err) {
                                        console.error("Profile save error:", err);
                                        setProfileStatus('idle');
                                    }
                                }}
                                className="button-primary"
                                style={{ marginTop: '32px', padding: '12px 32px' }}
                            >
                                {profileStatus === 'saving' ? 'Saving...' : profileStatus === 'success' ? 'Saved!' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                )}
            </main>

            {/* Upload Modal */}
            {isUploadModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(10px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-card" style={{
                        width: '100%', maxWidth: '900px',
                        maxHeight: '90vh', overflowY: 'auto',
                        padding: 0, borderRadius: '24px', position: 'relative'
                    }}>
                        <button
                            onClick={() => setIsUploadModalOpen(false)}
                            style={{
                                position: 'absolute', top: '24px', right: '24px',
                                background: 'rgba(255,255,255,0.1)', border: 'none',
                                color: 'white', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10
                            }}
                        >
                            <X size={20} />
                        </button>

                        <div style={{ padding: '40px' }}>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>Upload Video</h2>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Start sharing your story with the world</p>

                            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '40px' }}>
                                {/* Left Side: Details */}
                                <div>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Title (required)</label>
                                        <input
                                            type="text"
                                            placeholder="Add a title that describes your video"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            style={{
                                                width: '100%', padding: '16px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                                color: 'white', fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Description</label>
                                        <textarea
                                            placeholder="Tell viewers about your video"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={6}
                                            style={{
                                                width: '100%', padding: '16px', borderRadius: '12px',
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                                color: 'white', fontSize: '1rem', resize: 'none'
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Thumbnail</label>
                                        <div
                                            onClick={() => document.getElementById('thumbInput')?.click()}
                                            style={{
                                                aspectRatio: '16/9', borderRadius: '12px', border: '2px dashed var(--glass-border)',
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                cursor: 'pointer', overflow: 'hidden', position: 'relative'
                                            }}
                                        >
                                            {thumbnailFile ? (
                                                <img src={URL.createObjectURL(thumbnailFile)} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <>
                                                    <ImageIcon size={32} color="var(--text-muted)" />
                                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: '8px' }}>Upload Thumbnail</span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            type="file" id="thumbInput" hidden accept="image/*"
                                            onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                                        />
                                    </div>
                                </div>

                                {/* Right Side: Upload Box */}
                                <div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.02)', borderRadius: '24px', padding: '32px',
                                        border: '1px solid var(--glass-border)', textAlign: 'center'
                                    }}>
                                        <div
                                            onClick={() => document.getElementById('videoInput')?.click()}
                                            style={{
                                                width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,61,0,0.1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <Upload size={32} color="var(--primary)" />
                                        </div>

                                        {uploadFile ? (
                                            <div>
                                                <p style={{ fontWeight: '600', marginBottom: '8px' }}>{uploadFile.name}</p>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{(uploadFile.size / (1024 * 1024)).toFixed(2)} MB</p>

                                                {uploadStatus === 'uploading' && (
                                                    <div style={{ marginTop: '24px' }}>
                                                        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.3s' }} />
                                                        </div>
                                                        <p style={{ fontSize: '0.8rem', marginTop: '8px' }}>Uploading: {Math.round(uploadProgress)}%</p>
                                                    </div>
                                                )}

                                                {uploadStatus === 'success' && (
                                                    <div style={{ marginTop: '24px', color: '#00e676', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                                        <CheckCircle2 size={20} /> Upload Complete!
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <>
                                                <h3 style={{ marginBottom: '8px' }}>Select Video File</h3>
                                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '24px' }}>MP4, WEBM or MOV files</p>
                                                <button
                                                    onClick={() => document.getElementById('videoInput')?.click()}
                                                    className="button-primary"
                                                    style={{ width: '100%', padding: '12px' }}
                                                >
                                                    Select File
                                                </button>
                                            </>
                                        )}
                                        <input
                                            type="file" id="videoInput" hidden accept="video/*"
                                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                        />
                                    </div>

                                    {uploadStatus !== 'success' && (
                                        <button
                                            disabled={!uploadFile || !title || uploadStatus === 'uploading'}
                                            onClick={handleUpload}
                                            className="button-primary"
                                            style={{
                                                width: '100%', marginTop: '24px', padding: '16px', borderRadius: '12px',
                                                opacity: (!uploadFile || !title || uploadStatus === 'uploading') ? 0.5 : 1
                                            }}
                                        >
                                            {uploadStatus === 'uploading' ? 'Publishing...' : 'Publish Video'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Live Stream Modal */}
            {isLiveModalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)',
                    zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
                }}>
                    <div className="glass-card" style={{ width: '100%', maxWidth: '1000px', padding: '40px', borderRadius: '32px', position: 'relative' }}>
                        <button
                            onClick={() => setIsLiveModalOpen(false)}
                            style={{ position: 'absolute', top: '32px', right: '32px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', borderRadius: '50%', padding: '10px', cursor: 'pointer' }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>Setup Live Stream</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Capture your audience in real-time</p>

                                <div style={{ aspectRatio: '16/9', background: '#000', borderRadius: '24px', position: 'relative', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                    <video
                                        id="live-preview"
                                        autoPlay
                                        muted
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        ref={(el) => {
                                            if (el && isLiveModalOpen) {
                                                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                                                    .then(stream => { el.srcObject = stream; })
                                                    .catch(err => console.error("WebRTC Error:", err));
                                            }
                                        }}
                                    />
                                    <div style={{ position: 'absolute', top: '24px', left: '24px', background: 'rgba(255,0,0,0.8)', padding: '6px 16px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold' }}>PREVIEW</div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', justifyContent: 'center' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Stream Title</label>
                                    <input type="text" placeholder="What are you streaming?" style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Privacy</label>
                                    <select style={{ width: '100%', padding: '16px', borderRadius: '12px', background: 'var(--surface)', border: '1px solid var(--glass-border)', color: 'white' }}>
                                        <option>Public</option>
                                        <option>Unlisted</option>
                                        <option>Private</option>
                                    </select>
                                </div>
                                <button className="button-primary" style={{ padding: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    GO LIVE NOW
                                </button>
                                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                                    By clicking Go Live, you agree to SandTube's Community Guidelines.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorStudio;
