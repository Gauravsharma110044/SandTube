import React from 'react';
import { Crown } from 'lucide-react';

// Premium is not available: no payment provider or entitlement backend is connected.
// This page intentionally offers no plans, prices or purchase buttons.
const PremiumPage: React.FC = () => (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '60px 20px', textAlign: 'center' }}>
        <Crown size={40} color="#ffd700" />
        <h1 style={{ fontSize: '2rem', margin: '16px 0 12px' }}>SandTube Premium is not available</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
            There are no Premium plans right now. Payments are not connected, so nothing can be bought or activated,
            and you will not be charged. Everything in SandTube currently works without Premium.
        </p>
    </div>
);

export default PremiumPage;
