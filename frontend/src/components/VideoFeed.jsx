import React, { useState } from 'react';
import API_URL from '../config';

const VideoFeed = () => {
    const [error, setError] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const wsRef = React.useRef(null);
    const [processedImage, setProcessedImage] = useState(null);

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setIsStreaming(true);
            setError(false);

            // Connect WebSocket
            const wsUrl = API_URL.replace('http', 'ws') + '/ws/stream';
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket Connected");
                // Start sending frames
                const interval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                        const context = canvasRef.current.getContext('2d');
                        context.drawImage(videoRef.current, 0, 0, 640, 480);
                        canvasRef.current.toBlob((blob) => {
                            if (blob) {
                                ws.send(blob);
                            }
                        }, 'image/jpeg', 0.7);
                    }
                }, 100); // 10 FPS
                ws.interval = interval;
            };

            ws.onmessage = (event) => {
                // Display processed frame
                const url = URL.createObjectURL(event.data);
                setProcessedImage(url);
            };

            ws.onerror = (e) => {
                console.error("WebSocket Error:", e);
                setError(true);
            };

        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(true);
        }
    };

    const stopStreaming = () => {
        setIsStreaming(false);
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        if (wsRef.current) {
            clearInterval(wsRef.current.interval);
            wsRef.current.close();
        }
    };

    React.useEffect(() => {
        return () => stopStreaming();
    }, []);

    return (
        <div className="card video-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Live Feed</h2>
                <button onClick={isStreaming ? stopStreaming : startStreaming} className="btn-primary">
                    {isStreaming ? 'Stop Camera' : 'Start Camera'}
                </button>
            </div>

            <div className="video-wrapper">
                {/* Hidden Video/Canvas for capture */}
                <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} width="640" height="480" />
                <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

                {!error ? (
                    <img
                        src={isStreaming && processedImage ? processedImage : `${API_URL}/video_feed`}
                        alt="Video Feed"
                        onError={() => !isStreaming && setError(true)}
                        style={{ width: '100%', borderRadius: '0.5rem' }}
                    />
                ) : (
                    <div className="error-message">
                        <p>Camera Stream Offline</p>
                        {!isStreaming && <button onClick={() => setError(false)}>Retry Connection</button>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoFeed;
