import React, { useState, useEffect } from 'react';
import {
    Upload,
    Image as ImageIcon,
    Film,
    Loader2,
    CheckCircle2,
    Play,
    Edit3,
    BarChart2,
    MessageCircle,
    X,
    TrendingUp,
    Users,
    Eye,
    Clock
} from 'lucide-react';
import { getMyChannel, getPlaylistItems } from '../services/youtube.ts';

const UploadDashboard: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [step, setStep] = useState(1); // 1: Content Table, 2: Upload Modal, 3: Details, 4: Success
    const [activeTab, setActiveTab] = useState<'content' | 'analytics'>('content');
    const [userVideos, setUserVideos] = useState<any[]>([]);
    const [channelStats, setChannelStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        const fetchContent = async () => {
            if (user?.accessToken) {
                try {
                    const channel = await getMyChannel(user.accessToken);
                    setChannelStats(channel);
                    const uploadsId = channel.contentDetails.relatedPlaylists.uploads;
                    const items = await getPlaylistItems(uploadsId);
                    setUserVideos(items);
                } catch (error) {
                    console.error("Error fetching studio content:", error);
                }
            }
            setLoading(false);
        };
        fetchContent();
    }, [user?.accessToken]);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            startUpload();
        }
    };

    const startUpload = () => {
        setStep(2);
        setUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setUploading(false);
                setStep(3);
            }
        }, 150);
    };

    const renderAnalytics = () => {
        if (!channelStats) return null;

        const stats = [
            { label: 'Subscribers', value: parseInt(channelStats.statistics.subscriberCount).toLocaleString(), icon: <Users size={20} />, trend: '+420 (last 28 days)', color: '#3ea6ff' },
            { label: 'Views', value: (parseInt(channelStats.statistics.viewCount) / 10).toLocaleString(), icon: <Eye size={20} />, trend: '+15.4%', color: '#4CAF50' },
            { label: 'Watch time', value: '4.2K hours', icon: <Clock size={20} />, trend: '-2.1%', color: '#E2B35A' },
            { label: 'Revenue', value: '$124.50', icon: <TrendingUp size={20} />, trend: '+$45.20', color: '#ff4e4e' },
        ];

        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                {/* Left Column: Summary and Chart */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        {stats.map(s => (
                            <div key={s.label} className="glass-morphism" style={{ padding: '20px', borderRadius: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '10px' }}>
                                    {s.icon} {s.label}
                                </div>
                                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '5px' }}>{s.value}</div>
                                <div style={{ fontSize: '0.8rem', color: s.trend.startsWith('+') ? '#4CAF50' : '#ff4e4e' }}>{s.trend}</div>
                            </div>
                        ))}
                    </div>

                    <div className="glass-morphism" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px' }}>Views (last 7 days)</h3>
                        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '15px', height: '200px', padding: '0 10px' }}>
                            {[45, 60, 40, 85, 55, 75, 90].map((h, i) => (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                    <div style={{
                                        width: '100%',
                                        height: `${h}%`,
                                        background: 'linear-gradient(to top, var(--primary), #e2d15a)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 1s ease-out'
                                    }} className="chart-bar" />
                                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Key Videos and Real-time */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                    <div className="glass-morphism" style={{ padding: '25px', borderRadius: '16px' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '20px' }}>Top Performing Content</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {userVideos.slice(0, 3).map((v, i) => (
                                <div key={i} style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <img src={v.snippet.thumbnails.default.url} style={{ width: '80px', height: '45px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.85rem', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{v.snippet.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{Math.floor(Math.random() * 5000)} views • 98.4% retention</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-morphism" style={{ padding: '25px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 'bold' }}>Real-time</h3>
                            <div style={{ fontSize: '0.7rem', color: '#4CAF50', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '6px', height: '6px', background: '#4CAF50', borderRadius: '50%' }} /> Updating live
                            </div>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '5px' }}>{Math.floor(Math.random() * 1000)}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '30px' }}>Views in last 48 hours</div>
                        <div style={{ height: '40px', display: 'flex', gap: '2px', alignItems: 'flex-end' }}>
                            {Array(48).fill(0).map((_, i) => (
                                <div key={i} style={{ flex: 1, height: `${Math.random() * 100}%`, background: 'var(--primary)', opacity: 0.6, borderRadius: '1px' }} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (!user) {
        return (
            <div style={{ height: '70vh', border: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }} className="glass-morphism">
                <Upload size={64} style={{ opacity: 0.2 }} />
                <h2>Sign in to access your Studio</h2>
                <p style={{ color: 'var(--text-muted)' }}>Manage your videos and view analytics in one place.</p>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto', animation: 'fadeIn 0.5s ease', padding: '20px' }}>

            {/* Studio Navigation */}
            <div style={{ display: 'flex', gap: '40px', alignItems: 'center', marginBottom: '30px' }}>
                <div
                    onClick={() => setActiveTab('content')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'content' ? 'bold' : 'normal',
                        color: activeTab === 'content' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderBottom: activeTab === 'content' ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                >
                    <Film size={20} /> Content
                </div>
                <div
                    onClick={() => setActiveTab('analytics')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '1rem',
                        fontWeight: activeTab === 'analytics' ? 'bold' : 'normal',
                        color: activeTab === 'analytics' ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '10px 0',
                        borderBottom: activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent'
                    }}
                >
                    <BarChart2 size={20} /> Analytics
                </div>
                <div style={{ flex: 1 }} />
                <button
                    className="button-primary"
                    style={{ padding: '10px 25px', display: 'flex', alignItems: 'center', gap: '10px' }}
                    onClick={() => setStep(2)}
                >
                    <Upload size={18} /> CREATE
                </button>
            </div>

            {/* Studio Header Info (only for Content tab) */}
            {activeTab === 'content' && (
                <div style={{ marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Channel content</h1>
                    {channelStats && (
                        <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{parseInt(channelStats.statistics.subscriberCount).toLocaleString()}</span> subscribers
                            </div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                <span style={{ color: 'white', fontWeight: 'bold' }}>{parseInt(channelStats.statistics.videoCount).toLocaleString()}</span> videos
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Dashboard */}
            {activeTab === 'analytics' && renderAnalytics()}

            {/* Content View */}
            {activeTab === 'content' && step === 1 && (
                <div className="glass-morphism" style={{ borderRadius: '16px', overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 2fr) 1fr 1fr 1fr 1fr', padding: '15px 20px', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        <div>Video</div>
                        <div>Visibility</div>
                        <div>Restrictions</div>
                        <div>Date</div>
                        <div>Views</div>
                    </div>

                    {loading ? (
                        Array(5).fill(0).map((_, i) => (
                            <div key={i} style={{ height: '80px', borderBottom: '1px solid var(--glass-border)', animation: 'pulse 1.5s infinite', background: 'var(--surface)' }} />
                        ))
                    ) : userVideos.length > 0 ? (
                        userVideos.map((video) => (
                            <div key={video.id} className="studio-row" style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(400px, 2fr) 1fr 1fr 1fr 1fr',
                                padding: '15px 20px',
                                borderBottom: '1px solid var(--glass-border)',
                                alignItems: 'center',
                                transition: 'background 0.2s',
                                cursor: 'default'
                            }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <div style={{ width: '120px', height: '68px', borderRadius: '4px', overflow: 'hidden', position: 'relative', flexShrink: 0 }}>
                                        <img src={video.snippet.thumbnails?.medium?.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        <div className="row-actions" style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', opacity: 0, transition: 'opacity 0.2s' }}>
                                            <div title="Details" onClick={() => setStep(3)}><Edit3 size={18} style={{ cursor: 'pointer' }} /></div>
                                            <div title="Analytics" onClick={() => setActiveTab('analytics')}><BarChart2 size={18} style={{ cursor: 'pointer' }} /></div>
                                            <div title="Comments"><MessageCircle size={18} style={{ cursor: 'pointer' }} /></div>
                                            <div title="View on YouTube"><Play size={18} style={{ cursor: 'pointer' }} /></div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', overflow: 'hidden' }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.snippet.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.snippet.description || 'No description'}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                    <CheckCircle2 size={14} color="#4CAF50" /> Public
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>None</div>
                                <div style={{ fontSize: '0.85rem' }}>
                                    {new Date(video.snippet.publishedAt).toLocaleDateString()}<br />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Published</span>
                                </div>
                                <div style={{ fontSize: '0.9rem' }}>{Math.floor(Math.random() * 5000).toLocaleString()}</div>
                            </div>
                        ))
                    ) : (
                        <div style={{ padding: '100px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                            <Film size={60} style={{ opacity: 0.1 }} />
                            <p style={{ color: 'var(--text-muted)' }}>No content available. Start by uploading your first video!</p>
                            <button className="button-primary" onClick={() => setStep(2)}>UPLOAD VIDEOS</button>
                        </div>
                    )}
                </div>
            )}

            {/* Upload Modal Overlay */}
            {(step === 2 || step === 3 || step === 4) && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                    <div className="glass-morphism" style={{
                        width: '100%',
                        maxWidth: step === 3 ? '1000px' : '600px',
                        borderRadius: '24px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid var(--glass-border)',
                        background: 'var(--bg-dark)'
                    }}>
                        {/* Modal Header */}
                        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                                {step === 2 ? 'Upload videos' : step === 3 ? 'Details' : 'Upload complete'}
                            </h2>
                            <X size={24} style={{ cursor: 'pointer' }} onClick={() => { setStep(1); setUploadProgress(0); }} />
                        </div>

                        <div style={{ padding: '40px', minHeight: '400px' }}>
                            {step === 2 && (
                                <div
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    style={{
                                        flex: 1,
                                        border: dragActive ? '2px dashed var(--primary)' : '2px dashed var(--glass-border)',
                                        borderRadius: '16px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '20px',
                                        height: '350px',
                                        background: dragActive ? 'rgba(226, 179, 90, 0.05)' : 'transparent',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                                        {uploading ? <Loader2 size={40} className="animate-spin" /> : <Upload size={40} />}
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{uploading ? `Uploading ${uploadProgress}%` : 'Drag and drop videos to upload'}</h3>
                                        <p style={{ color: 'var(--text-muted)' }}>Your videos will be private until you publish them.</p>
                                    </div>
                                    {!uploading && (
                                        <button className="button-primary" style={{ padding: '12px 35px' }} onClick={startUpload}>
                                            SELECT FILES
                                        </button>
                                    )}
                                    {uploading && (
                                        <div style={{ width: '80%', height: '4px', background: 'var(--surface)', borderRadius: '2px', overflow: 'hidden', marginTop: '10px' }}>
                                            <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s linear' }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 3 && (
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold', marginBottom: '5px' }}>Title (required)</label>
                                            <input type="text" defaultValue="My Amazing Sand Art Journey" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }} />
                                        </div>
                                        <div style={{ border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '15px' }}>
                                            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '5px' }}>Description</label>
                                            <textarea rows={6} placeholder="Tell viewers about your video" style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '1rem', resize: 'none' }} />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>Thumbnail</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                                                <div style={{ aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '4px', border: '1px dashed var(--glass-border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                                    <ImageIcon size={18} />
                                                    <span>Upload</span>
                                                </div>
                                                <div style={{ aspectRatio: '16/9', background: '#222', borderRadius: '4px' }} />
                                                <div style={{ aspectRatio: '16/9', background: '#333', borderRadius: '4px' }} />
                                                <div style={{ aspectRatio: '16/9', background: '#444', borderRadius: '4px' }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                        <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden' }}>
                                            <div style={{ aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#111' }}>
                                                <Film size={48} opacity={0.3} />
                                            </div>
                                            <div style={{ padding: '15px', background: 'rgba(255,255,255,0.03)' }}>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Video link</div>
                                                <div style={{ fontSize: '0.85rem', color: '#3ea6ff', marginBottom: '15px' }}>https://sandtube.com/watch?v=sd_123</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Filename</div>
                                                <div style={{ fontSize: '0.85rem' }}>sand_vlog_final.mp4</div>
                                            </div>
                                        </div>
                                        <button className="button-primary" style={{ marginTop: 'auto' }} onClick={() => setStep(4)}>NEXT</button>
                                    </div>
                                </div>
                            )}

                            {step === 4 && (
                                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '25px', padding: '40px 0' }}>
                                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CheckCircle2 size={48} />
                                    </div>
                                    <div>
                                        <h2 style={{ fontSize: '1.8rem', marginBottom: '10px' }}>Processing complete</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>Your video "My Amazing Sand Art Journey" has been successfully uploaded and is now being processed for high definition.</p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px' }}>
                                        <button className="button-primary" onClick={() => { setStep(1); setUploadProgress(0); }}>CLOSE</button>
                                        <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '12px 25px', borderRadius: '50px', cursor: 'pointer' }}>GO TO STUDIO</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                .studio-row:hover {
                    background: var(--surface-hover);
                }
                .studio-row:hover .row-actions {
                    opacity: 1 !important;
                }
                .chart-bar:hover {
                    opacity: 0.8;
                    filter: brightness(1.2);
                }
                .animate-spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
            `}</style>
        </div>
    );
};

export default UploadDashboard;
