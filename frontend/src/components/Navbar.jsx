import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav style={styles.nav}>
            <div style={styles.logo}>CCTV Analytics</div>
            <div style={styles.links}>
                <Link
                    to="/"
                    style={{ ...styles.link, ...(location.pathname === '/' ? styles.active : {}) }}
                >
                    Home
                </Link>
                <Link
                    to="/dashboard"
                    style={{ ...styles.link, ...(location.pathname === '/dashboard' ? styles.active : {}) }}
                >
                    Dashboard
                </Link>
                <Link
                    to="/history"
                    style={{ ...styles.link, ...(location.pathname === '/history' ? styles.active : {}) }}
                >
                    History
                </Link>
                <Link
                    to="/settings"
                    style={{ ...styles.link, ...(location.pathname === '/settings' ? styles.active : {}) }}
                >
                    Settings
                </Link>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        backgroundColor: '#1a1a1a',
        borderBottom: '1px solid #333',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    logo: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        background: 'linear-gradient(to right, #646cff, #9089fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    links: {
        display: 'flex',
        gap: '2rem',
    },
    link: {
        textDecoration: 'none',
        color: '#aaa',
        fontSize: '1rem',
        transition: 'color 0.3s',
    },
    active: {
        color: '#fff',
        fontWeight: 'bold',
    }
};

export default Navbar;
