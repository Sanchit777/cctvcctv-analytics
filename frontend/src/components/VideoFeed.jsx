import React, { useState } from 'react';
import API_URL from '../config';

const VideoFeed = () => {
    style = {{ width: '100%', borderRadius: '0.5rem', minHeight: '300px', backgroundColor: '#000' }
}
                    />
                ) : (
    <div className="error-message">
        <p>Camera Stream Offline</p>
        {!isStreaming && <button onClick={() => setError(false)}>Retry Connection</button>}
    </div>
)}
            </div >
        </div >
    );
};

export default VideoFeed;
