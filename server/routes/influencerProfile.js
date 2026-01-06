const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const InfluencerProfile = require('../models/InfluencerProfile');
const User = require('../models/User');

// @route   GET /api/influencer-profile/me
// @desc    Get current influencer's profile
// @access  Private (Influencer only)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findOne({ user: req.user. id }).populate('user', 'name email');
    
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/influencer-profile
// @desc    Create or update influencer profile
// @access  Private (Influencer only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 Received profile data:', req.body);
    console.log('👤 User ID:', req.user.id);

    // Check if user is influencer
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('❌ User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('✅ User found:', user. email, 'Role:', user. role);

    if (user.role !== 'Influencer') {
      console.error('❌ Not an influencer');
      return res.status(403).json({ msg: 'Only influencers can create profiles' });
    }

    const {
      bio,
      location,
      followers,
      engagement,
      avgLikes,
      collabCostMin,
      collabCostMax,
      niches,
      ageRange,
      topCountries,
      genderFemale,
      genderMale
    } = req.body;

    // Calculate tier based on followers
    let tier = 'Nano';
    const followerCount = parseInt(followers) || 0;
    if (followerCount >= 1000000) {
      tier = 'Mega';
    } else if (followerCount >= 500000) {
      tier = 'Macro';
    } else if (followerCount >= 50000) {
      tier = 'Mid-tier';
    } else if (followerCount >= 10000) {
      tier = 'Micro';
    }

    // Build profile object
    const profileFields = {
      user: req.user.id,
      bio:  bio || '',
      location: location || '',
      followers: followerCount,
      engagement: parseFloat(engagement) || 0,
      avgLikes: parseInt(avgLikes) || 0,
      collabCostMin:  parseInt(collabCostMin) || 0,
      collabCostMax: parseInt(collabCostMax) || 0,
      niches: Array.isArray(niches) ? niches : [],
      ageRange:  ageRange || '',
      topCountries: topCountries || '',
      genderFemale:  parseInt(genderFemale) || 50,
      genderMale: parseInt(genderMale) || 50,
      tier: tier,
      updatedAt: Date.now()
    };

    console.log('💾 Profile fields to save:', profileFields);

    // Check if profile exists
    let profile = await InfluencerProfile. findOne({ user: req.user.id });

    if (profile) {
      console.log('📝 Updating existing profile');
      // Update existing profile
      profile = await InfluencerProfile.findOneAndUpdate(
        { user: req.user. id },
        { $set:  profileFields },
        { new:  true }
      ).populate('user', 'name email');

      console.log('✅ Profile updated successfully');
      return res.json(profile);
    }

    console.log('🆕 Creating new profile');
    // Create new profile
    profile = new InfluencerProfile(profileFields);
    await profile. save();
    
    profile = await InfluencerProfile. findById(profile._id).populate('user', 'name email');
    
    console.log('✅ Profile created successfully');
    res.json(profile);
  } catch (err) {
    console.error('💥 ERROR saving profile:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ msg: 'Server error', error: err. message });
  }
});

// @route   GET /api/influencer-profile/all
// @desc    Get all influencer profiles (for brands to browse)
// @access  Private (Brand only)
router.get('/all', auth, async (req, res) => {
  try {
    const { niche, minFollowers, maxFollowers, minPrice, maxPrice, location, tier } = req.query;

    // Build filter object
    let filter = {};

    if (niche) {
      filter.niches = { $in: [niche] };
    }

    if (minFollowers) {
      filter.followers = { ... filter.followers, $gte: parseInt(minFollowers) };
    }

    if (maxFollowers) {
      filter.followers = { ...filter.followers, $lte: parseInt(maxFollowers) };
    }

    if (minPrice) {
      filter.collabCostMin = { $gte: parseInt(minPrice) };
    }

    if (maxPrice) {
      filter.collabCostMax = { $lte: parseInt(maxPrice) };
    }

    if (location) {
      filter.location = { $regex: location, $options: 'i' };
    }

    if (tier) {
      filter.tier = tier;
    }

    const profiles = await InfluencerProfile.find(filter)
      .populate('user', 'name email')
      .sort({ followers: -1 });

    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/influencer-profile/:id
// @desc    Get influencer profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await InfluencerProfile.findById(req.params.id).populate('user', 'name email');

    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res. status(404).json({ msg: 'Profile not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
