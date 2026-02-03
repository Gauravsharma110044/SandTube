import React from 'react';

const VideoPlayer: React.FC<{ videoId: string }> = ({ videoId }) => {
    return (
        <div
            className="video-player-container"
            style={{
                width: '100%',
                aspectRatio: '16/9',
                background: '#000',
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            }}
        >
            <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: 'none' }}
            ></iframe>
        </div>
    );
};

export default VideoPlayer;
