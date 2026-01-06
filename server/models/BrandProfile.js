const mongoose = require('mongoose');

const BrandProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose. Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  companyName: {
    type:  String,
    required: true
  },
  industry: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  website: {
    type: String
  },
  logoUrl: {
    type: String
  },
  location: {
    type: String
  },
  companySize: {
    type:  String,
    enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
    default: '1-10'
  },
  foundedYear: {
    type:  Number
  },
  socialMedia: {
    instagram: String,
    twitter: String,
    facebook: String,
    linkedin: String
  },
  createdAt: {
    type:  Date,
    default: Date. now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose. model('BrandProfile', BrandProfileSchema);
