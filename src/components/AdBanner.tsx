import React, { useEffect, useState } from 'react';
import BackendAPI from '../services/backend.ts';

interface AdBannerProps {
    slot: string;
    format?: 'auto' | 'fluid' | 'rectangle';
    style?: React.CSSProperties;
}

const AdBanner: React.FC<AdBannerProps> = ({ slot, format = 'auto', style }) => {
    const [isPremium, setIsPremium] = useState(false);
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    useEffect(() => {
        if (user?.sub) {
            const unsub = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
            });
            return () => unsub();
        }
    }, [user?.sub]);

    useEffect(() => {
        if (!isPremium) {
            try {
                // @ts-ignore
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                console.error("AdSense Error:", e);
            }
        }
    }, [isPremium]);

    if (isPremium) return null;

    return (
        <div className="ad-container" style={{ margin: '20px 0', overflow: 'hidden', textAlign: 'center', ...style }}>
            <ins className="adsbygoogle"
                style={{ display: 'block', ...style }}
                data-ad-client="ca-pub-8821030883543483"
                data-ad-slot={slot}
                data-ad-format={format}
                data-full-width-responsive="true"></ins>
        </div>
    );
};

export default AdBanner;
