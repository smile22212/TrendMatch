const mongoose = require('mongoose');

const CampaignSchema = new mongoose. Schema({
  brand: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required:  true
  },
  description:  {
    type: String,
    required: true
  },
  budget: {
    type:  Number,
    required: true
  },
  requirements: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Campaign', CampaignSchema);
