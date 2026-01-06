import React from 'react';
import './InfluencerProfileModal.css';

const InfluencerProfileModal = ({ influencer, onClose }) => {
  if (!influencer) return null;

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="profile-modal-overlay" onClick={onClose}>
      <div className="profile-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={onClose}>×</button>

        <div className="profile-modal-header">
          <div className="profile-avatar-large">
            {influencer.user?. name?.[0]?.toUpperCase() || 'I'}
          </div>
          <div className="profile-header-info">
            <h2>{influencer.user?.name || 'Influencer'}</h2>
            <p className="profile-email">{influencer.user?.email}</p>
            <div className="profile-tier-badge" style={{
              background: `${getTierColor(influencer.tier)}20`,
              color: getTierColor(influencer.tier),
              border: `2px solid ${getTierColor(influencer.tier)}`
            }}>
              {influencer.tier} Influencer
            </div>
          </div>
        </div>

        <div className="profile-modal-body">
          {/* Bio Section */}
          <div className="profile-section">
            <h3>📝 About</h3>
            <p>{influencer.bio || 'No bio provided'}</p>
          </div>

          {/* Stats Section */}
          <div className="profile-section">
            <h3>📊 Statistics</h3>
            <div className="profile-stats-grid">
              <div className="profile-stat-card">
                <span className="stat-icon">👥</span>
                <div>
                  <h4>{formatNumber(influencer.followers)}</h4>
                  <p>Followers</p>
                </div>
              </div>
              <div className="profile-stat-card">
                <span className="stat-icon">💚</span>
                <div>
                  <h4>{influencer.engagement}%</h4>
                  <p>Engagement Rate</p>
                </div>
              </div>
              <div className="profile-stat-card">
                <span className="stat-icon">❤️</span>
                <div>
                  <h4>{formatNumber(influencer.avgLikes)}</h4>
                  <p>Avg Likes</p>
                </div>
              </div>
              <div className="profile-stat-card">
                <span className="stat-icon">📍</span>
                <div>
                  <h4>{influencer.location || 'N/A'}</h4>
                  <p>Location</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content Niches */}
          <div className="profile-section">
            <h3>🎯 Content Niches</h3>
            <div className="profile-niches">
              {influencer.niches?.map(niche => (
                <span key={niche} className="profile-niche-tag">{niche}</span>
              ))}
            </div>
          </div>

          {/* Audience Demographics */}
          <div className="profile-section">
            <h3>👥 Audience Demographics</h3>
            <div className="demographics-grid">
              <div className="demo-item">
                <strong>Age Range:</strong>
                <span>{influencer. ageRange || 'Not specified'}</span>
              </div>
              <div className="demo-item">
                <strong>Top Countries:</strong>
                <span>{influencer.topCountries || 'Not specified'}</span>
              </div>
              <div className="demo-item">
                <strong>Gender Split:</strong>
                <div className="gender-bars">
                  <div className="gender-bar">
                    <span>Female</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill female" 
                        style={{ width: `${influencer.genderFemale}%` }}
                      />
                    </div>
                    <span>{influencer.genderFemale}%</span>
                  </div>
                  <div className="gender-bar">
                    <span>Male</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill male" 
                        style={{ width: `${influencer.genderMale}%` }}
                      />
                    </div>
                    <span>{influencer.genderMale}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="profile-section">
            <h3>💰 Collaboration Pricing</h3>
            <div className="pricing-card">
              <span className="price-range">
                ${influencer.collabCostMin} - ${influencer.collabCostMax}
              </span>
              <p>Per collaboration</p>
            </div>
          </div>
        </div>

        <div className="profile-modal-footer">
          <button className="btn-contact-influencer">
            📧 Send Collaboration Request
          </button>
        </div>
      </div>
    </div>
  );
};

const getTierColor = (tier) => {
  const colors = {
    'Nano': '#9CA3AF',
    'Micro': '#60A5FA',
    'Mid-tier': '#00D084',
    'Macro': '#F59E0B',
    'Mega': '#EF4444'
  };
  return colors[tier] || '#9CA3AF';
};

export default InfluencerProfileModal;
