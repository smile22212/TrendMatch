import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BrandDashboard.css';

const BrandDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('campaigns');
  const [campaigns, setCampaigns] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: '',
    requirements: '',
    deadline: '',
  });

  // Analytics
  const totalCampaigns = campaigns.length;
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(app => app.status === 'pending').length;
  const acceptedApplications = applications.filter(app => app.status === 'accepted').length;

  useEffect(() => {
    if (! user || user.role !== 'Brand') {
      navigate('/login');
    } else {
      fetchCampaigns();
      fetchApplications();
    }
  }, [user, navigate]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/campaigns', {
        headers: { 'x-auth-token': token }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
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

  const handleLogout = () => {
    logoutUser();
    navigate('/');
  };

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5001/api/campaigns',
        formData,
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      setCampaigns([res.data, ...campaigns]);
      setSuccess('Campaign created successfully!');
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        budget: '',
        requirements:  '',
        deadline: '',
      });
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.msg || 'Error creating campaign');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setError('');
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/campaigns/${id}`, {
          headers: { 'x-auth-token': token }
        });
        setCampaigns(campaigns.filter(campaign => campaign._id !== id));
        setSuccess('Campaign deleted successfully! ');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Error deleting campaign');
      }
    }
  };

  const handleApplicationAction = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/applications/${applicationId}`,
        { status },
        {
          headers: { 'x-auth-token': token }
        }
      );
      
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ));
      
      setSuccess(`Application ${status}! `);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Error updating application');
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'status-pending';
      case 'accepted': return 'status-accepted';
      case 'rejected':  return 'status-rejected';
      default: return '';
    }
  };

  return (
    <div className="dashboard">
      {success && <div className="toast-success">✅ {success}</div>}
      {error && <div className="toast-error">❌ {error}</div>}

      <aside className="sidebar">
        <div className="sidebar-header">
          <h2 className="logo">TrendMatch</h2>
          <p className="user-role">Brand Dashboard</p>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === 'campaigns' ? 'active' :  ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <span className="nav-icon">📊</span>
            My Campaigns
          </button>
          <button
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-icon">📝</span>
            Applications
            {pendingApplications > 0 && (
              <span className="badge">{pendingApplications}</span>
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
            <h1>Welcome back, {user?.name}!</h1>
            <p className="subtitle">Manage your campaigns and collaborate with influencers</p>
          </div>
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            + Create Campaign
          </button>
        </header>

        {/* Analytics Cards */}
        <div className="analytics-section">
          <div className="analytics-card">
            <div className="analytics-icon">📊</div>
            <div className="analytics-content">
              <h3>{totalCampaigns}</h3>
              <p>Total Campaigns</p>
            </div>
          </div>

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
              <p>Pending Review</p>
            </div>
          </div>

          <div className="analytics-card highlight-success">
            <div className="analytics-icon">✅</div>
            <div className="analytics-content">
              <h3>{acceptedApplications}</h3>
              <p>Accepted</p>
            </div>
          </div>
        </div>

        <div className="content-area">
          {activeTab === 'campaigns' && (
            <div className="campaigns-section">
              <h2>My Campaigns</h2>
              
              {campaigns.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📢</div>
                  <h3>No campaigns yet</h3>
                  <p>Create your first campaign to start collaborating with influencers</p>
                  <button className="btn-create" onClick={() => setShowCreateModal(true)}>
                    Create Your First Campaign
                  </button>
                </div>
              ) : (
                <div className="campaigns-grid">
                  {campaigns.map((campaign) => (
                    <div key={campaign._id} className="campaign-card">
                      <div className="campaign-header">
                        <h3>{campaign.title}</h3>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteCampaign(campaign._id)}
                          title="Delete campaign"
                        >
                          🗑️
                        </button>
                      </div>
                      <p className="campaign-description">{campaign.description}</p>
                      <div className="campaign-requirements">
                        <strong>Requirements:</strong>
                        <p>{campaign. requirements}</p>
                      </div>
                      <div className="campaign-meta">
                        <span className="budget">💰 ${campaign.budget}</span>
                        <span className="deadline">📅 {new Date(campaign.deadline).toLocaleDateString()}</span>
                      </div>
                      <span className={`status-badge ${campaign.status}`}>
                        {campaign.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="applications-section">
              <h2>Campaign Applications</h2>
              
              {applications.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📬</div>
                  <h3>No applications yet</h3>
                  <p>Influencer applications will appear here</p>
                </div>
              ) : (
                <div className="applications-list">
                  {applications.map((app) => (
                    <div key={app._id} className="application-card">
                      <div className="application-header">
                        <div className="influencer-info">
                          <div className="influencer-avatar">
                            {app.influencer?. name?.charAt(0) || 'I'}
                          </div>
                          <div>
                            <h3>{app.influencer?.name || 'Influencer'}</h3>
                            <p className="influencer-email">{app.influencer?.email}</p>
                          </div>
                        </div>
                        <span className={`status-badge ${getStatusColor(app.status)}`}>
                          {app.status. toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="application-campaign">
                        <strong>Campaign:</strong> {app. campaign?.title || 'N/A'}
                      </div>
                      
                      <div className="application-message">
                        <strong>Message:</strong>
                        <p>{app. message}</p>
                      </div>
                      
                      <div className="application-meta">
                        <span>💰 Budget: ${app.campaign?.budget || 'N/A'}</span>
                        <span>📅 Applied: {new Date(app.createdAt).toLocaleDateString()}</span>
                      </div>

                      {app.status === 'pending' && (
                        <div className="application-actions">
                          <button 
                            className="btn-accept"
                            onClick={() => handleApplicationAction(app._id, 'accepted')}
                          >
                            ✅ Accept
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleApplicationAction(app._id, 'rejected')}
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="profile-section">
              <h2>Brand Profile</h2>
              <div className="profile-card">
                <div className="profile-avatar">{user?.name?.charAt(0)}</div>
                <h3>{user?.name}</h3>
                <p>{user?.email}</p>
                <span className="role-badge">Brand</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Campaign</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleCreateCampaign} className="campaign-form">
              <div className="form-group">
                <label>Campaign Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={onChange}
                  required
                  placeholder="e.g., Summer Fashion Collection 2024"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={onChange}
                  required
                  rows="4"
                  placeholder="Describe your campaign..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget ($) *</label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={onChange}
                    required
                    placeholder="5000"
                  />
                </div>

                <div className="form-group">
                  <label>Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData. deadline}
                    onChange={onChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Requirements *</label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={onChange}
                  required
                  rows="3"
                  placeholder="e.g., Minimum 10K followers, fashion niche"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDashboard;
