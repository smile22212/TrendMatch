const mongoose = require('mongoose');

const InfluencerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema. Types.ObjectId,
    ref: 'User',
    required: true,
    unique:  true
  },
  bio:  {
    type: String,
    default: ''
  },
  location: {
    type:  String,
    default: ''
  },
  followers: {
    type: Number,
    default: 0
  },
  engagement: {
    type: Number,
    default: 0
  },
  avgLikes:  {
    type: Number,
    default: 0
  },
  collabCostMin:  {
    type: Number,
    default: 0
  },
  collabCostMax:  {
    type: Number,
    default: 0
  },
  niches: [{
    type: String
  }],
  ageRange: {
    type: String,
    default:  ''
  },
  topCountries: {
    type: String,
    default: ''
  },
  genderFemale: {
    type: Number,
    default: 50
  },
  genderMale:  {
    type: Number,
    default: 50
  },
  tier: {
    type: String,
    enum: ['Nano', 'Micro', 'Mid-tier', 'Macro', 'Mega'],
    default: 'Nano'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InfluencerProfile', InfluencerProfileSchema);
