import React from 'react';
import './Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Track visitor behavior and engagement</p>
      </div>

      <div className="analytics-grid">
        
        <div className="analytics-card full-width">
          <h2>🔥 Live Heatmaps & Session Recordings</h2>
          <p>Powered by Microsoft Clarity</p>
          <a 
            href="https://clarity.microsoft.com/projects/view/ux5mlu21j7/dashboard" 
            target="_blank" 
            rel="noopener noreferrer"
            className="clarity-btn"
          >
            View Full Clarity Dashboard →
          </a>
        </div>

        <div className="analytics-card">
          <h3>👥 Total Visitors</h3>
          <p className="stat-number">-</p>
          <p className="stat-label">Check Clarity for live data</p>
        </div>

        <div className="analytics-card">
          <h3>🖱️ Click Events</h3>
          <p className="stat-number">-</p>
          <p className="stat-label">Tracked via heatmaps</p>
        </div>

        <div className="analytics-card">
          <h3>⏱️ Avg Session</h3>
          <p className="stat-number">-</p>
          <p className="stat-label">See Clarity dashboard</p>
        </div>

        <div className="analytics-card">
          <h3>📍 Top Pages</h3>
          <p className="stat-number">-</p>
          <p className="stat-label">View in Clarity</p>
        </div>

      </div>

      <div className="analytics-info">
        <h3>✅ Analytics Features Implemented</h3>
        <ul>
          <li>✅ Visitor tracking (Microsoft Clarity)</li>
          <li>✅ Interaction heatmaps</li>
          <li>✅ Session recordings</li>
          <li>✅ Scroll depth tracking</li>
          <li>✅ Click maps</li>
          <li>✅ Traffic sources</li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;
