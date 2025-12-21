import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing">
      <div className="landing-container">
        <h1 className="landing-title">
          Welcome to <span className="brand-name">TrendMatch</span>
        </h1>
        <p className="landing-subtitle">
          Connect Fashion Brands with Influential Creators
        </p>
        <p className="landing-description">
          The ultimate platform for brand collaborations and influencer partnerships in the fashion industry.
        </p>
        
        <div className="landing-buttons">
          <Link to="/login" className="btn btn-primary">
            Login
          </Link>
          <Link to="/register" className="btn btn-secondary">
            Get Started
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">👗</div>
            <h3>For Brands</h3>
            <p>Post campaigns and find the perfect influencers</p>
          </div>
          <div className="feature">
            <div className="feature-icon">✨</div>
            <h3>For Influencers</h3>
            <p>Discover exciting brand collaboration opportunities</p>
          </div>
          <div className="feature">
            <div className="feature-icon">🤝</div>
            <h3>Seamless Matching</h3>
            <p>AI-powered recommendations for perfect partnerships</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
