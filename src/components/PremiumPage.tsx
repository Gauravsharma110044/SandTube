import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Shield, Download, Play, Star, Lock, X, Smartphone, ArrowRight, ExternalLink } from 'lucide-react';
import BackendAPI from '../services/backend.ts';
import { notificationEngine } from '../engines/index.ts';

const PremiumPage: React.FC = () => {
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);
    const [currentTheme, setCurrentTheme] = useState<string | null>(null);
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<{ name: string, price: string, amount: number } | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    // Merchant UPI Config
    const MERCHANT_UPI_ID = "7834901357@fam";
    const MERCHANT_NAME = "SandTube Premium";

    useEffect(() => {
        if (user?.sub) {
            const unsubPremium = BackendAPI.subscribeToPremiumStatus(user.sub, (active) => {
                setIsPremium(active);
                setLoading(false);
            });
            const unsubTheme = BackendAPI.subscribeToUserPreference(user.sub, 'theme', (theme) => {
                setCurrentTheme(theme);
            });
            return () => {
                unsubPremium();
                unsubTheme();
            };
        } else {
            setLoading(false);
        }
    }, [user?.sub]);

    const handleThemeChange = async (theme: string | null) => {
        if (user?.sub) {
            await BackendAPI.saveUserPreference(user.sub, 'theme', theme);
        }
    };

    const handleSubscribe = (planName: string) => {
        if (!user) {
            notificationEngine.createNotification('upload', 'Error', 'Please sign in to subscribe');
            return;
        }
        const plans: { [key: string]: { price: string, amount: number } } = {
            'Individual': { price: '₹129', amount: 129 },
            'Family': { price: '₹189', amount: 189 },
            'Student': { price: '₹79', amount: 79 }
        };
        setSelectedPlan({ name: planName, ...plans[planName] });
        setIsCheckoutOpen(true);
    };

    const handleVerifyUPITransaction = async () => {
        if (!selectedPlan || !user) return;

        if (!transactionId || transactionId.length < 10) {
            notificationEngine.createNotification('upload', 'Invalid ID', 'Please enter a valid 12-digit UPI Transaction ID');
            return;
        }

        setIsProcessing(true);
        // Simulate a real-time verification of the UPI transfer
        setTimeout(async () => {
            try {
                await BackendAPI.subscribeToPremium(user.sub, selectedPlan.name);
                setIsPremium(true);
                setIsSuccess(true);
                setIsCheckoutOpen(false);
                setTransactionId(''); // Reset for next time

                setTimeout(() => {
                    setIsSuccess(false);
                    notificationEngine.createNotification('upload', 'Elite Upgrade', `Premium activated for ${user.name || 'User'}! 💎`);
                }, 3000);
            } catch (error) {
                notificationEngine.createNotification('upload', 'Error', 'Verification failed. Please contact support.');
            }
            setIsProcessing(false);
        }, 2000);
    };

    const upiUri = selectedPlan ? `upi://pay?pa=${MERCHANT_UPI_ID}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${selectedPlan.amount}&cu=INR&tn=${encodeURIComponent(selectedPlan.name + " Plan")}` : "";
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

    const features = [
        { icon: <Zap size={24} />, title: 'Ad-free experience', desc: 'Watch videos without interruptions from ads.' },
        { icon: <Download size={24} />, title: 'Background play', desc: 'Keep your music playing while using other apps.' },
        { icon: <Play size={24} />, title: 'Offline downloads', desc: 'Save videos for when you’re low on data or offline.' },
        { icon: <Shield size={24} />, title: 'SandTube Music Premium', desc: 'Ad-free music and background play.' },
        { icon: <Crown size={24} />, title: 'Exclusive Badge', desc: 'A gold crown badge next to your name.' },
        { icon: <Star size={24} />, title: '4K/HDR Access', desc: 'Highest quality streaming for premium members.' },
    ];

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>Loading...</div>;

    return (
        <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto', animation: 'fadeIn 0.8s ease' }}>
            {/* Success Overlay */}
            {isSuccess && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 3000, backdropFilter: 'blur(20px)', animation: 'fadeIn 0.5s ease'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '120px', height: '120px', background: 'linear-gradient(135deg, #00e676, #00c853)',
                            borderRadius: '50%', display: 'flex', alignItems: 'center',
                            justifyContent: 'center', margin: '0 auto 30px',
                            boxShadow: '0 0 40px rgba(0, 230, 118, 0.6)',
                            animation: 'bounceIn 0.8s cubic-bezier(0.68, -0.55, 0.265, 1.55)'
                        }}>
                            <Check size={70} color="white" />
                        </div>
                        <h2 style={{ fontSize: '3.5rem', fontWeight: '900', marginBottom: '15px', letterSpacing: '-1px' }}>SandTube Elite</h2>
                        <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', marginBottom: '30px' }}>Your premium journey starts now.</p>
                        <div className="pulse-button" style={{ display: 'inline-block', padding: '15px 40px', borderRadius: '50px', background: 'var(--primary)', color: 'white', fontWeight: 'bold' }}>
                            Enjoy Ad-Free Viewing
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <div style={{ display: 'inline-flex', padding: '12px 24px', borderRadius: '50px', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)', marginBottom: '24px', alignItems: 'center', gap: '8px', color: '#ffd700', fontSize: '0.9rem', fontWeight: 'bold' }}>
                    <Crown size={16} /> NEW: UPI INSTANT ACTIVATION
                </div>
                <h1 style={{ fontSize: '4rem', fontWeight: '900', marginBottom: '16px', letterSpacing: '-2px', background: 'linear-gradient(to bottom, #fff, #999)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Premium Redefined.
                </h1>
                <p style={{ fontSize: '1.3rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
                    Experience SandTube like never before. Pure speed, no ads, just your content.
                </p>
            </div>

            {/* Exclusive Themes Section */}
            {isPremium && (
                <div style={{ marginBottom: '80px', animation: 'fadeIn 1s ease' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '32px', textAlign: 'center' }}>Member Exclusive Themes</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '24px' }}>
                        {[
                            { id: null, label: 'Default', colors: ['#0a0a0a', '#e2b35a'] },
                            { id: 'aura', label: 'Aura Glow', colors: ['#0f0c29', '#9d50bb'] },
                            { id: 'cyberpunk', label: 'Cyberpunk', colors: ['#0d0208', '#00ff41'] },
                            { id: 'midnight', label: 'Midnight Gold', colors: ['#000000', '#ffd700'] },
                            { id: 'sunset', label: 'Sunset Red', colors: ['#2c0b0e', '#ff5f6d'] },
                        ].map((theme) => (
                            <div
                                key={theme.id || 'default'}
                                onClick={() => handleThemeChange(theme.id)}
                                style={{
                                    padding: '20px',
                                    borderRadius: '16px',
                                    background: `linear-gradient(135deg, ${theme.colors[0]}, #1a1a1a)`,
                                    border: `2px solid ${currentTheme === theme.id ? theme.colors[1] : 'transparent'}`,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    transform: currentTheme === theme.id ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: currentTheme === theme.id ? `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${theme.colors[1]}33` : 'none'
                                }}
                            >
                                <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'white', position: 'relative', zIndex: 1 }}>{theme.label}</div>
                                <div style={{ position: 'absolute', bottom: -15, right: -15, width: '60px', height: '60px', background: theme.colors[1], borderRadius: '50%', opacity: 0.2 }} />
                                {currentTheme === theme.id && (
                                    <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                                        <div style={{ background: 'white', borderRadius: '50%', padding: '2px' }}>
                                            <Check size={12} color={theme.colors[0]} strokeWidth={4} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '40px', marginBottom: '80px' }}>
                {/* Individual Plan */}
                <div className="glass-card plan-hover" style={{ padding: '60px 48px', position: 'relative', transition: '0.4s' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Individual</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '32px' }}>₹129<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '400' }}>/mo</span></div>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '48px' }}>
                        {['Ad-free videos', 'Offline downloads', 'Background play', 'Elite Badge included'].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                <div style={{ background: 'rgba(0, 230, 118, 0.1)', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} color="#00e676" strokeWidth={3} />
                                </div> {item}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => handleSubscribe('Individual')} className="button-primary" style={{ width: '100%', padding: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>Get Started</button>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '20px' }}>Instant UPI Checkout</div>
                </div>

                {/* Family Plan */}
                <div className="glass-card plan-hover highlight-plan" style={{ padding: '60px 48px', position: 'relative', border: '2px solid var(--primary)', transition: '0.4s' }}>
                    <div style={{ position: 'absolute', top: '-15px', left: '50%', transform: 'translateX(-50%)', background: 'var(--primary)', color: 'white', padding: '6px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '1px' }}>MOST POPULAR</div>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Family</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '32px' }}>₹189<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '400' }}>/mo</span></div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem' }}>Share the magic with up to 5 family members.</p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '48px' }}>
                        {['All individual features', 'Up to 5 accounts', 'Personal settings', 'Home sharing'].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                <div style={{ background: 'rgba(0, 230, 118, 0.1)', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} color="#00e676" strokeWidth={3} />
                                </div> {item}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => handleSubscribe('Family')} className="button-primary" style={{ width: '100%', padding: '20px', fontSize: '1.1rem', fontWeight: 'bold', boxShadow: '0 0 30px var(--primary-glow)' }}>Get Family Plan</button>
                </div>

                {/* Student Plan */}
                <div className="glass-card plan-hover" style={{ padding: '60px 48px', transition: '0.4s' }}>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '12px' }}>Student</h3>
                    <div style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '32px' }}>₹79<span style={{ fontSize: '1.2rem', color: 'var(--text-muted)', fontWeight: '400' }}>/mo</span></div>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem' }}>Elite features for students at a fraction of the cost.</p>
                    <ul style={{ listStyle: 'none', padding: 0, marginBottom: '48px' }}>
                        {['Full premium features', 'Student discount', 'Instant verification'].map(item => (
                            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                                <div style={{ background: 'rgba(0, 230, 118, 0.1)', borderRadius: '50%', padding: '4px' }}>
                                    <Check size={16} color="#00e676" strokeWidth={3} />
                                </div> {item}
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => handleSubscribe('Student')} className="button-primary" style={{ width: '100%', padding: '20px', fontSize: '1.1rem', fontWeight: 'bold' }}>Claim Discount</button>
                </div>
            </div>

            {/* UPI Direct Checkout Modal */}
            {isCheckoutOpen && selectedPlan && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 2000, backdropFilter: 'blur(15px)', animation: 'fadeIn 0.4s ease'
                }}>
                    <div className="glass-card" style={{
                        width: '100%', maxWidth: '440px', padding: '40px',
                        position: 'relative', border: '1px solid var(--glass-border)',
                        textAlign: 'center', overflow: 'hidden'
                    }}>
                        {/* Glow effect */}
                        <div style={{ position: 'absolute', top: '-100px', left: '50%', transform: 'translateX(-50%)', width: '300px', height: '300px', background: 'var(--primary)', filter: 'blur(100px)', opacity: 0.1, zIndex: 0 }} />

                        <button
                            onClick={() => setIsCheckoutOpen(false)}
                            style={{ position: 'absolute', top: '20px', right: '20px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', zIndex: 10 }}
                        >
                            <X size={24} />
                        </button>

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                                <div style={{
                                    width: '60px', height: '60px', background: 'rgba(56, 176, 0, 0.1)',
                                    borderRadius: '50%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'center', margin: '0 auto 16px'
                                }}>
                                    <Smartphone size={32} color="#33cc33" />
                                </div>
                                <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '4px' }}>Scan to Pay</h2>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pay ₹{selectedPlan.amount} via any UPI App</p>
                            </div>

                            {/* QR Code Section */}
                            <div style={{
                                background: 'white', padding: '15px', borderRadius: '16px',
                                border: '4px solid #f0f0f0', display: 'inline-block',
                                marginBottom: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
                            }}>
                                <img src={qrCodeUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px', display: 'block' }} />
                                <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#666', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                    <Shield size={10} /> BHIM UPI SECURED
                                </div>
                            </div>

                            <div style={{ marginBottom: '20px', textAlign: 'left' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                    Confirm Payment (12-digit Transaction ID)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter UPI Ref No. / Transaction ID"
                                    value={transactionId}
                                    onChange={(e) => setTransactionId(e.target.value)}
                                    style={{
                                        width: '100%', padding: '15px',
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                                        borderRadius: '12px', color: 'white', fontSize: '1rem', outline: 'none'
                                    }}
                                />
                            </div>

                            <div style={{ marginBottom: '24px', textAlign: 'left', background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Payment Details</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span>VPA</span>
                                    <span style={{ fontWeight: 'bold', color: 'white' }}>{MERCHANT_UPI_ID}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Plan</span>
                                    <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{selectedPlan.name} (Monthly)</span>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <a
                                    href={upiUri}
                                    className="button-primary"
                                    style={{
                                        width: '100%', padding: '16px', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', gap: '10px',
                                        textDecoration: 'none', color: 'white', fontWeight: 'bold'
                                    }}
                                >
                                    Pay via UPI App <ExternalLink size={16} />
                                </a>

                                <button
                                    onClick={handleVerifyUPITransaction}
                                    disabled={isProcessing}
                                    style={{
                                        width: '100%', padding: '16px',
                                        background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
                                        color: '#ffd700', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
                                    }}
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="spinner-gold" /> Verifying...
                                        </>
                                    ) : (
                                        <>I've Paid — Verify Now <ArrowRight size={16} /></>
                                    )}
                                </button>
                            </div>

                            <p style={{ marginTop: '20px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Membership activates automatically after successful payment verification.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounceIn {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.05); opacity: 1; }
                    70% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .spinner-gold {
                    width: 20px;
                    height: 20px;
                    border: 2px solid rgba(255,215,0,0.2);
                    border-top-color: #ffd700;
                    border-radius: 50%;
                    animation: spin 0.8s linear infinite;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
                .plan-hover:hover {
                    transform: translateY(-10px);
                    background: rgba(255,255,255,0.05);
                }
                .highlight-plan {
                    box-shadow: 0 20px 50px rgba(255, 69, 0, 0.15);
                }
                .pulse-button {
                    animation: pulse-glow 2s infinite;
                    cursor: pointer;
                }
                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(255, 69, 0, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(255, 69, 0, 0); }
                }
            `}</style>
        </div>
    );
};

export default PremiumPage;
