const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const BrandProfile = require('../models/BrandProfile');
const User = require('../models/User');

// @route   GET /api/brand-profile/me
// @desc    Get current brand's profile
// @access  Private (Brand only)
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await BrandProfile. findOne({ user: req.user.id }).populate('user', 'name email');
    
    if (!profile) {
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST /api/brand-profile
// @desc    Create or update brand profile
// @access  Private (Brand only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 Received brand profile data:', req.body);
    console.log('👤 User ID:', req.user.id);

    // Check if user is brand
    const user = await User.findById(req.user.id);
    if (!user) {
      console.error('❌ User not found');
      return res.status(404).json({ msg: 'User not found' });
    }

    console.log('✅ User found:', user.email, 'Role:', user.role);

    if (user.role !== 'Brand') {
      console.error('❌ Not a brand');
      return res.status(403).json({ msg: 'Only brands can create profiles' });
    }

    const {
      companyName,
      industry,
      description,
      website,
      logoUrl,
      location,
      companySize,
      foundedYear,
      socialMedia
    } = req.body;

    // Build profile object
    const profileFields = {
      user: req.user.id,
      companyName:  companyName || '',
      industry: industry || '',
      description: description || '',
      website: website || '',
      logoUrl: logoUrl || '',
      location: location || '',
      companySize: companySize || '1-10',
      foundedYear: foundedYear || null,
      socialMedia: socialMedia || {},
      updatedAt: Date.now()
    };

    console.log('💾 Profile fields to save:', profileFields);

    // Check if profile exists
    let profile = await BrandProfile.findOne({ user: req.user.id });

    if (profile) {
      console.log('📝 Updating existing profile');
      profile = await BrandProfile.findOneAndUpdate(
        { user:  req.user.id },
        { $set: profileFields },
        { new: true }
      ).populate('user', 'name email');

      console.log('✅ Profile updated successfully');
      return res.json(profile);
    }

    console.log('🆕 Creating new profile');
    profile = new BrandProfile(profileFields);
    await profile. save();
    
    profile = await BrandProfile.findById(profile._id).populate('user', 'name email');
    
    console.log('✅ Profile created successfully');
    res.json(profile);
  } catch (err) {
    console.error('💥 ERROR saving profile:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ msg: 'Server error', error: err.message });
  }
});

// @route   GET /api/brand-profile/: id
// @desc    Get brand profile by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const profile = await BrandProfile.findById(req.params.id).populate('user', 'name email');

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

// @route   GET /api/brand-profile/user/:userId
// @desc    Get brand profile by user ID
// @access  Private
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const profile = await BrandProfile. findOne({ user: req.params.userId }).populate('user', 'name email');

    if (!profile) {
      return res. status(404).json({ msg: 'Profile not found' });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
