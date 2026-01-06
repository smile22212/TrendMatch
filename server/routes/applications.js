const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');

// @route   POST /api/applications
// @desc    Apply to a campaign
// @access  Private (Influencer only)
router.post('/', auth, async (req, res) => {
  try {
    console.log('📥 Application received:', req.body);
    console.log('👤 User ID:', req.user. id);

    const { campaignId, message } = req.body;

    if (!campaignId) {
      console.error('❌ No campaignId provided');
      return res.status(400).json({ msg: 'Campaign ID is required' });
    }

    if (!message) {
      console.error('❌ No message provided');
      return res.status(400).json({ msg: 'Message is required' });
    }

    // Check if campaign exists
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) {
      console.error('❌ Campaign not found');
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    console.log('✅ Campaign found:', campaign. title);

    // Check if already applied
    const existingApp = await Application.findOne({
      campaign: campaignId,
      influencer: req.user.id
    });

    if (existingApp) {
      console.error('❌ Already applied');
      return res.status(400).json({ msg: 'You have already applied to this campaign' });
    }

    const application = new Application({
      campaign: campaignId,
      influencer:  req.user.id,
      message
    });

    await application.save();
    
    console.log('✅ Application saved successfully:', application._id);
    res.json(application);
  } catch (err) {
    console.error('💥 ERROR submitting application:', err);
    res.status(500).json({ msg: 'Server error', error:  err.message });
  }
});

// @route   GET /api/applications/my-applications
// @desc    Get influencer's applications
// @access  Private (Influencer)
router.get('/my-applications', auth, async (req, res) => {
  try {
    console.log('📥 Fetching applications for user:', req.user.id);

    const applications = await Application.find({ influencer: req.user.id })
      .populate('campaign')
      .populate({
        path: 'campaign',
        populate: { path: 'brand', select: 'name email' }
      })
      .sort({ appliedAt: -1 });

    console.log(`✅ Found ${applications.length} applications`);
    res.json(applications);
  } catch (err) {
    console.error('💥 ERROR fetching applications:', err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
