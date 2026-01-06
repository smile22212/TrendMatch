// Instagram Service - Mock Data (will swap with real API later)

const mockInstagramData = {
  'fashioninfluencer': {
    username: 'fashioninfluencer',
    fullName: 'Fashion Influencer',
    profilePicture: 'https://i.pravatar.cc/150?img=5',
    followersCount: 50000,
    followingCount: 800,
    postsCount: 245,
    biography: 'Fashion & Lifestyle 👗 Sustainable Fashion Advocate 🌱 Collaborations:  DM',
    website: 'www.fashioninfluencer.com',
    engagementRate: 8.5,
    averageLikes: 4250,
    averageComments: 180,
    topPosts: [
      {
        id: '1',
        imageUrl: 'https://picsum.photos/400/400? random=1',
        likes: 5200,
        comments: 240,
        caption: 'Summer collection vibes ☀️'
      },
      {
        id: '2',
        imageUrl: 'https://picsum.photos/400/400?random=2',
        likes: 4800,
        comments: 190,
        caption: 'Sustainable fashion is the future 🌱'
      },
      {
        id: '3',
        imageUrl: 'https://picsum.photos/400/400?random=3',
        likes: 4500,
        comments: 165,
        caption: 'New collaboration dropping soon!  🔥'
      }
    ],
    demographics: {
      ageRange: '18-34',
      topCountries: ['United States', 'United Kingdom', 'Canada'],
      genderSplit: { female: 75, male: 25 }
    },
    niche: ['Fashion', 'Lifestyle', 'Sustainable Fashion'],
    verified: true,
    lastUpdated: new Date().toISOString()
  },
  'beautyguru': {
    username: 'beautyguru',
    fullName: 'Beauty Guru',
    profilePicture: 'https://i.pravatar.cc/150?img=10',
    followersCount: 125000,
    followingCount:  500,
    postsCount: 580,
    biography: 'Makeup Artist 💄 Beauty Tips & Tutorials 📹 Brand Partnerships: beautyguru@email.com',
    website: 'linktr.ee/beautyguru',
    engagementRate: 12.3,
    averageLikes: 15375,
    averageComments:  890,
    topPosts: [
      {
        id: '1',
        imageUrl: 'https://picsum.photos/400/400?random=4',
        likes: 18200,
        comments: 1050,
        caption: 'New makeup tutorial out now! 💄'
      },
      {
        id: '2',
        imageUrl: 'https://picsum.photos/400/400?random=5',
        likes: 16500,
        comments: 920,
        caption: 'Glowing skin secrets ✨'
      },
      {
        id: '3',
        imageUrl: 'https://picsum.photos/400/400?random=6',
        likes: 14200,
        comments: 780,
        caption: 'Collab with @beautybrand 🎉'
      }
    ],
    demographics: {
      ageRange: '18-44',
      topCountries: ['United States', 'India', 'Brazil'],
      genderSplit:  { female: 85, male: 15 }
    },
    niche: ['Beauty', 'Makeup', 'Skincare'],
    verified: true,
    lastUpdated: new Date().toISOString()
  },
  'lifestyleblogger': {
    username:  'lifestyleblogger',
    fullName: 'Lifestyle Blogger',
    profilePicture: 'https://i.pravatar.cc/150? img=15',
    followersCount: 35000,
    followingCount:  1200,
    postsCount:  180,
    biography: 'Living my best life 🌟 Travel • Food • Fashion DM for collabs',
    website: '',
    engagementRate: 6.8,
    averageLikes: 2380,
    averageComments:  95,
    topPosts: [
      {
        id: '1',
        imageUrl: 'https://picsum.photos/400/400?random=7',
        likes: 3200,
        comments: 145,
        caption: 'Travel diaries 🌍'
      },
      {
        id: '2',
        imageUrl: 'https://picsum.photos/400/400?random=8',
        likes: 2800,
        comments: 110,
        caption: 'Food adventures 🍕'
      },
      {
        id:  '3',
        imageUrl:  'https://picsum.photos/400/400?random=9',
        likes: 2500,
        comments: 88,
        caption: 'Weekend vibes ☀️'
      }
    ],
    demographics: {
      ageRange: '25-44',
      topCountries: ['United States', 'Australia', 'United Kingdom'],
      genderSplit: { female: 70, male: 30 }
    },
    niche: ['Lifestyle', 'Travel', 'Food'],
    verified: false,
    lastUpdated: new Date().toISOString()
  }
};

// Simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock Instagram Service
export const instagramService = {
  // Connect Instagram account (mock)
  connectAccount: async (username) => {
    await delay(1000);
    
    const userData = mockInstagramData[username. toLowerCase()];
    
    if (! userData) {
      // Generate random data for unknown users
      return {
        username,
        fullName: username.charAt(0).toUpperCase() + username.slice(1),
        profilePicture: `https://i.pravatar.cc/150?u=${username}`,
        followersCount: Math.floor(Math. random() * 100000) + 10000,
        followingCount: Math.floor(Math.random() * 2000) + 500,
        postsCount: Math.floor(Math.random() * 500) + 50,
        biography: 'Content creator and influencer',
        website: '',
        engagementRate: (Math.random() * 10 + 2).toFixed(1),
        averageLikes: Math.floor(Math.random() * 5000) + 500,
        averageComments:  Math.floor(Math.random() * 200) + 20,
        topPosts: [],
        demographics: {
          ageRange: '18-34',
          topCountries: ['United States', 'United Kingdom', 'Canada'],
          genderSplit: { female:  60, male: 40 }
        },
        niche: ['General'],
        verified: false,
        lastUpdated: new Date().toISOString()
      };
    }
    
    return userData;
  },

  // Get Instagram profile data
  getProfile: async (username) => {
    await delay(500);
    return mockInstagramData[username.toLowerCase()] || null;
  },

  // Calculate engagement rate
  calculateEngagementRate: (likes, comments, followers) => {
    if (followers === 0) return 0;
    return (((likes + comments) / followers) * 100).toFixed(2);
  },

  // Search influencers by criteria
  searchInfluencers:  async (filters = {}) => {
    await delay(800);
    
    let results = Object.values(mockInstagramData);
    
    // Filter by followers
    if (filters.minFollowers) {
      results = results.filter(u => u.followersCount >= filters.minFollowers);
    }
    if (filters.maxFollowers) {
      results = results.filter(u => u.followersCount <= filters.maxFollowers);
    }
    
    // Filter by engagement rate
    if (filters. minEngagement) {
      results = results. filter(u => u.engagementRate >= filters.minEngagement);
    }
    
    // Filter by niche
    if (filters.niche) {
      results = results.filter(u => 
        u.niche.some(n => n.toLowerCase().includes(filters.niche.toLowerCase()))
      );
    }
    
    // Filter by verified
    if (filters. verifiedOnly) {
      results = results.filter(u => u. verified);
    }
    
    return results;
  },

  // Get influencer tier based on followers
  getInfluencerTier: (followers) => {
    if (followers < 10000) return { tier: 'Nano', color: '#9AA5B1' };
    if (followers < 50000) return { tier: 'Micro', color: '#00D084' };
    if (followers < 100000) return { tier: 'Mid-tier', color: '#00B570' };
    if (followers < 500000) return { tier: 'Macro', color: '#7CFF9B' };
    return { tier: 'Mega', color: '#FFD700' };
  },

  // Estimate collaboration cost
  estimateCost: (followers, engagementRate) => {
    const baseCost = followers * 0.01;
    const engagementMultiplier = 1 + (engagementRate / 100);
    const estimatedCost = baseCost * engagementMultiplier;
    
    return {
      min: Math.floor(estimatedCost * 0.8),
      max: Math.floor(estimatedCost * 1.2),
      currency: 'USD'
    };
  }
};

export default instagramService;
