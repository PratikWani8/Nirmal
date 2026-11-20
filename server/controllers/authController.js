const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');

const generateToken = (id) => {
  return jwt.sign({ id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, preferredLanguage, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      preferredLanguage: preferredLanguage || 'en',
      location: location || { city: 'New Delhi', coordinates: [77.2090, 28.6139] },
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        location: user.location,
        lifestyle: user.lifestyle,
        points: user.points,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        preferredLanguage: user.preferredLanguage,
        location: user.location,
        lifestyle: user.lifestyle,
        preferences: user.preferences,
        points: user.points,
        badges: user.badges,
        onboardingCompleted: user.onboardingCompleted,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const updates = {};
    const allowed = ['name', 'preferredLanguage', 'location', 'preferences', 'lifestyle'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.completeOnboarding = async (req, res, next) => {
  try {
    const { lifestyle, location, preferredLanguage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        lifestyle: { ...req.user.lifestyle, ...lifestyle },
        location: location || req.user.location,
        preferredLanguage: preferredLanguage || req.user.preferredLanguage,
        onboardingCompleted: true,
        $inc: { points: 50 }, // 50 bonus points for onboarding
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Onboarding completed successfully!',
      user,
    });
  } catch (err) {
    next(err);
  }
};
