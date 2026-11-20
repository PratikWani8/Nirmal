const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  verifyReport,
  upvoteReport,
  getChallenges,
  joinChallenge,
  completeChallenge,
  getLeaderboard,
} = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/reports', protect, createReport);
router.get('/reports', optionalAuth, getReports);
router.patch('/reports/:id/verify', protect, verifyReport);
router.post('/reports/:id/upvote', protect, upvoteReport);

router.get('/challenges', optionalAuth, getChallenges);
router.post('/challenges/:id/join', protect, joinChallenge);
router.patch('/challenges/:id/complete', protect, completeChallenge);
router.get('/leaderboard', optionalAuth, getLeaderboard);

module.exports = router;
