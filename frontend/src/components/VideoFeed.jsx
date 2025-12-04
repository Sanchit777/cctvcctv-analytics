import React, { useState } from 'react';
import API_URL from '../config';

const VideoFeed = () => {
    const [error, setError] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const wsRef = React.useRef(null);
    const [processedImage, setProcessedImage] = useState(null);
    const [stats, setStats] = useState({ sent: 0, received: 0, status: 'Disconnected' });

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                // Explicitly play to ensure it starts
                videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
            setIsStreaming(true);
            setError(false);
            setStats(prev => ({ ...prev, status: 'Connecting...' }));

            // Connect WebSocket
            const wsUrl = API_URL.replace('http', 'ws') + '/ws/stream';
            console.log("Connecting to WS:", wsUrl);
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("WebSocket Connected");
                setStats(prev => ({ ...prev, status: 'Connected' }));

                // Start sending frames
                const interval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                        const context = canvasRef.current.getContext('2d');
                        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                            context.drawImage(videoRef.current, 0, 0, 640, 480);
                            canvasRef.current.toBlob((blob) => {
                                if (blob) {
                                    ws.send(blob);
                                    setStats(prev => ({ ...prev, sent: prev.sent + 1 }));
                                }
                            }, 'image/jpeg', 0.5); // Lower quality for speed
                        }
                    }
                }, 100); // 10 FPS
                ws.interval = interval;
            };

            ws.onmessage = (event) => {
                // Display processed frame
                const url = URL.createObjectURL(event.data);
                setProcessedImage(url);
                setStats(prev => ({ ...prev, received: prev.received + 1 }));
            };

            ws.onerror = (e) => {
                console.error("WebSocket Error:", e);
                setError(true);
                setStats(prev => ({ ...prev, status: 'Error' }));
            };

            ws.onclose = () => {
                setStats(prev => ({ ...prev, status: 'Disconnected' }));
            };

        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(true);
        }
    };

    const stopStreaming = () => {
        setIsStreaming(false);
        setStats(prev => ({ ...prev, status: 'Disconnected' }));
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

            {/* Debug Stats */}
            <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '0.5rem' }}>
                Status: {stats.status} | Sent: {stats.sent} | Recv: {stats.received}
            </div>

            <div className="video-wrapper">
                {/* Visible Video for debugging */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '160px', position: 'absolute', top: 10, left: 10, border: '1px solid red', zIndex: 10, display: isStreaming ? 'block' : 'none' }}
                />
                <canvas ref={canvasRef} width="640" height="480" style={{ display: 'none' }} />

                {!error ? (
                    <img
                        src={isStreaming && processedImage ? processedImage : `${API_URL}/video_feed`}
                        alt="Video Feed"
                        onError={() => !isStreaming && setError(true)}
                        style={{ width: '100%', borderRadius: '0.5rem', minHeight: '300px', backgroundColor: '#000' }}
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
