import React, { useState } from 'react';
import API_URL from '../config';

const VideoFeed = () => {
    const [error, setError] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const videoRef = React.useRef(null);
    const canvasRef = React.useRef(null); // For sending frames
    const overlayRef = React.useRef(null); // For drawing boxes
    const wsRef = React.useRef(null);

    const startStreaming = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play().catch(e => console.error("Error playing video:", e));
            }
            setIsStreaming(true);
            setError(false);

            // Connect WebSocket
            const wsUrl = API_URL.replace('http', 'ws') + '/ws/stream';
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                // Start sending frames
                const interval = setInterval(() => {
                    if (ws.readyState === WebSocket.OPEN && videoRef.current && canvasRef.current) {
                        const context = canvasRef.current.getContext('2d');
                        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
                            // Downscale to 320x240 for faster transmission
                            context.drawImage(videoRef.current, 0, 0, 320, 240);
                            canvasRef.current.toBlob((blob) => {
                                if (blob) {
                                    ws.send(blob);
                                }
                            }, 'image/jpeg', 0.4);
                        }
                    }
                }, 200); // 5 FPS (Sufficient for detection updates)
                ws.interval = interval;
            };

            ws.onmessage = (event) => {
                try {
                    const results = JSON.parse(event.data);
                    drawDetections(results);
                } catch (e) {
                    console.error("Error parsing WS data:", e);
                }
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

    const drawDetections = (results) => {
        if (!overlayRef.current || !videoRef.current) return;
        const ctx = overlayRef.current.getContext('2d');
        const videoWidth = videoRef.current.videoWidth;
        const videoHeight = videoRef.current.videoHeight;

        // Match overlay size to video
        overlayRef.current.width = videoWidth;
        overlayRef.current.height = videoHeight;

        ctx.clearRect(0, 0, videoWidth, videoHeight);

        if (!results) return;

        // Scaling factors (Detection was done on 320x240, but video might be 640x480)
        // Actually, the backend receives 320x240, so coordinates are in that space.
        // We need to scale them up to the display size.
        const scaleX = videoWidth / 320;
        const scaleY = videoHeight / 240;

        results.forEach(res => {
            const [x1, y1, x2, y2] = res.box;
            const label = `${res.gender}, ${res.age}`;

            // Scale coordinates
            const sx1 = x1 * scaleX;
            const sy1 = y1 * scaleY;
            const sx2 = x2 * scaleX;
            const sy2 = y2 * scaleY;

            // Draw Box
            ctx.strokeStyle = '#00FF00';
            ctx.lineWidth = 3;
            ctx.strokeRect(sx1, sy1, sx2 - sx1, sy2 - sy1);

            // Draw Label Background
            ctx.fillStyle = '#00FF00';
            const textWidth = ctx.measureText(label).width;
            ctx.fillRect(sx1, sy1 - 25, textWidth + 10, 25);

            // Draw Text
            ctx.fillStyle = '#000000';
            ctx.font = '16px Arial';
            ctx.fillText(label, sx1 + 5, sy1 - 5);
        });
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
        // Clear overlay
        if (overlayRef.current) {
            const ctx = overlayRef.current.getContext('2d');
            ctx.clearRect(0, 0, overlayRef.current.width, overlayRef.current.height);
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

            <div className="video-wrapper" style={{ position: 'relative', minHeight: '300px', backgroundColor: '#000', borderRadius: '0.5rem', overflow: 'hidden' }}>
                {/* Visible Local Video */}
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: isStreaming ? 'block' : 'none' }}
                />

                {/* Overlay Canvas for Detections */}
                <canvas
                    ref={overlayRef}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                />

                {/* Hidden Canvas for sending frames */}
                <canvas ref={canvasRef} width="320" height="240" style={{ display: 'none' }} />

                {!isStreaming && !error && (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: '#666' }}>
                        <p>Click "Start Camera" to begin</p>
                    </div>
                )}

                {error && (
                    <div className="error-message" style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <p>Camera Stream Offline</p>
                        <button onClick={() => setError(false)}>Retry Connection</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoFeed;
