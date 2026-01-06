  // Add this state for filters (add near other useState)
  const [filters, setFilters] = useState({
    search: '',
    minFollowers: '',
    maxFollowers: '',
    minEngagement:  '',
    selectedNiches: [],
    tier: 'All Tiers',
    location: 'All Locations'
  });

  // Add filtered influencers logic
  const filteredInfluencers = influencers.filter(influencer => {
    // Search filter
    if (filters.search && !influencer.name.toLowerCase().includes(filters.search.toLowerCase()) && 
        !influencer. username.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Followers filter
    if (filters.minFollowers && influencer.followers < parseInt(filters.minFollowers)) {
      return false;
    }
    if (filters.maxFollowers && influencer.followers > parseInt(filters.maxFollowers)) {
      return false;
    }

    // Engagement filter
    if (filters.minEngagement && influencer.engagement < parseFloat(filters.minEngagement)) {
      return false;
    }

    // Niche filter
    if (filters.selectedNiches.length > 0) {
      const hasMatchingNiche = filters.selectedNiches.some(niche => 
        influencer.niches.includes(niche)
      );
      if (!hasMatchingNiche) return false;
    }

    // Tier filter
    if (filters.tier !== 'All Tiers' && influencer.tier !== filters.tier) {
      return false;
    }

    // Location filter
    if (filters. location !== 'All Locations' && influencer.location !== filters. location) {
      return false;
    }

    return true;
  });

  const toggleNiche = (niche) => {
    setFilters(prev => ({
      ...prev,
      selectedNiches: prev.selectedNiches.includes(niche)
        ? prev.selectedNiches.filter(n => n !== niche)
        : [...prev.selectedNiches, niche]
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      minFollowers: '',
      maxFollowers: '',
      minEngagement: '',
      selectedNiches: [],
      tier: 'All Tiers',
      location: 'All Locations'
    });
  };
