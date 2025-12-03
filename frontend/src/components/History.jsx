import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import API_URL from '../config';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const History = () => {
    const [dailyStats, setDailyStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        fetchDailyStats(selectedDate);
    }, [selectedDate]);

    const fetchDailyStats = (date) => {
        setLoading(true);
        axios.get(`${API_URL}/history/daily_stats?date=${date}`)
            .then(response => {
                setDailyStats(response.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    };

    const getAgeChartData = () => {
        if (!dailyStats || !dailyStats.age_breakdown) return null;

        const labels = Object.keys(dailyStats.age_breakdown);
        const data = Object.values(dailyStats.age_breakdown);

        return {
            labels,
            datasets: [
                {
                    label: 'People Count by Age',
                    data: data,
                    backgroundColor: '#646cff',
                },
            ],
        };
    };

    const getGenderChartData = () => {
        if (!dailyStats || !dailyStats.gender_breakdown) return null;

        const labels = Object.keys(dailyStats.gender_breakdown);
        const data = Object.values(dailyStats.gender_breakdown);

        return {
            labels,
            datasets: [
                {
                    label: 'Gender Distribution',
                    data: data,
                    backgroundColor: ['#36A2EB', '#FF6384'],
                    hoverBackgroundColor: ['#36A2EB', '#FF6384'],
                    borderWidth: 0,
                },
            ],
        };
    };

    return (
        <div className="dashboard-container">
            <div className="header">
                <h1>Detection History</h1>
                <p>Analyze past detection data</p>
            </div>

            <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <label style={{ color: '#aaa' }}>Select Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    style={styles.dateInput}
                />
            </div>

            {loading ? (
                <div className="card"><p>Loading stats...</p></div>
            ) : dailyStats ? (
                <div className="card">
                    <h2>Summary for {dailyStats.date}</h2>
                    <div className="grid-layout">
                        <div className="stats-column">
                            <div className="stat-card">
                                <div className="stat-value">{dailyStats.total_detections}</div>
                                <div className="stat-label">Total Detections</div>
                            </div>
                            <div className="chart-container">
                                <h3>Gender Distribution</h3>
                                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                                    {getGenderChartData() && <Doughnut data={getGenderChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }} />}
                                </div>
                            </div>
                        </div>

                        <div className="chart-container">
                            <h3>Age Breakdown</h3>
                            <div style={{ height: '300px' }}>
                                {getAgeChartData() && <Bar data={getAgeChartData()} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }} />}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="card"><p>No data available for this date.</p></div>
            )}
        </div>
    );
};

const styles = {
    dateInput: {
        padding: '0.5rem',
        borderRadius: '0.25rem',
        border: '1px solid #444',
        background: '#222',
        color: '#fff',
        fontSize: '1rem',
    }
};

export default History;
