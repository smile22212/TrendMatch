const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');

// @route   POST /api/applications
// @desc    Create a new application
// @access  Private (Influencer only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'Influencer') {
      return res.status(403).json({ msg: 'Only influencers can apply to campaigns' });
    }

    const { campaign, message } = req.body;

    // Check if campaign exists
    const campaignExists = await Campaign.findById(campaign);
    if (!campaignExists) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      campaign,
      influencer: req.user.id
    });

    if (existingApplication) {
      return res.status(400).json({ msg: 'You have already applied to this campaign' });
    }

    const application = new Application({
      campaign,
      influencer: req. user.id,
      message
    });

    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/applications
// @desc    Get applications (for influencer:  their applications, for brand: applications to their campaigns)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let applications;

    if (req.user.role === 'Influencer') {
      applications = await Application.find({ influencer: req.user.id })
        .populate({
          path: 'campaign',
          populate: {
            path: 'brand',
            select: 'name email'
          }
        })
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'Brand') {
      const campaigns = await Campaign.find({ brand: req.user.id });
      const campaignIds = campaigns.map(c => c._id);
      
      applications = await Application.find({ campaign: { $in: campaignIds } })
        .populate('influencer', 'name email')
        .populate('campaign', 'title budget deadline')
        .sort({ createdAt: -1 });
    }

    res.json(applications);
  } catch (err) {
    console.error(err. message);
    res.status(500).send('Server error');
  }
});

// @route   PUT /api/applications/:id
// @desc    Update application status
// @access  Private (Brand only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user. role !== 'Brand') {
      return res.status(403).json({ msg: 'Only brands can update application status' });
    }

    const { status } = req.body;

    const application = await Application.findById(req.params.id).populate('campaign');

    if (!application) {
      return res.status(404).json({ msg: 'Application not found' });
    }

    // Check if brand owns the campaign
    if (application.campaign.brand.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    application.status = status;
    await application.save();

    res.json(application);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
