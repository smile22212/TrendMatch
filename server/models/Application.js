const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  campaign: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
  influencer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  influencerProfile: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'InfluencerProfile'
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String
  },
  createdAt:  {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose. model('Application', ApplicationSchema);
