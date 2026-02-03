import React, { useState } from 'react';
import { User, Bell, Lock, Monitor, Shield } from 'lucide-react';

const SettingsPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState('account');

    const tabs = [
        { id: 'account', label: 'Account', icon: <User size={20} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={20} /> },
        { id: 'privacy', label: 'Privacy', icon: <Shield size={20} /> },
        { id: 'security', label: 'Security', icon: <Lock size={20} /> },
        { id: 'appearance', label: 'Appearance', icon: <Monitor size={20} /> }
    ];

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', animation: 'fadeIn 0.5s ease' }}>
            <div style={{ paddingBottom: '30px' }}>
                <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>Settings</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your channel settings and preferences.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '30px' }}>
                <div className="glass-morphism" style={{ borderRadius: '20px', padding: '10px', height: 'fit-content' }}>
                    {tabs.map(tab => (
                        <div
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '15px',
                                padding: '12px 20px',
                                borderRadius: '12px',
                                cursor: 'pointer',
                                background: activeTab === tab.id ? 'var(--surface-hover)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--primary)' : 'white',
                                transition: 'all 0.2s',
                                marginBottom: '5px'
                            }}
                        >
                            {tab.icon}
                            <span style={{ fontWeight: activeTab === tab.id ? '600' : '400' }}>{tab.label}</span>
                        </div>
                    ))}
                </div>

                <div className="glass-morphism" style={{ borderRadius: '24px', padding: '40px' }}>
                    {activeTab === 'account' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={50} color="#0a0a0a" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.2rem', marginBottom: '5px' }}>Your Channel Photo</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '10px' }}>PNG or JPG, max 10MB.</p>
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button style={{ background: 'var(--primary)', border: 'none', color: '#0a0a0a', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer', fontWeight: '600' }}>Upload new</button>
                                        <button style={{ background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', padding: '8px 15px', borderRadius: '50px', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                </div>
                            </div>

                            <hr style={{ border: 'none', borderTop: '1px solid var(--glass-border)' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Channel Name</label>
                                    <input type="text" defaultValue="SandTube Official" style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', color: 'white' }} />
                                </div>
                                <div>
                                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Handle</label>
                                    <input type="text" defaultValue="@sandtube_offcl" style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', color: 'white' }} />
                                </div>
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Bio</label>
                                <textarea rows={4} style={{ width: '100%', background: 'var(--bg-dark)', border: '1px solid var(--glass-border)', borderRadius: '8px', padding: '12px', color: 'white', resize: 'none' }} placeholder="Tell the world about your channel..." />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button style={{ background: 'transparent', border: 'none', color: 'white', padding: '10px 20px', cursor: 'pointer' }}>Cancel</button>
                                <button className="button-primary">Save Changes</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ marginBottom: '5px' }}>Private Subscriptions</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep all my subscriptions private.</p>
                                </div>
                                <div style={{ width: '50px', height: '26px', background: 'var(--primary)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ width: '20px', height: '20px', background: '#0a0a0a', borderRadius: '50%', position: 'absolute', right: '3px', top: '3px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ marginBottom: '5px' }}>Private Playlists</h3>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Keep all my saved playlists private.</p>
                                </div>
                                <div style={{ width: '50px', height: '26px', background: 'var(--surface-hover)', borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                                    <div style={{ width: '20px', height: '20px', background: 'white', borderRadius: '50%', position: 'absolute', left: '3px', top: '3px' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
