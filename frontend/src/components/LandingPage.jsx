import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content">
                    <h1>
                        AI-Powered <br />
                        <span className="gradient-text">CCTV Analytics</span>
                    </h1>
                    <p className="hero-subtitle">
                        Detect Age and Gender in real-time with our advanced computer vision solution.
                        Transform your surveillance into actionable insights.
                    </p>
                    <div className="cta-group">
                        <Link to="/dashboard" className="btn btn-primary">
                            Launch Dashboard
                        </Link>
                        <a href="#features" className="btn btn-secondary">
                            Learn More
                        </a>
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="visual-circle"></div>
                    <div className="visual-card glass">
                        <div className="icon">👁️</div>
                        <span>Real-time Detection</span>
                    </div>
                    <div className="visual-card glass card-2">
                        <div className="icon">📊</div>
                        <span>Live Analytics</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features">
                <h2>Key Features</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Real-time Processing</h3>
                        <p>Instant analysis of video feeds with low latency using optimized OpenCV models.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">👥</div>
                        <h3>Demographics</h3>
                        <p>Accurate estimation of age groups and gender distribution for crowd analysis.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📈</div>
                        <h3>Visual Insights</h3>
                        <p>Interactive charts and graphs to visualize data trends instantly.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <p>© 2025 CCTV Analytics. Built with React & Python.</p>
            </footer>

            <style>{`
        .landing-container {
          min-height: 100vh;
          background-color: var(--bg-color);
          color: var(--text-color);
          overflow-x: hidden;
        }

        .gradient-text {
          background: linear-gradient(to right, #646cff, #9089fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Hero */
        .hero {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 80vh;
        }

        .hero-content {
          flex: 1;
          max-width: 600px;
        }

        .hero h1 {
          font-size: 4rem;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #aaa;
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          gap: 1rem;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 2rem;
          font-weight: bold;
          text-decoration: none;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(100, 108, 255, 0.3);
        }

        .btn-primary {
          background-color: var(--accent-color);
          color: white;
        }

        .btn-secondary {
          background-color: transparent;
          border: 2px solid var(--accent-color);
          color: var(--accent-color);
        }

        /* Hero Visual */
        .hero-visual {
          flex: 1;
          position: relative;
          height: 400px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        @media (max-width: 768px) {
          .hero {
            flex-direction: column;
            text-align: center;
            padding-top: 2rem;
          }
          
          .hero-visual {
            display: none;
          }

          .cta-group {
            justify-content: center;
          }
        }

        .visual-circle {
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(100,108,255,0.2) 0%, rgba(0,0,0,0) 70%);
          border-radius: 50%;
          position: absolute;
        }

        .visual-card {
          position: absolute;
          padding: 1rem 2rem;
          border-radius: 1rem;
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          gap: 1rem;
          animation: float 6s ease-in-out infinite;
        }

        .card-2 {
          top: 20%;
          right: 10%;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        /* Features */
        .features {
          padding: 4rem 2rem;
          background-color: #222;
        }

        .features h2 {
          text-align: center;
          font-size: 2.5rem;
          margin-bottom: 3rem;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .feature-card {
          background: var(--card-bg);
          padding: 2rem;
          border-radius: 1rem;
          transition: transform 0.3s;
        }

        .feature-card:hover {
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-card h3 {
          margin-bottom: 1rem;
          color: var(--accent-color);
        }

        .feature-card p {
          color: #aaa;
          line-height: 1.6;
        }

        /* Footer */
        .footer {
          padding: 2rem;
          text-align: center;
          color: #666;
          border-top: 1px solid #333;
        }
      `}</style>
        </div>
    );
};

export default LandingPage;
