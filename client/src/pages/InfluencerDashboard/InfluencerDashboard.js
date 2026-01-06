import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './InfluencerDashboard.css';

const InfluencerDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('browse');
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [applicationMessage, setApplicationMessage] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    minBudget: '',
    maxBudget: '',
    sortBy: 'newest'
  });

  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    bio: 'Fashion influencer with 50K followers on Instagram',
    location: 'United States',
    followers: 88500,
    engagement: 8.2,
    avgLikes: 3800,
    collabCostMin: 886,
    collabCostMax: 1330,
    niches: ['Fashion', 'Lifestyle', 'Beauty', 'Travel'],
    ageRange: '18-34',
    topCountries: 'United States, United Kingdom, Canada',
    genderFemale: 60,
    genderMale: 40
  });

  useEffect(() => {
    if (! user || user.role !== 'Influencer') {
      navigate('/login');
    } else {
      fetchCampaigns();
      fetchApplications();
    }
  }, [user, navigate]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { 'x-auth-token': token }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage. getItem('token');
      const res = await axios.get('http://localhost:5001/api/applications/my-applications', {
        headers:  { 'x-auth-token': token }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const handleApply = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage. getItem('token');
      await axios.post(
        'http://localhost:5001/api/applications',
        {
          campaignId: selectedCampaign._id,
          message: applicationMessage
        },
        { headers: { 'x-auth-token': token } }
      );
      setShowApplyModal(false);
      setApplicationMessage('');
      setSelectedCampaign(null);
      fetchApplications();
      alert('✅ Application submitted successfully!');
    } catch (err) {
      console.error('Error applying:', err);
      alert('❌ Error submitting application');
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    // TODO: Save to backend when profile model is ready
    setShowEditModal(false);
    alert('✅ Profile updated successfully!');
  };

  const toggleNiche = (niche) => {
    setProfileData(prev => ({
      ...prev,
      niches: prev.niches. includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche]
    }));
  };

  const filteredCampaigns = campaigns. filter(campaign => {
    if (filters.search && !campaign. title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.minBudget && campaign.budget < parseInt(filters.minBudget)) return false;
    if (filters. maxBudget && campaign.budget > parseInt(filters.maxBudget)) return false;
    return true;
  }).sort((a, b) => {
    if (filters.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (filters.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (filters.sortBy === 'budget-high') return b.budget - a.budget;
    if (filters.sortBy === 'budget-low') return a.budget - b.budget;
    return 0;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      accepted:  '#00D084',
      rejected: '#EF4444'
    };
    return colors[status] || '#9CA3AF';
  };

  const availableNiches = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming', 'Music', 'Art'];

  return (
    <div className="influencer-dashboard">
      <aside className="sidebar">
        <div className="brand-logo">
          <h2>TrendMatch</h2>
          <p className="subtitle">Influencer Dashboard</p>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'browse' ? 'active' : ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <span className="nav-icon">🔍</span>
            Browse Campaigns
          </button>

          <button
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-icon">📋</span>
            My Applications
            {stats.total > 0 && <span className="badge">{stats.total}</span>}
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' :  ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">👤</span>
            Profile
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {/* BROWSE CAMPAIGNS TAB */}
        {activeTab === 'browse' && (
          <div className="browse-section">
            <div className="page-header">
              <div>
                <h1>Browse Campaigns</h1>
                <p className="page-subtitle">Discover exciting brand collaboration opportunities</p>
              </div>
            </div>

            <div className="search-section">
              <input
                type="text"
                placeholder="🔍 Search campaigns..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="search-input-pro"
              />
            </div>

            <div className="filters-horizontal">
              <div className="filter-group-inline">
                <label>Min Budget ($)</label>
                <input
                  type="number"
                  placeholder="500"
                  value={filters. minBudget}
                  onChange={(e) => setFilters({ ...filters, minBudget: e.target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Max Budget ($)</label>
                <input
                  type="number"
                  placeholder="5000"
                  value={filters.maxBudget}
                  onChange={(e) => setFilters({ ...filters, maxBudget: e.target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Sort By</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="filter-input-small"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="budget-high">Budget:  High to Low</option>
                  <option value="budget-low">Budget: Low to High</option>
                </select>
              </div>

              <button
                className="btn-reset-pro"
                onClick={() => setFilters({ search: '', minBudget: '', maxBudget: '', sortBy: 'newest' })}
              >
                🔄 Reset
              </button>
            </div>

            <div className="results-count">
              <h3>Found {filteredCampaigns.length} Campaigns</h3>
            </div>

            {loading ?  (
              <div className="loading">Loading campaigns...</div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No campaigns found</h3>
                <p>Try adjusting your filters</p>
              </div>
            ) : (
              <div className="campaigns-grid-pro">
                {filteredCampaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-card-inf">
                    <div className="campaign-brand">
                    <div className="brand-avatar">{(campaign.brand && campaign.brand.name) ? campaign.brand.name[0] :  'B'}</div>
                      <div>
                        <h4>{campaign.brand?.name || 'Brand'}</h4>
                        <p className="brand-email">{campaign.brand?.email}</p>
                      </div>
                    </div>

                    <h3 className="campaign-title">{campaign.title}</h3>
                    <p className="campaign-description">{campaign.description}</p>

                    <div className="campaign-meta-inf">
                      <div className="meta-item">
                        <span className="meta-icon">💰</span>
                        <span className="meta-value">${campaign.budget}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-value">
                          {new Date(campaign.deadline).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {campaign.requirements && (
                      <div className="campaign-requirements-inf">
                        <strong>Requirements:</strong>
                        <p>{campaign. requirements}</p>
                      </div>
                    )}

                    <button
                      className="btn-apply"
                      onClick={() => {
                        setSelectedCampaign(campaign);
                        setShowApplyModal(true);
                      }}
                    >
                      Apply Now
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY APPLICATIONS TAB */}
        {activeTab === 'applications' && (
          <div className="applications-section">
            <div className="page-header">
              <div>
                <h1>My Applications</h1>
                <p className="page-subtitle">Track your campaign applications</p>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card-pro">
                <div className="stat-icon">📋</div>
                <div className="stat-content">
                  <h3>{stats.total}</h3>
                  <p>Total Applications</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">⏳</div>
                <div className="stat-content">
                  <h3>{stats.pending}</h3>
                  <p>Pending</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">✅</div>
                <div className="stat-content">
                  <h3>{stats.accepted}</h3>
                  <p>Accepted</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">❌</div>
                <div className="stat-content">
                  <h3>{stats.rejected}</h3>
                  <p>Rejected</p>
                </div>
              </div>
            </div>

            {applications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No applications yet</h3>
                <p>Start applying to campaigns to see them here</p>
              </div>
            ) : (
              <div className="applications-grid">
                {applications.map(app => (
                  <div key={app._id} className="application-card">
                    <div className="app-status-badge" style={{ 
                      background: `${getStatusColor(app.status)}20`,
                      color: getStatusColor(app.status),
                      border: `1px solid ${getStatusColor(app.status)}`
                    }}>
                      {app.status.toUpperCase()}
                    </div>

                    <h3>{app.campaign?.title || 'Campaign'}</h3>
                    <p className="app-brand">Brand: {app.campaign?.brand?.name || 'Unknown'}</p>

                    <div className="app-meta">
                      <div className="meta-item">
                        <span className="meta-icon">💰</span>
                        <span className="meta-value">${app.campaign?.budget}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-icon">📅</span>
                        <span className="meta-value">
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {app.message && (
                      <div className="app-message">
                        <strong>Your Message:</strong>
                        <p>{app. message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="page-header">
              <div>
                <h1>My Profile</h1>
                <p className="page-subtitle">Manage your influencer profile</p>
              </div>
              <button className="btn-create-pro" onClick={() => setShowEditModal(true)}>
                ✏️ Edit Profile
              </button>
            </div>

            <div className="profile-card-main">
              <div className="profile-avatar-large">
                {user && user.name ? user.name[0]. toUpperCase() : 'I'}
              </div>
              <h2>{profileData.name}</h2>
              <p className="profile-email">{user?.email}</p>
              <div className="role-badge-pro">
                <span className="badge-icon">⭐</span>
                {user?.role}
              </div>
              {profileData.bio && (
                <p className="profile-bio">{profileData. bio}</p>
              )}
            </div>

            <div className="stats-grid" style={{ marginTop: '30px' }}>
              <div className="stat-card-pro">
                <div className="stat-icon">👥</div>
                <div className="stat-content">
                  <h3>{profileData.followers >= 1000 ? `${(profileData.followers / 1000).toFixed(1)}K` : profileData.followers}</h3>
                  <p>Followers</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">💚</div>
                <div className="stat-content">
                  <h3>{profileData.engagement}%</h3>
                  <p>Engagement Rate</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">❤️</div>
                <div className="stat-content">
                  <h3>{profileData.avgLikes >= 1000 ? `${(profileData.avgLikes / 1000).toFixed(1)}K` : profileData.avgLikes}</h3>
                  <p>Avg.  Likes</p>
                </div>
              </div>

              <div className="stat-card-pro">
                <div className="stat-icon">💰</div>
                <div className="stat-content">
                  <h3>${profileData.collabCostMin}-${profileData.collabCostMax}</h3>
                  <p>Collaboration Cost</p>
                </div>
              </div>
            </div>

            <div className="profile-section-card">
              <h3>Content Niches</h3>
              <div className="niches-pro">
                {profileData.niches.map(niche => (
                  <span key={niche} className="niche-tag-pro">{niche}</span>
                ))}
              </div>
            </div>

            <div className="profile-section-card">
              <h3>📍 Location</h3>
              <p className="profile-location">{profileData.location}</p>
            </div>

            <div className="profile-section-card">
              <h3>👥 Audience Demographics</h3>
              <div className="demographics-grid">
                <div className="demo-card">
                  <h4>Age Range</h4>
                  <p className="demo-value">{profileData.ageRange}</p>
                </div>
                <div className="demo-card">
                  <h4>Top Countries</h4>
                  <p className="demo-value">{profileData.topCountries}</p>
                </div>
                <div className="demo-card">
                  <h4>Gender Split</h4>
                  <div className="gender-bar">
                    <div className="gender-segment female" style={{ flex: profileData.genderFemale }}>
                      {profileData.genderFemale}%
                    </div>
                    <div className="gender-segment male" style={{ flex: profileData.genderMale }}>
                      {profileData.genderMale}%
                    </div>
                  </div>
                  <p className="demo-label">Female / Male</p>
                </div>
              </div>
            </div>

            <div className="profile-footer">
              <p>Last updated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </main>

      {/* APPLY MODAL */}
      {showApplyModal && (
        <div className="modal-overlay" onClick={() => setShowApplyModal(false)}>
          <div className="modal-content-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>Apply to Campaign</h2>
              <button className="close-btn-pro" onClick={() => setShowApplyModal(false)}>×</button>
            </div>

            <form onSubmit={handleApply} className="campaign-form">
              <div className="form-group-pro">
                <label>Campaign</label>
                <input
                  type="text"
                  value={selectedCampaign?. title}
                  disabled
                  style={{ background: '#151B23', cursor: 'not-allowed' }}
                />
              </div>

              <div className="form-group-pro">
                <label>Your Message *</label>
                <textarea
                  required
                  placeholder="Tell the brand why you're a great fit for this campaign..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e. target.value)}
                  rows="6"
                />
              </div>

              <button type="submit" className="btn-submit-pro">Submit Application</button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content-pro modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>Edit Profile</h2>
              <button className="close-btn-pro" onClick={() => setShowEditModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveProfile} className="campaign-form">
              <h3 className="form-section-title">Basic Information</h3>
              
              <div className="form-group-pro">
                <label>Name *</label>
                <input
                  type="text"
                  required
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e. target.value })}
                />
              </div>

              <div className="form-group-pro">
                <label>Bio</label>
                <textarea
                  placeholder="Tell brands about yourself..."
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group-pro">
                <label>Location</label>
                <input
                  type="text"
                  value={profileData.location}
                  onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  placeholder="e.g., United States"
                />
              </div>

              <h3 className="form-section-title">Social Media Stats</h3>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Followers *</label>
                  <input
                    type="number"
                    required
                    value={profileData.followers}
                    onChange={(e) => setProfileData({ ... profileData, followers: parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Engagement Rate (%) *</label>
                  <input
                    type="number"
                    required
                    step="0.1"
                    value={profileData.engagement}
                    onChange={(e) => setProfileData({ ...profileData, engagement: parseFloat(e.target. value) })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Average Likes *</label>
                  <input
                    type="number"
                    required
                    value={profileData.avgLikes}
                    onChange={(e) => setProfileData({ ... profileData, avgLikes: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <h3 className="form-section-title">Pricing</h3>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Min Collab Cost ($) *</label>
                  <input
                    type="number"
                    required
                    value={profileData.collabCostMin}
                    onChange={(e) => setProfileData({ ...profileData, collabCostMin:  parseInt(e.target.value) })}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Max Collab Cost ($) *</label>
                  <input
                    type="number"
                    required
                    value={profileData. collabCostMax}
                    onChange={(e) => setProfileData({ ...profileData, collabCostMax: parseInt(e. target.value) })}
                  />
                </div>
              </div>

              <h3 className="form-section-title">Content Niches</h3>

              <div className="niche-selector">
                {availableNiches.map(niche => (
                  <button
                    key={niche}
                    type="button"
                    className={`niche-pill-selectable ${profileData.niches.includes(niche) ? 'active' : ''}`}
                    onClick={() => toggleNiche(niche)}
                  >
                    {niche}
                  </button>
                ))}
              </div>

              <h3 className="form-section-title">Audience Demographics</h3>

              <div className="form-group-pro">
                <label>Age Range</label>
                <input
                  type="text"
                  value={profileData. ageRange}
                  onChange={(e) => setProfileData({ ... profileData, ageRange: e.target.value })}
                  placeholder="e.g., 18-34"
                />
              </div>

              <div className="form-group-pro">
                <label>Top Countries</label>
                <input
                  type="text"
                  value={profileData.topCountries}
                  onChange={(e) => setProfileData({ ...profileData, topCountries: e.target.value })}
                  placeholder="e.g., United States, United Kingdom, Canada"
                />
              </div>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Female Audience (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profileData.genderFemale}
                    onChange={(e) => {
                      const female = parseInt(e.target.value);
                      setProfileData({ ...profileData, genderFemale: female, genderMale: 100 - female });
                    }}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Male Audience (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={profileData.genderMale}
                    disabled
                    style={{ background: '#151B23', cursor: 'not-allowed' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-submit-pro">Save Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;