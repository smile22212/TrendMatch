import React, { useState, useEffect } from 'react';
import instagramService from '../../services/instagramService';
import './InstagramProfile.css';

const InstagramProfile = ({ userId }) => {
  const [instagramData, setInstagramData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadInstagramData();
  }, [userId]);

  const loadInstagramData = async () => {
    // Try to load saved Instagram data from localStorage
    const savedData = localStorage.getItem(`instagram_${userId}`);
    if (savedData) {
      setInstagramData(JSON.parse(savedData));
    }
  };

  const handleConnect = async (e) => {
    e.preventDefault();
    if (! username.trim()) {
      setError('Please enter your Instagram username');
      return;
    }

    setConnecting(true);
    setError('');

    try {
      const data = await instagramService.connectAccount(username);
      setInstagramData(data);
      
      // Save to localStorage
      localStorage.setItem(`instagram_${userId}`, JSON.stringify(data));
      
      setUsername('');
    } catch (err) {
      setError('Failed to connect Instagram account');
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setInstagramData(null);
    localStorage.removeItem(`instagram_${userId}`);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (! instagramData) {
    return (
      <div className="instagram-connect">
        <div className="connect-card">
          <div className="instagram-icon">📸</div>
          <h2>Connect Your Instagram</h2>
          <p>Link your Instagram account to show brands your reach and engagement</p>
          
          <form onSubmit={handleConnect} className="connect-form">
            <div className="input-group">
              <span className="input-prefix">@</span>
              <input
                type="text"
                placeholder="Enter your Instagram username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={connecting}
              />
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <button 
              type="submit" 
              className="btn-connect"
              disabled={connecting}
            >
              {connecting ? '🔄 Connecting...' :  '✨ Connect Instagram'}
            </button>
          </form>

          <div className="connect-info">
            <p>✅ Increase your visibility to brands</p>
            <p>✅ Show real-time follower count</p>
            <p>✅ Display engagement metrics</p>
            <p>✅ Auto-fill your profile details</p>
          </div>
        </div>
      </div>
    );
  }

  const tier = instagramService.getInfluencerTier(instagramData.followersCount);
  const costEstimate = instagramService.estimateCost(
    instagramData.followersCount,
    instagramData.engagementRate
  );

  return (
    <div className="instagram-profile">
      {/* Header */}
      <div className="ig-header">
        <div className="ig-avatar-section">
          <img 
            src={instagramData. profilePicture} 
            alt={instagramData.username}
            className="ig-avatar"
          />
          {instagramData.verified && (
            <div className="verified-badge">✓</div>
          )}
        </div>

        <div className="ig-info">
          <div className="ig-username-row">
            <h2>@{instagramData.username}</h2>
            <span className="ig-tier" style={{ color: tier.color }}>
              {tier.tier} Influencer
            </span>
          </div>
          <h3>{instagramData.fullName}</h3>
          <p className="ig-bio">{instagramData.biography}</p>
          {instagramData.website && (
            <a 
              href={`https://${instagramData.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ig-website"
            >
              🔗 {instagramData.website}
            </a>
          )}
        </div>

        <button onClick={handleDisconnect} className="btn-disconnect">
          Disconnect
        </button>
      </div>

      {/* Stats Grid */}
      <div className="ig-stats-grid">
        <div className="ig-stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{formatNumber(instagramData.followersCount)}</div>
          <div className="stat-label">Followers</div>
        </div>

        <div className="ig-stat-card">
          <div className="stat-icon">📸</div>
          <div className="stat-value">{formatNumber(instagramData.postsCount)}</div>
          <div className="stat-label">Posts</div>
        </div>

        <div className="ig-stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{instagramData.engagementRate}%</div>
          <div className="stat-label">Engagement Rate</div>
        </div>

        <div className="ig-stat-card">
          <div className="stat-icon">❤️</div>
          <div className="stat-value">{formatNumber(instagramData.averageLikes)}</div>
          <div className="stat-label">Avg. Likes</div>
        </div>
      </div>

      {/* Niche Tags */}
      <div className="ig-niches">
        <h4>Content Niches</h4>
        <div className="niche-tags">
          {instagramData.niche.map((niche, index) => (
            <span key={index} className="niche-tag">{niche}</span>
          ))}
        </div>
      </div>

      {/* Estimated Collaboration Cost */}
      <div className="ig-pricing">
        <h4>💰 Estimated Collaboration Cost</h4>
        <div className="price-range">
          <span className="price">${costEstimate.min. toLocaleString()}</span>
          <span className="price-separator">-</span>
          <span className="price">${costEstimate.max.toLocaleString()}</span>
        </div>
        <p className="price-note">*Based on follower count and engagement rate</p>
      </div>

      {/* Top Posts */}
      {instagramData.topPosts && instagramData.topPosts. length > 0 && (
        <div className="ig-top-posts">
          <h4>🔥 Top Performing Posts</h4>
          <div className="posts-grid">
            {instagramData.topPosts.map((post) => (
              <div key={post.id} className="post-card">
                <img src={post.imageUrl} alt="Post" />
                <div className="post-overlay">
                  <div className="post-stat">
                    <span>❤️ {formatNumber(post.likes)}</span>
                    <span>💬 {formatNumber(post.comments)}</span>
                  </div>
                </div>
                <p className="post-caption">{post.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demographics */}
      <div className="ig-demographics">
        <h4>👥 Audience Demographics</h4>
        <div className="demo-grid">
          <div className="demo-card">
            <div className="demo-label">Age Range</div>
            <div className="demo-value">{instagramData.demographics. ageRange}</div>
          </div>
          
          <div className="demo-card">
            <div className="demo-label">Top Countries</div>
            <div className="demo-value">
              {instagramData.demographics.topCountries.join(', ')}
            </div>
          </div>
          
          <div className="demo-card">
            <div className="demo-label">Gender Split</div>
            <div className="gender-chart">
              <div className="gender-bar">
                <div 
                  className="gender-female" 
                  style={{ width: `${instagramData.demographics.genderSplit. female}%` }}
                >
                  {instagramData.demographics.genderSplit.female}%
                </div>
                <div 
                  className="gender-male" 
                  style={{ width: `${instagramData.demographics.genderSplit.male}%` }}
                >
                  {instagramData.demographics. genderSplit.male}%
                </div>
              </div>
              <div className="gender-labels">
                <span>Female</span>
                <span>Male</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ig-footer">
        <p>📅 Last updated: {new Date(instagramData.lastUpdated).toLocaleDateString()}</p>
        <button onClick={handleConnect} className="btn-refresh">
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
};

export default InstagramProfile;
