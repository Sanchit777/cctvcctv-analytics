import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import axios from 'axios';
import API_URL from '../config';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StatsChart = () => {
    const [stats, setStats] = useState(null);

    useEffect(() => {
        const interval = setInterval(() => {
            axios.get(`${API_URL}/stats`)
                .then(response => {
                    setStats(response.data);
                })
                .catch(err => console.error(err));
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    if (!stats) return <div className="card">Loading stats...</div>;

    const genderData = {
        labels: ['Male', 'Female'],
        datasets: [
            {
                data: [stats.gender_distribution.Male, stats.gender_distribution.Female],
                backgroundColor: ['#36A2EB', '#FF6384'],
                hoverBackgroundColor: ['#36A2EB', '#FF6384'],
                borderWidth: 0,
            },
        ],
    };

    const ageLabels = ['(0-2)', '(4-6)', '(8-12)', '(15-20)', '(25-32)', '(38-43)', '(48-53)', '(60-100)'];
    const ageDataValues = ageLabels.map(label => stats.age_distribution[label] || 0);

    const ageData = {
        labels: ageLabels,
        datasets: [
            {
                label: 'People Count',
                data: ageDataValues,
                backgroundColor: '#646cff',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { color: '#fff' }
            },
            title: { display: false }
        },
        scales: {
            y: {
                ticks: { color: '#aaa' },
                grid: { color: '#333' }
            },
            x: {
                ticks: { color: '#aaa' },
                grid: { color: '#333' }
            }
        }
    };

    return (
        <div className="stats-container">
            <div className="card">
                <h2>Current Detection</h2>
                <div className="stat-card">
                    <div className="stat-value">{stats.total_people}</div>
                    <div className="stat-label">People Detected</div>
                </div>
            </div>

            <div className="card">
                <h2>Gender Distribution</h2>
                <div style={{ height: '200px', display: 'flex', justifyContent: 'center' }}>
                    <Doughnut data={genderData} options={{ maintainAspectRatio: false, plugins: { legend: { labels: { color: '#fff' } } } }} />
                </div>
            </div>

            <div className="card">
                <h2>Age Distribution</h2>
                <Bar data={ageData} options={options} />
            </div>
        </div>
    );
};

export default StatsChart;
