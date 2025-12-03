import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import VideoFeed from './components/VideoFeed';
import StatsChart from './components/StatsChart';
import History from './components/History';
import Settings from './components/Settings';

const Dashboard = () => (
  <div className="dashboard-container">
    <div className="header">
      <h1>CCTV Analytics Dashboard</h1>
      <p>Real-time Age & Gender Detection</p>
    </div>

    <div className="grid-layout">
      <VideoFeed />
      <StatsChart />
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
