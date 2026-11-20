const CommunityReport = require('../models/CommunityReport');
const Challenge = require('../models/Challenge');
const User = require('../models/User');

// Seed default challenges if none exist
const DEFAULT_CHALLENGES = [
  {
    title: 'Metro Commute Week',
    description: 'Replace 5 private vehicle trips with the metro or electric bus this week.',
    category: 'transit',
    points: 150,
    badge: 'Transit Champion',
    difficulty: 'Easy',
    durationDays: 7,
    targetValue: 5,
    targetUnit: 'trips',
  },
  {
    title: 'Zero Waste Burning Watch',
    description: 'Verify your immediate neighborhood or report open leaf/trash fires to authorities.',
    category: 'community',
    points: 200,
    badge: 'Clean Air Guardian',
    difficulty: 'Medium',
    durationDays: 14,
    targetValue: 3,
    targetUnit: 'reports',
  },
  {
    title: 'Active Mobility 20K',
    description: 'Walk or cycle for short distance errands during clean air hours.',
    category: 'transit',
    points: 100,
    badge: 'Zero Emission Mover',
    difficulty: 'Medium',
    durationDays: 7,
    targetValue: 20,
    targetUnit: 'km',
  },
  {
    title: 'Indoor Air Fortress',
    description: 'Inspect air purifier filters, seal drafts, and eliminate indoor incense for 7 consecutive days.',
    category: 'indoor',
    points: 120,
    badge: 'HEPA Shield',
    difficulty: 'Easy',
    durationDays: 7,
    targetValue: 7,
    targetUnit: 'days',
  },
];

exports.createReport = async (req, res, next) => {
  try {
    const { category, description, address, coordinates, city, image } = req.body;

    if (!category || !description || !coordinates) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, and coordinates are required.',
      });
    }

    const report = await CommunityReport.create({
      userId: req.user.id,
      userName: req.user.name || 'Citizen Reporter',
      category,
      description,
      location: {
        address: address || 'Reported Location',
        city: city || 'New Delhi',
        coordinates,
      },
      image: image || null,
      verificationStatus: 'unverified',
    });

    // Reward reporting citizen with 20 eco-points
    await User.findByIdAndUpdate(req.user.id, { $inc: { points: 20 } });

    res.status(201).json({
      success: true,
      message: 'Report submitted! Thank you for helping keep our air clean.',
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

exports.getReports = async (req, res, next) => {
  try {
    const { category, status } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (status) filter.verificationStatus = status;

    const reports = await CommunityReport.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (err) {
    next(err);
  }
};

exports.verifyReport = async (req, res, next) => {
  try {
    const { status, actionTaken } = req.body;
    const report = await CommunityReport.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status || 'verified',
        verifiedBy: req.user.name,
        actionTaken: actionTaken || 'Under administrative review by municipal dispatch.',
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (err) {
    next(err);
  }
};

exports.upvoteReport = async (req, res, next) => {
  try {
    const report = await CommunityReport.findById(req.params.id);
    if (!report) return res.status(404).json({ success: false, message: 'Report not found' });

    const hasUpvoted = report.upvotedBy.includes(req.user.id);
    if (hasUpvoted) {
      report.upvotes -= 1;
      report.upvotedBy = report.upvotedBy.filter(id => id.toString() !== req.user.id.toString());
    } else {
      report.upvotes += 1;
      report.upvotedBy.push(req.user.id);
    }

    await report.save();
    res.status(200).json({
      success: true,
      upvotes: report.upvotes,
      hasUpvoted: !hasUpvoted,
    });
  } catch (err) {
    next(err);
  }
};

exports.getChallenges = async (req, res, next) => {
  try {
    let challenges = await Challenge.find({ active: true });
    if (challenges.length === 0) {
      challenges = await Challenge.insertMany(DEFAULT_CHALLENGES);
    }

    res.status(200).json({
      success: true,
      data: challenges,
    });
  } catch (err) {
    next(err);
  }
};

exports.joinChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const isParticipant = challenge.participants.some(p => p.userId.toString() === req.user.id.toString());
    if (isParticipant) {
      return res.status(400).json({ success: false, message: 'You have already joined this challenge.' });
    }

    challenge.participants.push({
      userId: req.user.id,
      currentProgress: 0,
      completed: false,
    });

    await challenge.save();
    res.status(200).json({
      success: true,
      message: 'Joined challenge successfully!',
      data: challenge,
    });
  } catch (err) {
    next(err);
  }
};

exports.completeChallenge = async (req, res, next) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ success: false, message: 'Challenge not found' });

    const participant = challenge.participants.find(p => p.userId.toString() === req.user.id.toString());
    if (!participant) {
      return res.status(400).json({ success: false, message: 'You have not joined this challenge yet.' });
    }

    participant.completed = true;
    participant.currentProgress = challenge.targetValue;
    await challenge.save();

    // Award points and badge to user
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { points: challenge.points },
      $addToSet: { badges: challenge.badge },
    });

    res.status(200).json({
      success: true,
      message: `Challenge completed! You earned ${challenge.points} points and the "${challenge.badge}" badge!`,
      data: challenge,
    });
  } catch (err) {
    next(err);
  }
};

exports.getLeaderboard = async (req, res, next) => {
  try {
    const topUsers = await User.find({})
      .select('name location points badges createdAt')
      .sort({ points: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: topUsers,
    });
  } catch (err) {
    next(err);
  }
};
