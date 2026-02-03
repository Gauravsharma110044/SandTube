import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Film, Loader2, CheckCircle2 } from 'lucide-react';

const UploadDashboard: React.FC = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [step, setStep] = useState(1); // 1: Select, 2: Details, 3: Success

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
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
        setUploading(true);
        setTimeout(() => {
            setUploading(false);
            setStep(2);
        }, 2000);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ paddingBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Video Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your content and upload new videos to your channel.</p>
            </div>

            <div className="glass-morphism" style={{ borderRadius: '24px', padding: '40px', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
                {step === 1 && (
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
                            background: dragActive ? 'rgba(226, 179, 90, 0.05)' : 'transparent',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div style={{
                            width: '80px',
                            height: '80px',
                            borderRadius: '50%',
                            background: 'var(--surface)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)'
                        }}>
                            {uploading ? <Loader2 size={40} className="animate-spin" style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={40} />}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>{uploading ? 'Uploading...' : 'Drag and drop video files to upload'}</h2>
                            <p style={{ color: 'var(--text-muted)' }}>Your videos will be private until you publish them.</p>
                        </div>
                        <button className="button-primary" style={{ padding: '12px 30px' }} onClick={() => startUpload()}>
                            Select Files
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Title (required)</label>
                                <input
                                    type="text"
                                    defaultValue="My Amazing Sand Art Journey"
                                    style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Description</label>
                                <textarea
                                    rows={5}
                                    placeholder="Tell viewers about your video"
                                    style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', color: 'white', outline: 'none', resize: 'none' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Thumbnail</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                                    <div style={{ aspectRatio: '16/9', background: 'var(--surface)', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', cursor: 'pointer', border: '1px solid var(--glass-border)' }}>
                                        <ImageIcon size={20} />
                                        <span>Upload Thumbnail</span>
                                    </div>
                                    {[1, 2].map(i => (
                                        <div key={i} style={{ aspectRatio: '16/9', background: '#333', borderRadius: '8px' }} />
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ background: 'var(--bg-dark)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                <div style={{ aspectRatio: '16/9', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Film size={40} color="#444" />
                                </div>
                                <div style={{ padding: '15px' }}>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Video link</div>
                                    <div style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '10px' }}>https://sandtube.com/watch/v_123</div>
                                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Filename</div>
                                    <div style={{ fontSize: '0.9rem' }}>sand_art_vlog.mp4</div>
                                </div>
                            </div>
                            <button className="button-primary" onClick={() => setStep(3)}>Publish Video</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '20px' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CheckCircle2 size={60} />
                        </div>
                        <h2 style={{ fontSize: '2rem' }}>Video Published!</h2>
                        <p style={{ color: 'var(--text-muted)', maxWidth: '400px' }}>Your video is now live on SandTube. Share it with your audience to start growing.</p>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button className="button-primary" onClick={() => setStep(1)}>Upload Choice</button>
                            <button style={{ background: 'var(--surface)', border: 'none', color: 'white', padding: '12px 30px', borderRadius: '50px', cursor: 'pointer' }}>View Video</button>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    );
};

export default UploadDashboard;
