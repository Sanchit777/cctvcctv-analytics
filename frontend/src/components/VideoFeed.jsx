import React, { useState } from 'react';
import API_URL from '../config';

const VideoFeed = () => {
    const [error, setError] = useState(false);

    return (
        <div className="card video-container">
            <h2>Live Feed</h2>
            <div className="video-wrapper">
                {!error ? (
                    <img
                        src={`${API_URL}/video_feed`}
                        alt="Video Feed"
                        onError={() => setError(true)}
                        style={{ width: '100%', borderRadius: '0.5rem' }}
                    />
                ) : (
                    <div className="error-message">
                        <p>Camera Stream Offline</p>
                        <button onClick={() => setError(false)}>Retry Connection</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoFeed;
