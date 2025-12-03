import React, { useState } from 'react';
import axios from 'axios';
import API_URL from '../config';

const Settings = () => {
    const [rtspUrl, setRtspUrl] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        axios.post(`${API_URL}/settings`, { rtsp_url: rtspUrl })
            .then(response => {
                setMessage('Camera URL updated successfully!');
                setRtspUrl('');
            })
            .catch(err => {
                console.error(err);
                setMessage('Failed to update settings.');
            });
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1>Settings</h1>
                <p>Configure your CCTV application</p>
            </div>

            <div className="card" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>RTSP Camera URL</label>
                        <input
                            type="text"
                            value={rtspUrl}
                            onChange={(e) => setRtspUrl(e.target.value)}
                            placeholder="rtsp://user:pass@ip:port/stream"
                            style={styles.input}
                        />
                        <small style={{ color: '#666', marginTop: '0.5rem', display: 'block' }}>
                            Leave empty to use default webcam.
                        </small>
                    </div>

                    <button type="submit" className="btn btn-primary" style={styles.button}>
                        Save Configuration
                    </button>

                    {message && <p style={styles.message}>{message}</p>}
                </form>
            </div>
        </div>
    );
};

const styles = {
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '0.5rem',
        color: '#aaa',
    },
    input: {
        padding: '0.8rem',
        borderRadius: '0.5rem',
        border: '1px solid #444',
        background: '#1a1a1a',
        color: '#fff',
        fontSize: '1rem',
    },
    button: {
        padding: '1rem',
        background: '#646cff',
        color: 'white',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: 'bold',
    },
    message: {
        textAlign: 'center',
        color: '#4caf50',
    }
};

export default Settings;
