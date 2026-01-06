import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './BrandDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BrandDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    selectedNiches: [],
  });

  const [campaignForm, setCampaignForm] = useState({
    title:  '',
    description: '',
    budget: '',
    deadline: '',
    requirements: ''
  });

  const niches = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming'];

  useEffect(() => {
    if (! user || user.role !== 'Brand') {
      navigate('/login');
    } else {
      fetchCampaigns();
      fetchInfluencers();
    }
  }, [user, navigate]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios. get('http://localhost:5001/api/campaigns/my-campaigns', {
        headers:  { 'x-auth-token': token }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const token = localStorage. getItem('token');
      const res = await axios.get('http://localhost:5001/api/influencer-profile/all', {
        headers: { 'x-auth-token': token }
      });
      setInfluencers(res.data);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleNiche = (niche) => {
    setFilters(prev => ({
      ...prev,
      selectedNiches: prev. selectedNiches.includes(niche)
        ? prev.selectedNiches.filter(n => n !== niche)
        : [...prev.selectedNiches, niche]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search:  "",
      minFollowers: "",
      maxFollowers: "",
      minEngagement: "",
      selectedNiches: [],
    });
  };

  const filteredInfluencers = influencers.filter(influencer => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const name = influencer.user?. name?.toLowerCase() || '';
      const email = influencer.user?.email?. toLowerCase() || '';
      if (! name.includes(searchLower) && !email.includes(searchLower)) {
        return false;
      }
    }
    if (filters.minFollowers && influencer.followers < parseInt(filters.minFollowers)) return false;
    if (filters. maxFollowers && influencer.followers > parseInt(filters.maxFollowers)) return false;
    if (filters.minEngagement && influencer.engagement < parseFloat(filters.minEngagement)) return false;
    if (filters.selectedNiches.length > 0) {
      const hasMatchingNiche = filters.selectedNiches.some(niche => 
        influencer.niches?. includes(niche)
      );
      if (!hasMatchingNiche) return false;
    }
    return true;
  });

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
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

  const handleViewProfile = (influencer) => {
    const profileInfo = `
👤 ${influencer.user?. name || 'Influencer'}

📧 Email: ${influencer.user?.email}
👥 Followers: ${formatNumber(influencer.followers)}
💚 Engagement: ${influencer.engagement}%
📍 Location: ${influencer. location || 'Not specified'}
💰 Price Range: $${influencer.collabCostMin} - $${influencer.collabCostMax}
🏆 Tier: ${influencer.tier}
🎯 Niches: ${influencer.niches?.join(', ') || 'Not specified'}
    `.trim();
    alert(profileInfo);
  };

  const handleSendRequest = (influencer) => {
    if (campaigns.length === 0) {
      alert("⚠️ Please create a campaign first!");
      setShowCreateModal(true);
      return;
    }
    alert(`✅ Sending collaboration request to ${influencer.user?. name}! `);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage. getItem('token');
      await axios.post('http://localhost:5001/api/campaigns', campaignForm, {
        headers:  { 'x-auth-token': token }
      });
      setShowCreateModal(false);
      setCampaignForm({ title: '', description: '', budget:  '', deadline: '', requirements: '' });
      fetchCampaigns();
      alert('✅ Campaign created successfully!');
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert('❌ Error creating campaign');
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5001/api/campaigns/${id}`, {
          headers: { 'x-auth-token': token }
        });
        fetchCampaigns();
        alert('✅ Campaign deleted successfully!');
      } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('❌ Error deleting campaign');
      }
    }
  };

  const budgetChartData = {
    labels: campaigns.map(c => c.title),
    datasets: [
      {
        label: 'Campaign Budget ($)',
        data: campaigns.map(c => c.budget),
        backgroundColor: '#00D084',
        borderColor:  '#00B570',
        borderWidth: 2,
      },
    ],
  };

  const nicheData = campaigns.reduce((acc, campaign) => {
    const niche = campaign.niche || 'Other';
    acc[niche] = (acc[niche] || 0) + 1;
    return acc;
  }, {});

  const nicheChartData = {
    labels: Object.keys(nicheData),
    datasets: [
      {
        label:  'Campaigns by Niche',
        data: Object.values(nicheData),
        backgroundColor: [
          '#00D084',
          '#00B570',
          '#009959',
          '#008040',
          '#006633',
          '#005028'
        ],
        borderColor:  '#151B23',
        borderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#E4E7EB',
          font: { size: 12 }
        }
      },
    },
    scales: {
      y: {
        ticks: { color: '#9AA5B1' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      },
      x: {
        ticks: { color:  '#9AA5B1' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' }
      }
    }
  };

  return (
    <div className="brand-dashboard">
      <aside className="sidebar">
        <div className="brand-logo">
          <h2>TrendMatch</h2>
          <p className="subtitle">Brand Dashboard</p>
        </div>

        <nav className="nav-menu">
          <button
            className={`nav-item ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            <span className="nav-icon">🔍</span>
            Discover Influencers
          </button>

          <button
            className={`nav-item ${activeTab === 'campaigns' ? 'active' : ''}`}
            onClick={() => setActiveTab('campaigns')}
          >
            <span className="nav-icon">📢</span>
            My Campaigns
          </button>

          <button
            className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            <span className="nav-icon">📊</span>
            Analytics
          </button>
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <span className="nav-icon">🚪</span>
          Logout
        </button>
      </aside>

      <main className="main-content">
        {activeTab === 'discover' && (
          <div className="discover-section">
            <div className="page-header">
              <div>
                <h1>Discover Influencers</h1>
                <p className="page-subtitle">Find the perfect creators for your brand</p>
              </div>
              <button className="btn-create-pro" onClick={() => setShowCreateModal(true)}>
                ➕ Create Campaign
              </button>
            </div>

            <div className="search-section">
              <input
                type="text"
                placeholder="🔍 Search influencers by name or email..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="search-input-pro"
              />
            </div>

            <div className="filters-horizontal">
              <div className="filter-group-inline">
                <label>Min Followers</label>
                <input
                  type="number"
                  placeholder="10,000"
                  value={filters.minFollowers}
                  onChange={(e) => setFilters({ ...filters, minFollowers: e.target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Max Followers</label>
                <input
                  type="number"
                  placeholder="100,000"
                  value={filters.maxFollowers}
                  onChange={(e) => setFilters({ ...filters, maxFollowers: e.target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Min Engagement (%)</label>
                <input
                  type="number"
                  placeholder="5.0"
                  value={filters.minEngagement}
                  onChange={(e) => setFilters({ ...filters, minEngagement: e.target.value })}
                  className="filter-input-small"
                  step="0.1"
                />
              </div>

              <button className="btn-reset-pro" onClick={resetFilters}>
                🔄 Reset
              </button>
            </div>

            <div className="niche-section">
              <label className="filter-label">Content Niches: </label>
              <div className="niche-pills-horizontal">
                {niches. map(niche => (
                  <button
                    key={niche}
                    className={`niche-pill-pro ${filters.selectedNiches.includes(niche) ? 'active' : ''}`}
                    onClick={() => toggleNiche(niche)}
                  >
                    {niche}
                  </button>
                ))}
              </div>
            </div>

            <div className="results-count">
              <h3>Found {filteredInfluencers.length} Influencers</h3>
            </div>

            {loading ? (
              <div className="loading">Loading influencers...</div>
            ) : filteredInfluencers.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>No influencers found</h3>
                <p>Try adjusting your filters or ask influencers to complete their profiles</p>
              </div>
            ) : (
              <div className="influencer-grid-pro">
                {filteredInfluencers.map(influencer => (
                  <div key={influencer._id} className="influencer-card-pro">
                    <div className="influencer-header">
                      <div className="influencer-avatar-pro">
                        {influencer.user?.name?.[0]?.toUpperCase() || 'I'}
                      </div>
                    </div>

                    <h4 className="influencer-name">{influencer.user?.name || 'Influencer'}</h4>
                    <p className="influencer-username">{influencer.user?.email}</p>

                    <div className="tier-badge-pro" style={{
                      background: `${getTierColor(influencer.tier)}20`,
                      color: getTierColor(influencer.tier),
                      border: `1px solid ${getTierColor(influencer.tier)}`
                    }}>
                      {influencer.tier}
                    </div>

                    <div className="stats-row-pro">
                      <div className="stat-pro">
                        <span className="stat-value-pro">{formatNumber(influencer.followers)}</span>
                        <span className="stat-label-pro">Followers</span>
                      </div>
                      <div className="stat-pro">
                        <span className="stat-value-pro">{influencer.engagement}%</span>
                        <span className="stat-label-pro">Engagement</span>
                      </div>
                    </div>

                    <div className="niches-pro">
                      {influencer.niches?.slice(0, 3).map(n => (
                        <span key={n} className="niche-tag-pro">{n}</span>
                      ))}
                      {influencer.niches?. length > 3 && (
                        <span className="niche-tag-pro">+{influencer.niches. length - 3}</span>
                      )}
                    </div>

                    {influencer.location && (
                      <div className="location-pro">📍 {influencer.location}</div>
                    )}

                    <div className="price-range-pro">
                      ${influencer.collabCostMin} - ${influencer.collabCostMax}
                    </div>

                    <div className="card-actions-pro">
                      <button className="btn-view-pro" onClick={() => handleViewProfile(influencer)}>
                        View Profile
                      </button>
                      <button className="btn-contact-pro" onClick={() => handleSendRequest(influencer)}>
                        Send Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'campaigns' && (
          <div className="campaigns-section-pro">
            <div className="page-header">
              <div>
                <h1>My Campaigns</h1>
                <p className="page-subtitle">Manage your influencer campaigns</p>
              </div>
              <button className="btn-create-pro" onClick={() => setShowCreateModal(true)}>
                ➕ Create Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📢</div>
                <h3>No campaigns yet</h3>
                <p>Create your first campaign to start collaborating with influencers</p>
                <button className="btn-create-pro" onClick={() => setShowCreateModal(true)}>
                  Create Your First Campaign
                </button>
              </div>
            ) : (
              <div className="campaigns-grid-pro">
                {campaigns.map(campaign => (
                  <div key={campaign._id} className="campaign-card-pro">
                    <div className="campaign-header-pro">
                      <h3>{campaign.title}</h3>
                      <div className="campaign-actions-pro">
                        <button className="btn-edit-pro" title="Edit">✏️</button>
                        <button
                          className="btn-delete-pro"
                          title="Delete"
                          onClick={() => handleDeleteCampaign(campaign._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <p className="campaign-description">{campaign.description}</p>

                    <div className="campaign-meta-pro">
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
                      <div className="campaign-requirements">
                        <strong>Requirements:</strong>
                        <p>{campaign.requirements}</p>
                      </div>
                    )}

                    <div className="campaign-footer">
                      <span className="campaign-date">
                        Created {new Date(campaign.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-section-pro">
            <div className="page-header">
              <div>
                <h1>Campaign Analytics</h1>
                <p className="page-subtitle">Track your campaign performance</p>
              </div>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No analytics data yet</h3>
                <p>Create campaigns to see analytics and insights</p>
              </div>
            ) : (
              <>
                <div className="stats-grid">
                  <div className="stat-card-pro">
                    <div className="stat-icon">📢</div>
                    <div className="stat-content">
                      <h3>{campaigns.length}</h3>
                      <p>Total Campaigns</p>
                    </div>
                  </div>

                  <div className="stat-card-pro">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                      <h3>${campaigns.reduce((sum, c) => sum + Number(c.budget), 0).toLocaleString()}</h3>
                      <p>Total Budget</p>
                    </div>
                  </div>

                  <div className="stat-card-pro">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <h3>{influencers.length}</h3>
                      <p>Available Influencers</p>
                    </div>
                  </div>

                  <div className="stat-card-pro">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                      <h3>${(campaigns.reduce((sum, c) => sum + Number(c.budget), 0) / campaigns.length).toFixed(0)}</h3>
                      <p>Avg Campaign Budget</p>
                    </div>
                  </div>
                </div>

                <div className="charts-grid">
                  <div className="chart-card">
                    <h3>Campaign Budgets</h3>
                    <div className="chart-container">
                      <Bar data={budgetChartData} options={chartOptions} />
                    </div>
                  </div>

                  <div className="chart-card">
                    <h3>Campaigns by Niche</h3>
                    <div className="chart-container">
                      <Pie data={nicheChartData} options={{
                        ... chartOptions,
                        scales: undefined
                      }} />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content-pro" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>Create New Campaign</h2>
              <button className="close-btn-pro" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCampaign} className="campaign-form">
              <div className="form-group-pro">
                <label>Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Summer Fashion Collection 2025"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                />
              </div>

              <div className="form-group-pro">
                <label>Description *</label>
                <textarea
                  required
                  placeholder="Describe your campaign goals and requirements..."
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Budget ($) *</label>
                  <input
                    type="number"
                    required
                    placeholder="5000"
                    value={campaignForm.budget}
                    onChange={(e) => setCampaignForm({ ...campaignForm, budget: e.target.value })}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Deadline *</label>
                  <input
                    type="date"
                    required
                    value={campaignForm.deadline}
                    onChange={(e) => setCampaignForm({ ...campaignForm, deadline: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group-pro">
                <label>Additional Requirements</label>
                <textarea
                  placeholder="Any specific requirements for influencers..."
                  value={campaignForm.requirements}
                  onChange={(e) => setCampaignForm({ ...campaignForm, requirements: e.target.value })}
                  rows="3"
                />
              </div>

              <button type="submit" className="btn-submit-pro">Create Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDashboard;