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
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minBudget, setMinBudget] = useState('');
  const [maxBudget, setMaxBudget] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Analytics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;
  const rejectedApplications = applications.filter(app => app.status === 'rejected').length;

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
      const token = localStorage. getItem('token');
      const res = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { 'x-auth-token': token }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Error loading campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/applications', {
        headers: { 'x-auth-token': token }
      });
      setApplications(res.data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    }
  };

  // Check if influencer already applied to a campaign
  const hasApplied = (campaignId) => {
    return applications.find(app => app.campaign?._id === campaignId);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':  return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected': return 'status-rejected';
      default: return '';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':  return '⏳';
      case 'accepted': return '✅';
      case 'rejected': return '❌';
      default: return '';
    }
  };

  // Filter and sort campaigns
  const getFilteredCampaigns = () => {
    let filtered = [... campaigns];

    // Search filter
    if (searchTerm) {
      filtered = filtered. filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.brand?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Budget filter
    if (minBudget) {
      filtered = filtered.filter(campaign => campaign.budget >= parseInt(minBudget));
    }
    if (maxBudget) {
      filtered = filtered.filter(campaign => campaign.budget <= parseInt(maxBudget));
    }

    // Sort
    switch(sortBy) {
      case 'newest': 
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'deadline':
        filtered.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
        break;
      case 'budget':
        filtered.sort((a, b) => b.budget - a.budget);
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredCampaigns = getFilteredCampaigns();

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const handleApplyClick = (campaign) => {
    setSelectedCampaign(campaign);
    setShowApplyModal(true);
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5001/api/applications',
        {
          campaign: selectedCampaign._id,
          message: applicationMessage
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      setSuccess('Application submitted successfully! ');
      setShowApplyModal(false);
      setApplicationMessage('');
      setSelectedCampaign(null);
      
      await fetchApplications();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error submitting application');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowApplyModal(false);
    setSelectedCampaign(null);
    setApplicationMessage('');
    setError('');
  };

  const clearFilters = () => {
    setSearchTerm('');
    setMinBudget('');
    setMaxBudget('');
    setSortBy('newest');
  };

  return (
    <div className="dashboard">
      {success && <div className="toast-success">✅ {success}</div>}
      {error && <div className="toast-error">❌ {error}</div>}

      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">TrendMatch</h2>
          <p className="user-role">Influencer Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'browse' ? 'active' :  ''}`}
            onClick={() => setActiveTab('browse')}
          >
            <span className="nav-icon">🔍</span>
            Browse Campaigns
          </button>
          <button
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-icon">📝</span>
            My Applications
            {applications.length > 0 && (
              <span className="badge">{applications.length}</span>
            )}
          </button>
          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
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
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, {user?. name}!</h1>
            <p className="subtitle">Discover exciting brand collaboration opportunities</p>
          </div>
        </header>

        {/* Analytics Cards */}
        <div className="analytics-section">
          <div className="analytics-card">
            <div className="analytics-icon">📝</div>
            <div className="analytics-content">
              <h3>{totalApplications}</h3>
              <p>Total Applications</p>
            </div>
          </div>

          <div className="analytics-card highlight-pending">
            <div className="analytics-icon">⏳</div>
            <div className="analytics-content">
              <h3>{pendingApplications}</h3>
              <p>Pending</p>
            </div>
          </div>

          <div className="analytics-card highlight-success">
            <div className="analytics-icon">✅</div>
            <div className="analytics-content">
              <h3>{acceptedApplications}</h3>
              <p>Accepted</p>
            </div>
          </div>

          <div className="analytics-card highlight-rejected">
            <div className="analytics-icon">❌</div>
            <div className="analytics-content">
              <h3>{rejectedApplications}</h3>
              <p>Rejected</p>
            </div>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'browse' && (
            <div className="campaigns-section">
              <div className="section-header">
                <h2>Available Campaigns</h2>
                <span className="campaign-count">{filteredCampaigns.length} campaigns found</span>
              </div>

              {/* Filters */}
              <div className="filters-section">
                <div className="search-bar">
                  <span className="search-icon">🔍</span>
                  <input
                    type="text"
                    placeholder="Search campaigns, brands..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="filter-row">
                  <div className="filter-group">
                    <label>Min Budget ($)</label>
                    <input
                      type="number"
                      placeholder="Min"
                      value={minBudget}
                      onChange={(e) => setMinBudget(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Max Budget ($)</label>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxBudget}
                      onChange={(e) => setMaxBudget(e.target.value)}
                    />
                  </div>

                  <div className="filter-group">
                    <label>Sort By</label>
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                      <option value="newest">Newest First</option>
                      <option value="deadline">Deadline Soon</option>
                      <option value="budget">Highest Budget</option>
                    </select>
                  </div>

                  <button className="btn-clear-filters" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading">Loading campaigns...</div>
              ) : filteredCampaigns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🔍</div>
                  <h3>No campaigns found</h3>
                  <p>Try adjusting your filters or check back later</p>
                  <button className="btn-create" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </div>
              ) : (
                <div className="campaigns-grid">
                  {filteredCampaigns.map((campaign) => {
                    const application = hasApplied(campaign._id);
                    const alreadyApplied = !!application;

                    return (
                      <div key={campaign._id} className={`campaign-card ${alreadyApplied ? 'applied' : ''}`}>
                        <div className="campaign-brand">
                          <div className="brand-avatar">
                            {campaign. brand?.name?. charAt(0) || 'B'}
                          </div>
                          <div>
                            <h4>{campaign.brand?. name || 'Brand'}</h4>
                            <span className="brand-email">{campaign. brand?.email}</span>
                          </div>
                        </div>
                        
                        {alreadyApplied && (
                          <div className={`applied-badge ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)} {application.status. toUpperCase()}
                          </div>
                        )}
                        
                        <h3 className="campaign-title">{campaign.title}</h3>
                        <p className="campaign-description">{campaign.description}</p>
                        
                        <div className="campaign-requirements">
                          <strong>Requirements:</strong>
                          <p>{campaign. requirements}</p>
                        </div>
                        
                        <div className="campaign-meta">
                          <span className="budget">💰 ${campaign.budget}</span>
                          <span className="deadline">📅 {new Date(campaign.deadline).toLocaleDateString()}</span>
                        </div>
                        
                        {alreadyApplied ?  (
                          <button className="btn-applied" disabled>
                            Already Applied
                          </button>
                        ) : (
                          <button 
                            className="btn-apply"
                            onClick={() => handleApplyClick(campaign)}
                          >
                            Apply Now
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-section">
              <h2>My Applications</h2>
              
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📬</div>
                  <h3>No applications yet</h3>
                  <p>Your campaign applications will appear here</p>
                  <button className="btn-create" onClick={() => setActiveTab('browse')}>
                    Browse Campaigns
                  </button>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app._id} className="application-card">
                      <div className="application-header">
                        <div>
                          <h3>{app.campaign?.title || 'Campaign'}</h3>
                          <p className="campaign-brand-name">
                            Brand: {app.campaign?.brand?. name || 'Unknown'}
                          </p>
                        </div>
                        <span className={`status-badge ${getStatusColor(app. status)}`}>
                          {app.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="application-message">
                        <strong>Your message:</strong>
                        <p>{app. message}</p>
                      </div>
                      
                      <div className="application-meta">
                        <span>💰 Budget: ${app.campaign?.budget || 'N/A'}</span>
                        <span>📅 Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Influencer Profile</h2>
              <div className="profile-card">
                <div className="profile-avatar">{user?.name?. charAt(0)}</div>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <span className="role-badge">Influencer</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {showApplyModal && selectedCampaign && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply to Campaign</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            <div className="campaign-summary">
              <h3>{selectedCampaign.title}</h3>
              <p>{selectedCampaign.brand?.name}</p>
              <span className="budget-badge">💰 ${selectedCampaign.budget}</span>
            </div>

            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleApply} className="application-form">
              <div className="form-group">
                <label>Why are you a good fit for this campaign?  *</label>
                <textarea
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  required
                  rows="6"
                  placeholder="Tell the brand why you're perfect for this collaboration..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Submitting.. .' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerDashboard;
