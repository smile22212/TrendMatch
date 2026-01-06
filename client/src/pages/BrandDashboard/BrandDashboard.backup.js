import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './BrandDashboard.css';

const BrandDashboard = () => {
  const { user, logoutUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('discover');
  const [campaigns, setCampaigns] = useState([]);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [maxFollowers, setMaxFollowers] = useState('');
  const [selectedNiches, setSelectedNiches] = useState([]);
  const [minEngagement, setMinEngagement] = useState('');
  const [selectedTier, setSelectedTier] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');

  // Campaign form states
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    description: '',
    budget:  '',
    deadline: '',
    requirements: ''
  });

  const niches = ['Fashion', 'Beauty', 'Lifestyle', 'Tech', 'Food', 'Travel', 'Fitness', 'Gaming'];
  const tiers = ['all', 'Nano', 'Micro', 'Mid-tier', 'Macro', 'Mega'];
  const locations = ['all', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany'];

  useEffect(() => {
    if (!user || user.role !== 'Brand') {
      navigate('/login');
    } else {
      fetchCampaigns();
      fetchInfluencers();
    }
  }, [user, navigate]);

  const fetchCampaigns = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5001/api/campaigns', {
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
      // Mock influencer data - replace with real API
      const mockInfluencers = [
        {
          _id: '1',
          username: 'fashioninfluencer',
          name: 'Fashion Influencer',
          avatar: 'https://i.pravatar.cc/150?img=47',
          followers: 50000,
          engagement: 8.5,
          niche: ['Fashion', 'Lifestyle', 'Beauty'],
          location: 'United States',
          verified: true,
          tier: 'Mid-tier',
          priceRange: { min: 432, max: 649 }
        },
        {
          _id: '2',
          username: 'beautyguru',
          name: 'Beauty Guru',
          avatar: 'https://i.pravatar.cc/150?img=32',
          followers: 125000,
          engagement: 12.3,
          niche: ['Beauty', 'Makeup', 'Skincare'],
          location: 'United Kingdom',
          verified: true,
          tier: 'Macro',
          priceRange: { min: 1250, max: 1875 }
        },
        {
          _id: '3',
          username: 'lifestyleblogger',
          name: 'Lifestyle Blogger',
          avatar: 'https://i.pravatar.cc/150?img=28',
          followers: 35000,
          engagement: 6.8,
          niche: ['Lifestyle', 'Travel', 'Wellness'],
          location: 'Canada',
          verified: false,
          tier: 'Micro',
          priceRange:  { min: 280, max: 420 }
        },
        {
          _id: '4',
          username: 'techreview',
          name: 'Tech Review Pro',
          avatar: 'https://i.pravatar.cc/150?img=15',
          followers: 89000,
          engagement: 9.2,
          niche: ['Tech', 'Gaming', 'Lifestyle'],
          location: 'United States',
          verified: true,
          tier: 'Mid-tier',
          priceRange: { min: 890, max: 1335 }
        },
        {
          _id: '5',
          username: 'foodieparadise',
          name: 'Foodie Paradise',
          avatar:  'https://i.pravatar.cc/150?img=45',
          followers: 67000,
          engagement: 11.5,
          niche: ['Food', 'Travel', 'Lifestyle'],
          location: 'Australia',
          verified: true,
          tier:  'Mid-tier',
          priceRange: { min: 720, max: 1080 }
        },
        {
          _id: '6',
          username: 'fitnessmotivation',
          name: 'Fitness Motivation',
          avatar: 'https://i.pravatar.cc/150?img=60',
          followers: 45000,
          engagement: 7.8,
          niche: ['Fitness', 'Wellness', 'Lifestyle'],
          location: 'Germany',
          verified: false,
          tier: 'Micro',
          priceRange: { min: 380, max: 570 }
        }
      ];
      
      setInfluencers(mockInfluencers);
    } catch (err) {
      console.error('Error fetching influencers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleNiche = (niche) => {
    if (selectedNiches.includes(niche)) {
      setSelectedNiches(selectedNiches.filter(n => n !== niche));
    } else {
      setSelectedNiches([... selectedNiches, niche]);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const getTierColor = (tier) => {
    const colors = {
      'Nano': '#9CA3AF',
      'Micro': '#60A5FA',
      'Mid-tier': '#34D399',
      'Macro': '#F59E0B',
      'Mega': '#EF4444'
    };
    return colors[tier] || '#9CA3AF';
  };

  const getFilteredInfluencers = () => {
    let filtered = [... influencers];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(inf =>
        inf.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inf.username.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Followers filter
    if (minFollowers) {
      filtered = filtered. filter(inf => inf.followers >= parseInt(minFollowers));
    }
    if (maxFollowers) {
      filtered = filtered.filter(inf => inf.followers <= parseInt(maxFollowers));
    }

    // Niche filter
    if (selectedNiches.length > 0) {
      filtered = filtered.filter(inf =>
        inf.niche.some(n => selectedNiches.includes(n))
      );
    }

    // Engagement filter
    if (minEngagement) {
      filtered = filtered. filter(inf => inf.engagement >= parseFloat(minEngagement));
    }

    // Tier filter
    if (selectedTier !== 'all') {
      filtered = filtered. filter(inf => inf.tier === selectedTier);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(inf => inf.location === selectedLocation);
    }

    return filtered;
  };

  const handleViewProfile = (influencer) => {
    alert(`👤 ${influencer.name}\n\nUsername: @${influencer.username}\nFollowers: ${formatNumber(influencer.followers)}\nEngagement: ${influencer.engagement}%\nLocation: ${influencer. location}\nPrice:  $${influencer.priceRange. min} - $${influencer. priceRange.max}`);
  };

  const handleSendRequest = (influencer) => {
    if (campaigns.length === 0) {
      alert("⚠️ Please create a campaign first!");
      setShowCreateModal(true);
      return;
    }
    alert(`✅ Sending request to ${influencer.name}! \n\nThis feature will be fully implemented soon.`);
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5001/api/campaigns', campaignForm, {
        headers:  { 'x-auth-token': token }
      });
      setShowCreateModal(false);
      setCampaignForm({ title: '', description: '', budget: '', deadline:  '', requirements: '' });
      fetchCampaigns();
    } catch (err) {
      console.error('Error creating campaign:', err);
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
        <header className="dashboard-header">
          <div>
            <h1>Welcome, {user?.name}!</h1>
            <p className="subtitle">Find the perfect influencers for your brand</p>
          </div>
          <button className="btn-create" onClick={() => setShowCreateModal(true)}>
            ➕ Create Campaign
          </button>
        </header>

        {/* Discover Influencers Tab */}
        {activeTab === 'discover' && (
          <div className="discover-section">
            {/* Filters */}
            <div className="filters-panel">
              <h3>🔍 Search & Filter</h3>

              <div className="filter-group">
                <label>Search Influencers</label>
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e. target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-row">
                <div className="filter-group">
                  <label>Min Followers</label>
                  <input
                    type="number"
                    placeholder="e.g.  10000"
                    value={minFollowers}
                    onChange={(e) => setMinFollowers(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Max Followers</label>
                  <input
                    type="number"
                    placeholder="e. g. 100000"
                    value={maxFollowers}
                    onChange={(e) => setMaxFollowers(e.target. value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label>Content Niches</label>
                <div className="niche-pills">
                  {niches. map(niche => (
                    <button
                      key={niche}
                      className={`niche-pill ${selectedNiches.includes(niche) ? 'active' : ''}`}
                      onClick={() => toggleNiche(niche)}
                    >
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Min Engagement Rate (%)</label>
                <input
                  type="number"
                  placeholder="e.g.  5"
                  value={minEngagement}
                  onChange={(e) => setMinEngagement(e.target.value)}
                  step="0.1"
                />
              </div>

              <div className="filter-group">
                <label>Influencer Tier</label>
                <select value={selectedTier} onChange={(e) => setSelectedTier(e.target.value)}>
                  {tiers.map(tier => (
                    <option key={tier} value={tier}>
                      {tier === 'all' ? 'All Tiers' : tier}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Location</label>
                <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
                  {locations. map(loc => (
                    <option key={loc} value={loc}>
                      {loc === 'all' ? 'All Locations' : loc}
                    </option>
                  ))}
                </select>
              </div>

              <button className="btn-reset" onClick={() => {
                setSearchTerm('');
                setMinFollowers('');
                setMaxFollowers('');
                setSelectedNiches([]);
                setMinEngagement('');
                setSelectedTier('all');
                setSelectedLocation('all');
              }}>
                🔄 Reset Filters
              </button>
            </div>

            {/* Results */}
            <div className="results-section">
              <div className="results-header">
                <h3>Found {getFilteredInfluencers().length} Influencers</h3>
              </div>

              {loading ? (
                <div className="loading">Loading influencers...</div>
              ) : (
                <div className="influencer-grid">
                  {getFilteredInfluencers().map(influencer => (
                    <div key={influencer._id} className="influencer-card">
                      <div className="influencer-header">
                        <img src={influencer.avatar} alt={influencer.name} className="influencer-avatar" />
                        {influencer.verified && <div className="verified-badge">✓</div>}
                      </div>

                      <h4>{influencer.name}</h4>
                      <p className="username">@{influencer.username}</p>

                      <div className="tier-badge" style={{ background: `${getTierColor(influencer.tier)}20`, color: getTierColor(influencer.tier) }}>
                        {influencer.tier}
                      </div>

                      <div className="stats-row">
                        <div className="stat">
                          <span className="stat-value">{formatNumber(influencer. followers)}</span>
                          <span className="stat-label">Followers</span>
                        </div>
                        <div className="stat">
                          <span className="stat-value">{influencer.engagement}%</span>
                          <span className="stat-label">Engagement</span>
                        </div>
                      </div>

                      <div className="niches">
                        {influencer.niche.slice(0, 3).map(n => (
                          <span key={n} className="niche-tag">{n}</span>
                        ))}
                      </div>

                      <div className="location">📍 {influencer.location}</div>

                      <div className="price-range">
                        ${influencer.priceRange.min} - ${influencer.priceRange.max}
                      </div>

                      <div className="card-actions">
                        <button className="btn-view" onClick={() => handleViewProfile(influencer)}>View Profile</button>
                        <button className="btn-contact" onClick={() => handleSendRequest(influencer)}>Send Request</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Campaigns Tab */}
        {activeTab === 'campaigns' && (
          <div className="campaigns-section">
            <h2>My Campaigns</h2>
            <div className="campaigns-grid">
              {campaigns.map(campaign => (
                <div key={campaign._id} className="campaign-card">
                  <h3>{campaign.title}</h3>
                  <p>{campaign.description}</p>
                  <div className="campaign-meta">
                    <span>💰 ${campaign.budget}</span>
                    <span>📅 {new Date(campaign.deadline).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Campaign Analytics</h2>
            <p>Coming soon...</p>
          </div>
        )}
      </main>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Campaign</h2>
              <button className="close-btn" onClick={() => setShowCreateModal(false)}>×</button>
            </div>

            <form onSubmit={handleCreateCampaign}>
              <div className="form-group">
                <label>Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({...campaignForm, title: e.target. value})}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  required
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({... campaignForm, description: e. target.value})}
                />
              </div>

              <div className="form-group">
                <label>Budget ($)</label>
                <input
                  type="number"
                  required
                  value={campaignForm.budget}
                  onChange={(e) => setCampaignForm({...campaignForm, budget: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input
                  type="date"
                  required
                  value={campaignForm.deadline}
                  onChange={(e) => setCampaignForm({...campaignForm, deadline: e.target. value})}
                />
              </div>

              <div className="form-group">
                <label>Requirements</label>
                <textarea
                  value={campaignForm.requirements}
                  onChange={(e) => setCampaignForm({...campaignForm, requirements: e.target.value})}
                />
              </div>

              <button type="submit" className="btn-submit">Create Campaign</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandDashboard;
