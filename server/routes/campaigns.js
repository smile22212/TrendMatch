const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const auth = require('../middleware/auth');

// @route   POST /api/campaigns
// @desc    Create a new campaign
// @access  Private (Brand only)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is a brand
    if (req.user.role !== 'Brand') {
      return res.status(403).json({ msg: 'Only brands can create campaigns' });
    }

    const { title, description, budget, requirements, deadline } = req.body;

    const campaign = new Campaign({
      brand: req.user. id,
      title,
      description,
      budget,
      requirements,
      deadline
    });

    await campaign.save();

    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/campaigns
// @desc    Get all campaigns for a brand
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let campaigns;
    
    if (req.user.role === 'Brand') {
      // Brands see only their campaigns
      campaigns = await Campaign.find({ brand: req.user.id }).sort({ createdAt: -1 });
    } else {
      // Influencers see all active campaigns
      campaigns = await Campaign. find({ status: 'active' })
        .populate('brand', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(campaigns);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET /api/campaigns/: id
// @desc    Get campaign by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id).populate('brand', 'name email');

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    res.json(campaign);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res. status(404).json({ msg: 'Campaign not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete a campaign
// @access  Private (Brand only - own campaigns)
router.delete('/:id', auth, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);

    if (!campaign) {
      return res.status(404).json({ msg: 'Campaign not found' });
    }

    // Check if the brand owns this campaign
    if (campaign.brand.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await campaign.deleteOne();

    res.json({ msg: 'Campaign removed' });
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res. status(404).json({ msg: 'Campaign not found' });
    }
    res.status(500).send('Server error');
  }
});

module.exports = router;
