const mongoose = require('mongoose');

const communityReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
    default: 'Citizen Reporter',
  },
  category: {
    type: String,
    enum: ['garbage_burning', 'construction_dust', 'industrial_smoke', 'heavy_traffic', 'other'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000,
  },
  location: {
    address: { type: String, required: true },
    city: { type: String, default: 'New Delhi' },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
  },
  image: {
    type: String, // URL or base64 placeholder
  },
  verificationStatus: {
    type: String,
    enum: ['unverified', 'investigating', 'verified', 'resolved'],
    default: 'unverified',
  },
  verifiedBy: {
    type: String,
    default: null,
  },
  upvotes: {
    type: Number,
    default: 1,
  },
  upvotedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  actionTaken: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

module.exports = mongoose.model('CommunityReport', communityReportSchema);
