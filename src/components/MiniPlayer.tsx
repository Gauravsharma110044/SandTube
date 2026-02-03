import React from 'react';
import { X, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface MiniPlayerProps {
    videoId: string;
    onClose: () => void;
}

const MiniPlayer: React.FC<MiniPlayerProps> = ({ videoId, onClose }) => {
    const navigate = useNavigate();

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '320px',
            aspectRatio: '16/9',
            background: '#000',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.8), 0 0 20px rgba(226, 179, 90, 0.2)',
            zIndex: 2000,
            border: '1px solid var(--glass-border)',
            animation: 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
            {/* Header / Controls */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '40px',
                background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                padding: '0 10px',
                gap: '12px',
                zIndex: 10,
                opacity: 0,
                transition: 'opacity 0.3s ease',
            }} className="mini-player-header">
                <button
                    onClick={() => navigate(`/watch/${videoId}`)}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}
                    title="Expand"
                >
                    <Maximize2 size={18} />
                </button>
                <button
                    onClick={onClose}
                    style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '5px' }}
                    title="Close"
                >
                    <X size={18} />
                </button>
            </div>

            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1`}
                title="Mini Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            ></iframe>

            <style>{`
                .mini-player-header:hover, 
                div:hover > .mini-player-header {
                    opacity: 1 !important;
                }
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default MiniPlayer;
