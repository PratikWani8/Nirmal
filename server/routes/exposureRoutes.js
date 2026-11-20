const express = require('express');
const router = express.Router();
const { calculate, logActivity, getHistory } = require('../controllers/exposureController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/calculate', optionalAuth, calculate);
router.post('/log', protect, logActivity);
router.get('/history', protect, getHistory);

module.exports = router;
