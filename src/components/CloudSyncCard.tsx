import React, { useState } from 'react';
import { backUpToCloud, restoreFromCloud, disconnectCloud } from '../services/cloud.ts';
import { auth } from '../config/firebaseCloud.ts';

// Explicit, user-controlled sync. Nothing is uploaded or merged until a button is tapped.
const CloudSyncCard: React.FC = () => {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState('');
    const [connected, setConnected] = useState(!!auth.currentUser);
    const run = async (fn: () => Promise<string>) => {
        setBusy(true); setMsg('');
        try { setMsg(await fn()); setConnected(!!auth.currentUser); }
        catch (e: any) { setMsg('Failed: ' + (e?.code || e?.message || 'unknown error')); }
        finally { setBusy(false); }
    };
    const btn: React.CSSProperties = { background: 'var(--surface)', border: 'none', color: 'white', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontSize: '0.85rem' };
    return (
        <div className="glass-morphism" style={{ padding: '16px', borderRadius: '16px', marginBottom: '24px' }}>
            <div style={{ fontWeight: 600, marginBottom: '6px' }}>SandTube cloud sync</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '12px' }}>
                Optional. Your History, Watch Later and Playlists stay on this device unless you tap Back up. Only you can read your backup. This never posts or likes anything on YouTube.
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button disabled={busy} style={btn} onClick={() => run(async () => { const r = await backUpToCloud(); return `Backed up ${r.uploaded.watchLater} Watch Later, ${r.uploaded.history} History, ${r.uploaded.playlists} playlists.`; })}>Back up this device</button>
                <button disabled={busy} style={btn} onClick={() => run(async () => { const r = await restoreFromCloud(); return `Added ${r.watchLater} Watch Later, ${r.history} History, ${r.playlists} playlists to this device. Nothing was deleted. Reload to see them.`; })}>Restore to this device</button>
                {connected && <button disabled={busy} style={btn} onClick={() => run(async () => { await disconnectCloud(); return 'Disconnected from cloud account.'; })}>Disconnect</button>}
            </div>
            {msg && <div style={{ marginTop: '10px', fontSize: '0.85rem' }}>{msg}</div>}
        </div>
    );
};
export default CloudSyncCard;
