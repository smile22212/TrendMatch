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
import InfluencerProfileModal from '../../components/Modals/InfluencerProfileModal';
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
  const [selectedInfluencer, setSelectedInfluencer] = useState(null);
  const [brandProfile, setBrandProfile] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedCampaignApps, setSelectedCampaignApps] = useState(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    minFollowers: "",
    maxFollowers: "",
    minEngagement: "",
    selectedNiches: [],
  });

  const [campaignForm, setCampaignForm] = useState({
    title:    '',
    description: '',
    budget:  '',
    deadline: '',
    requirements: ''
  });

  const [profileForm, setProfileForm] = useState({
    companyName: '',
    industry: '',
    description: '',
    website: '',
    logoUrl: '',
    location: '',
    companySize: '1-10',
    foundedYear: '',
    socialMedia: {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: ''
    }
  });

  const niches = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming'];

  useEffect(() => {
    if (!   user || user.role !== 'Brand') {
      navigate('/login');
    } else {
      fetchCampaigns();
      fetchInfluencers();
      fetchBrandProfile();
    }
  }, [user, navigate]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/campaigns/my-campaigns', {
        headers:    { 'x-auth-token': token }
      });
      setCampaigns(res.data);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    }
  };

  const fetchInfluencers = async () => {
    setLoading(true);
    try {
      const token = localStorage.   getItem('token');
      const res = await axios.get('http://localhost:5001/api/influencer-profile/all', {
        headers:  { 'x-auth-token': token }
      });
      setInfluencers(res. data);
    } catch (err) {
      console.error('Error fetching influencers:', err);
      setInfluencers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBrandProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/brand-profile/me', {
        headers:  { 'x-auth-token':    token }
      });
      setBrandProfile(res.data);
      setProfileForm({
        companyName:   res.  data.companyName || '',
        industry:  res.data.industry || '',
        description: res.  data.description || '',
        website: res.data.website || '',
        logoUrl: res.data.logoUrl || '',
        location: res.data.location || '',
        companySize: res.   data.companySize || '1-10',
        foundedYear: res.data.foundedYear || '',
        socialMedia: res.data.socialMedia || {
          instagram: '',
          twitter:    '',
          facebook:  '',
          linkedin: ''
        }
      });
    } catch (err) {
      console.error('Error fetching brand profile:', err);
    }
  };

  const fetchCampaignApplications = async (campaignId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:5001/api/applications/campaign/${campaignId}`, {
        headers: { 'x-auth-token': token }
      });
      setApplications(res.data);
      setSelectedCampaignApps(campaignId);
      setShowApplicationsModal(true);
    } catch (err) {
      console.error('Error fetching applications:', err);
      alert('❌ Error fetching applications');
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5001/api/applications/${applicationId}/status`,
        { status },
        { headers: { 'x-auth-token': token } }
      );
      fetchCampaignApplications(selectedCampaignApps);
      alert(`✅ Application ${status}! `);
    } catch (err) {
      console.error('Error updating application:', err);
      alert('❌ Error updating application');
    }
  };

  const handleSaveBrandProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage. getItem('token');
      const res = await axios.post(
        'http://localhost:5001/api/brand-profile',
        profileForm,
        { headers: { 'x-auth-token': token } }
      );
      setBrandProfile(res.data);
      setShowProfileModal(false);
      alert('✅ Brand profile saved successfully! ');
    } catch (err) {
      console.error('Error saving brand profile:', err);
      alert('❌ Error saving profile:    ' + (err.response?.data?.msg || 'Server error'));
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleNiche = (niche) => {
    setFilters(prev => ({
      ...prev,
      selectedNiches: prev.   selectedNiches.includes(niche)
        ? prev.selectedNiches.filter(n => n !== niche)
        : [...prev.selectedNiches, niche]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search:    "",
      minFollowers: "",
      maxFollowers: "",
      minEngagement: "",
      selectedNiches: [],
    });
  };

  const filteredInfluencers = influencers.   filter(influencer => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const name = influencer.user?.  name?. toLowerCase() || '';
      const email = influencer.user?.email?. toLowerCase() || '';
      if (!   name. includes(searchLower) && ! email.includes(searchLower)) {
        return false;
      }
    }
    if (filters.minFollowers && influencer.followers < parseInt(filters.minFollowers)) return false;
    if (filters.   maxFollowers && influencer.followers > parseInt(filters.maxFollowers)) return false;
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
    setSelectedInfluencer(influencer);
  };

  const handleSendRequest = (influencer) => {
    if (campaigns.length === 0) {
      alert("⚠️ Please create a campaign first!");
      setShowCreateModal(true);
      return;
    }
    alert(`✅ Sending collaboration request to ${influencer.user?. name}!  `);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/campaigns', campaignForm, {
        headers: { 'x-auth-token': token }
      });
      setShowCreateModal(false);
      setCampaignForm({ title: '', description: '', budget:    '', deadline: '', requirements: '' });
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

  const exportToCSV = () => {
    try {
      const csvData = [
        ['TrendMatch Analytics Report'],
        ['Generated:', new Date().toLocaleString()],
        [''],
        ['Metric', 'Value'],
        ['Total Campaigns', campaigns. length],
        ['Total Budget', '$' + campaigns.reduce((sum, c) => sum + Number(c.budget), 0)],
        ['Active Campaigns', campaigns. filter(c => new Date(c.deadline) > new Date()).length],
        [''],
        ['Campaign Details'],
        ['Name', 'Budget', 'Deadline', 'Status'],
        ... campaigns.map(c => [
          c.title,
          '$' + c.budget,
          new Date(c.deadline).toLocaleDateString(),
          new Date(c.deadline) > new Date() ? 'Active' : 'Expired'
        ])
      ];
      const csvContent = csvData.map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document. createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'TrendMatch_Analytics. csv';
      link.click();
      alert('✅ CSV exported! ');
    } catch (err) {
      alert('❌ Export failed');
    }
  };

  const exportToPDF = () => {
    window.print();
  };

  const budgetChartData = {
    labels: campaigns.map(c => c.title),
    datasets: [
      {
        label: 'Campaign Budget ($)',
        data: campaigns.map(c => c.budget),
        backgroundColor: '#00D084',
        borderColor:    '#00B570',
        borderWidth:  2,
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
        label:    'Campaigns by Niche',
        data:  Object.values(nicheData),
        backgroundColor: [
          '#00D084',
          '#00B570',
          '#009959',
          '#008040',
          '#006633',
          '#005028'
        ],
        borderColor:    '#151B23',
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
        ticks: { color:    '#9AA5B1' },
        grid: { color:   'rgba(255, 255, 255, 0.08)' }
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

          <button
            className={`nav-item ${activeTab === 'applications' ? 'active' : ''}`}
            onClick={() => setActiveTab('applications')}
          >
            <span className="nav-icon">📋</span>
            Applications
          </button>

          <button
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <span className="nav-icon">⚙️</span>
            My Profile
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
            <div className="export-actions">
              <button className="btn-export-csv" onClick={exportToCSV}>📊 Export CSV</button>
              <button className="btn-export-pdf" onClick={exportToPDF}>📄 Export PDF</button>
            </div>

            <div className="search-section">
              <input
                type="text"
                placeholder="🔍 Search influencers by name or email..."
                value={filters.  search}
                onChange={(e) => setFilters({ ...  filters, search: e.target.   value })}
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
                  onChange={(e) => setFilters({ ...  filters, minFollowers: e.  target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Max Followers</label>
                <input
                  type="number"
                  placeholder="100,000"
                  value={filters.maxFollowers}
                  onChange={(e) => setFilters({ ... filters, maxFollowers: e. target.value })}
                  className="filter-input-small"
                />
              </div>

              <div className="filter-group-inline">
                <label>Min Engagement (%)</label>
                <input
                  type="number"
                  placeholder="5.   0"
                  value={filters.minEngagement}
                  onChange={(e) => setFilters({ ...  filters, minEngagement: e.  target.value })}
                  className="filter-input-small"
                  step="0.1"
                />
              </div>

              <button className="btn-reset-pro" onClick={resetFilters}>
                🔄 Reset
              </button>
            </div>

            <div className="niche-section">
              <label className="filter-label">Content Niches:   </label>
              <div className="niche-pills-horizontal">
                {niches.map(niche => (
                  <button
                    key={niche}
                    className={`niche-pill-pro ${filters.selectedNiches.   includes(niche) ? 'active' : ''}`}
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

            {loading ?    (
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
                      {influencer.niches?.length > 3 && (
                        <span className="niche-tag-pro">+{influencer.niches.   length - 3}</span>
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

            {campaigns. length === 0 ?    (
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
                        <button 
                          className="btn-view-apps" 
                          title="View Applications"
                          onClick={() => fetchCampaignApplications(campaign._id)}
                        >
                          📋
                        </button>
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
                <p className="page-subtitle">Comprehensive insights and performance metrics</p>
              </div>
            </div>

            <div className="export-actions">
              <button className="btn-export-csv" onClick={exportToCSV}>
                📊 Export CSV
              </button>
              <button className="btn-export-pdf" onClick={exportToPDF}>
                📄 Export PDF
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📊</div>
                <h3>No analytics data yet</h3>
                <p>Create campaigns to see analytics and insights</p>
              </div>
            ) : (
              <>
                <div className="analytics-overview">
                  <h2 className="section-title">📈 Overview</h2>
                  <div className="stats-grid-enhanced">
                    <div className="stat-card-enhanced">
                      <div className="stat-header">
                        <span className="stat-icon-lg">📢</span>
                        <span className="stat-trend up">↑ 12%</span>
                      </div>
                      <h3>{campaigns.length}</h3>
                      <p>Total Campaigns</p>
                      <div className="stat-footer">
                        Active: {campaigns.filter(c => new Date(c.deadline) > new Date()).length}
                      </div>
                    </div>

                    <div className="stat-card-enhanced">
                      <div className="stat-header">
                        <span className="stat-icon-lg">💰</span>
                        <span className="stat-trend up">↑ 24%</span>
                      </div>
                      <h3>${campaigns.reduce((sum, c) => sum + Number(c.budget), 0).toLocaleString()}</h3>
                      <p>Total Budget Allocated</p>
                      <div className="stat-footer">
                        Avg:  ${(campaigns.reduce((sum, c) => sum + Number(c.budget), 0) / campaigns.length).toFixed(0)}
                      </div>
                    </div>

                    <div className="stat-card-enhanced">
                      <div className="stat-header">
                        <span className="stat-icon-lg">👥</span>
                        <span className="stat-trend neutral">→ 0%</span>
                      </div>
                      <h3>{influencers.length}</h3>
                      <p>Available Influencers</p>
                      <div className="stat-footer">
                        Verified profiles
                      </div>
                    </div>

                    <div className="stat-card-enhanced">
                      <div className="stat-header">
                        <span className="stat-icon-lg">📋</span>
                        <span className="stat-trend up">↑ 8%</span>
                      </div>
                      <h3>0</h3>
                      <p>Total Applications</p>
                      <div className="stat-footer">
                        Pending review
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analytics-charts">
                  <h2 className="section-title">📊 Performance Metrics</h2>
                  <div className="charts-grid-enhanced">
                    <div className="chart-card-enhanced">
                      <div className="chart-card-header">
                        <h3>💰 Campaign Budgets</h3>
                        <span className="chart-subtitle">Budget allocation per campaign</span>
                      </div>
                      <div className="chart-container-enhanced">
                        <Bar data={budgetChartData} options={{
                          ... chartOptions,
                          plugins: {
                            ... chartOptions.plugins,
                            legend: {
                              display:  false
                            }
                          }
                        }} />
                      </div>
                    </div>

                    <div className="chart-card-enhanced">
                      <div className="chart-card-header">
                        <h3>🎯 Campaign Distribution</h3>
                        <span className="chart-subtitle">Campaigns by niche category</span>
                      </div>
                      <div className="chart-container-enhanced">
                        <Pie data={nicheChartData} options={{
                          ...chartOptions,
                          scales: undefined,
                          plugins: {
                            ...chartOptions.plugins,
                            legend: {
                              position: 'bottom',
                              labels: {
                                color: '#E4E7EB',
                                padding: 15,
                                font: { size: 11 }
                              }
                            }
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="analytics-insights">
                  <h2 className="section-title">💡 Key Insights</h2>
                  <div className="insights-grid">
                    <div className="insight-card">
                      <span className="insight-icon">🎯</span>
                      <h4>Campaign Reach</h4>
                      <p className="insight-value">
                        {formatNumber(influencers.reduce((sum, inf) => sum + inf.followers, 0))}
                      </p>
                      <p className="insight-description">Total potential reach from available influencers</p>
                    </div>

                    <div className="insight-card">
                      <span className="insight-icon">📊</span>
                      <h4>Avg Engagement</h4>
                      <p className="insight-value">
                        {(influencers.reduce((sum, inf) => sum + inf.engagement, 0) / influencers.length || 0).toFixed(1)}%
                      </p>
                      <p className="insight-description">Average engagement rate across platform</p>
                    </div>

                    <div className="insight-card">
                      <span className="insight-icon">⚡</span>
                      <h4>Response Rate</h4>
                      <p className="insight-value">0%</p>
                      <p className="insight-description">Application response time (coming soon)</p>
                    </div>

                    <div className="insight-card">
                      <span className="insight-icon">💎</span>
                      <h4>Top Tier</h4>
                      <p className="insight-value">
                        {influencers.filter(inf => inf.tier === 'Mega' || inf.tier === 'Macro').length}
                      </p>
                      <p className="insight-description">Premium influencers (Macro/Mega tier)</p>
                    </div>
                  </div>
                </div>

                <div className="analytics-table">
                  <h2 className="section-title">📋 Campaign Performance</h2>
                  <div className="table-responsive">
                    <table className="analytics-data-table">
                      <thead>
                        <tr>
                          <th>Campaign</th>
                          <th>Budget</th>
                          <th>Deadline</th>
                          <th>Status</th>
                          <th>Applications</th>
                        </tr>
                      </thead>
                      <tbody>
                        {campaigns.map(campaign => (
                          <tr key={campaign._id}>
                            <td>
                              <div className="table-campaign-name">{campaign.title}</div>
                            </td>
                            <td>
                              <span className="table-budget">${campaign.budget}</span>
                            </td>
                            <td>
                              <span className="table-date">
                                {new Date(campaign.deadline).toLocaleDateString()}
                              </span>
                            </td>
                            <td>
                              <span className={`table-status ${new Date(campaign.deadline) > new Date() ? 'active' : 'expired'}`}>
                                {new Date(campaign.deadline) > new Date() ? '🟢 Active' : '🔴 Expired'}
                              </span>
                            </td>
                            <td>
                              <button 
                                className="table-action-btn"
                                onClick={() => fetchCampaignApplications(campaign._id)}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="applications-section-pro">
            <div className="page-header">
              <div>
                <h1>Application Management</h1>
                <p className="page-subtitle">Review and manage influencer applications</p>
              </div>
            </div>

            <div className="campaigns-apps-list">
              {campaigns.length === 0 ?  (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <h3>No campaigns yet</h3>
                  <p>Create campaigns to start receiving applications from influencers</p>
                  <button className="btn-create-pro" onClick={() => setActiveTab('campaigns')}>
                    Go to Campaigns
                  </button>
                </div>
              ) : (
                <div className="campaigns-app-grid">
                  {campaigns.map(campaign => (
                    <div key={campaign._id} className="campaign-app-card">
                      <div className="campaign-app-header">
                        <h3>{campaign.title}</h3>
                        <span className="campaign-budget">💰 ${campaign.budget}</span>
                      </div>
                      <p className="campaign-app-description">{campaign.description}</p>
                      <div className="campaign-app-meta">
                        <span>📅 Deadline: {new Date(campaign. deadline).toLocaleDateString()}</span>
                      </div>
                      <button 
                        className="btn-view-applications"
                        onClick={() => fetchCampaignApplications(campaign._id)}
                      >
                        📋 View Applications
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="profile-section-pro">
            <div className="page-header">
              <div>
                <h1>Brand Profile</h1>
                <p className="page-subtitle">Manage your company information</p>
              </div>
              <button className="btn-create-pro" onClick={() => setShowProfileModal(true)}>
                ✏️ Edit Profile
              </button>
            </div>

            {brandProfile ?    (
              <div className="brand-profile-display">
                <div className="profile-card-large">
                  <div className="profile-card-header">
                    {brandProfile.logoUrl ?    (
                      <img src={brandProfile.logoUrl} alt="Logo" className="brand-logo-img" />
                    ) : (
                      <div className="brand-logo-placeholder">
                        {brandProfile.companyName?.[0]?.toUpperCase() || 'B'}
                      </div>
                    )}
                    <div>
                      <h2>{brandProfile.companyName}</h2>
                      <p className="brand-industry">{brandProfile.industry}</p>
                    </div>
                  </div>

                  <div className="profile-card-body">
                    <div className="profile-info-section">
                      <h3>📝 About</h3>
                      <p>{brandProfile.description}</p>
                    </div>

                    <div className="profile-info-grid">
                      {brandProfile.website && (
                        <div className="profile-info-item">
                          <strong>🌐 Website:</strong>
                          <a href={brandProfile.website} target="_blank" rel="noopener noreferrer">
                            {brandProfile.website}
                          </a>
                        </div>
                      )}

                      {brandProfile.  location && (
                        <div className="profile-info-item">
                          <strong>📍 Location:</strong>
                          <span>{brandProfile.location}</span>
                        </div>
                      )}

                      {brandProfile.companySize && (
                        <div className="profile-info-item">
                          <strong>👥 Company Size:</strong>
                          <span>{brandProfile.companySize} employees</span>
                        </div>
                      )}

                      {brandProfile.foundedYear && (
                        <div className="profile-info-item">
                          <strong>📅 Founded:</strong>
                          <span>{brandProfile.foundedYear}</span>
                        </div>
                      )}
                    </div>

                    {(brandProfile.socialMedia?.  instagram || brandProfile.socialMedia?. twitter || 
                      brandProfile.socialMedia?. facebook || brandProfile.socialMedia?. linkedin) && (
                      <div className="profile-info-section">
                        <h3>🔗 Social Media</h3>
                        <div className="social-links">
                          {brandProfile.socialMedia?.instagram && (
                            <a href={brandProfile.socialMedia.  instagram} target="_blank" rel="noopener noreferrer" className="social-link">
                              📷 Instagram
                            </a>
                          )}
                          {brandProfile.socialMedia?.twitter && (
                            <a href={brandProfile.socialMedia. twitter} target="_blank" rel="noopener noreferrer" className="social-link">
                              🐦 Twitter
                            </a>
                          )}
                          {brandProfile.socialMedia?.facebook && (
                            <a href={brandProfile.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">
                              📘 Facebook
                            </a>
                          )}
                          {brandProfile.socialMedia?.linkedin && (
                            <a href={brandProfile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
                              💼 LinkedIn
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚙️</div>
                <h3>No profile yet</h3>
                <p>Create your brand profile to help influencers learn more about your company</p>
                <button className="btn-create-pro" onClick={() => setShowProfileModal(true)}>
                  Create Profile
                </button>
              </div>
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

      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content-pro modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>{brandProfile ?    'Edit' : 'Create'} Brand Profile</h2>
              <button className="close-btn-pro" onClick={() => setShowProfileModal(false)}>×</button>
            </div>

            <form onSubmit={handleSaveBrandProfile} className="campaign-form">
              <div className="form-group-pro">
                <label>Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Nike"
                  value={profileForm.companyName}
                  onChange={(e) => setProfileForm({ ...profileForm, companyName: e.target.value })}
                />
              </div>

              <div className="form-group-pro">
                <label>Industry *</label>
                <select
                  required
                  value={profileForm.industry}
                  onChange={(e) => setProfileForm({ ...profileForm, industry: e.target.value })}
                  className="select-industry-brand"
                >
                  <option value="">Select Industry</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Beauty">Beauty</option>
                  <option value="Technology">Technology</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Travel">Travel</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Fitness">Gaming</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group-pro">
                <label>Brand Description *</label>
                <textarea
                  required
                  placeholder="Tell influencers about your brand..."
                  value={profileForm.description}
                  onChange={(e) => setProfileForm({ ...profileForm, description: e.target.value })}
                  rows="4"
                />
              </div>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Website</label>
                  <input
                    type="url"
                    placeholder="https://www.yourbrand.com"
                    value={profileForm.website}
                    onChange={(e) => setProfileForm({ ...profileForm, website: e.target.value })}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Location</label>
                  <input
                    type="text"
                    placeholder="e.g., New York, USA"
                    value={profileForm.location}
                    onChange={(e) => setProfileForm({ ...   profileForm, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group-pro">
                  <label>Logo URL</label>
                  <input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={profileForm.logoUrl}
                    onChange={(e) => setProfileForm({ ...profileForm, logoUrl: e.target.value })}
                  />
                </div>

                <div className="form-group-pro">
                  <label>Founded Year</label>
                  <input
                    type="number"
                    placeholder="2020"
                    min="1800"
                    max="2025"
                    value={profileForm.foundedYear}
                    onChange={(e) => setProfileForm({ ...  profileForm, foundedYear: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-section-header">
                <h3>🔗 Social Media (Optional)</h3>
              </div>

              <div className="form-group-pro">
                <label>Instagram URL</label>
                <input
                  type="url"
                  placeholder="https://instagram.com/yourbrand"
                  value={profileForm.socialMedia.  instagram}
                  onChange={(e) => setProfileForm({
                    ...  profileForm,
                    socialMedia: { ...profileForm.socialMedia, instagram: e.target.value }
                  })}
                />
              </div>

              <div className="form-group-pro">
                <label>Twitter URL</label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourbrand"
                  value={profileForm.socialMedia.twitter}
                  onChange={(e) => setProfileForm({
                    ...  profileForm,
                    socialMedia: { ...profileForm.socialMedia, twitter: e.  target.  value }
                  })}
                />
              </div>

              <div className="form-group-pro">
                <label>Facebook URL</label>
                <input
                  type="url"
                  placeholder="https://facebook.com/yourbrand"
                  value={profileForm.socialMedia.facebook}
                  onChange={(e) => setProfileForm({
                    ... profileForm,
                    socialMedia:  { ...profileForm.socialMedia, facebook: e.target.value }
                  })}
                />
              </div>

              <div className="form-group-pro">
                <label>LinkedIn URL</label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/company/yourbrand"
                  value={profileForm.socialMedia.  linkedin}
                  onChange={(e) => setProfileForm({
                    ...profileForm,
                    socialMedia: { ...profileForm.  socialMedia, linkedin: e.  target. value }
                  })}
                />
              </div>

              <button type="submit" className="btn-submit-pro">
                {brandProfile ?  'Update Profile' :    'Create Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showApplicationsModal && (
        <div className="modal-overlay" onClick={() => setShowApplicationsModal(false)}>
          <div className="modal-content-pro modal-applications" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-pro">
              <h2>📋 Applications</h2>
              <button className="close-btn-pro" onClick={() => setShowApplicationsModal(false)}>×</button>
            </div>

            <div className="applications-list">
              {applications.length === 0 ? (
                <div className="empty-state-small">
                  <div className="empty-icon">📭</div>
                  <h3>No applications yet</h3>
                  <p>Influencers haven't applied to this campaign yet</p>
                </div>
              ) : (
                <div className="applications-grid">
                  {applications.map(app => (
                    <div key={app._id} className={`application-card status-${app.status}`}>
                      <div className="application-header">
                        <div className="applicant-info">
                          <div className="applicant-avatar">
                            {app.influencer?. name?.[0]?.toUpperCase() || 'I'}
                          </div>
                          <div>
                            <h4>{app.influencer?.name || 'Influencer'}</h4>
                            <p>{app.influencer?.email}</p>
                          </div>
                        </div>
                        <span className={`status-badge status-${app.status}`}>
                          {app.status === 'pending' && '⏳ Pending'}
                          {app.status === 'accepted' && '✅ Accepted'}
                          {app.  status === 'rejected' && '❌ Rejected'}
                        </span>
                      </div>

                      {app.influencerProfile && (
                        <div className="applicant-stats">
                          <div className="stat-item">
                            <span className="stat-label">Followers: </span>
                            <span className="stat-value">{formatNumber(app.influencerProfile.followers)}</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Engagement:</span>
                            <span className="stat-value">{app.influencerProfile.engagement}%</span>
                          </div>
                          <div className="stat-item">
                            <span className="stat-label">Tier:</span>
                            <span className="stat-value">{app.influencerProfile.tier}</span>
                          </div>
                        </div>
                      )}

                      {app.message && (
                        <div className="application-message">
                          <strong>Message:</strong>
                          <p>{app.  message}</p>
                        </div>
                      )}

                      <div className="application-date">
                        Applied:  {new Date(app.createdAt).toLocaleDateString()}
                      </div>

                      {app.status === 'pending' && (
                        <div className="application-actions">
                          <button 
                            className="btn-accept"
                            onClick={() => handleUpdateApplicationStatus(app._id, 'accepted')}
                          >
                            ✅ Accept
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleUpdateApplicationStatus(app._id, 'rejected')}
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
          </div>
        </div>
      )}

      {selectedInfluencer && (
        <InfluencerProfileModal
          influencer={selectedInfluencer}
          onClose={() => setSelectedInfluencer(null)}
        />
      )}
    </div>
  );
};

export default BrandDashboard;
