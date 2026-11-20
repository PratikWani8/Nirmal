const express = require('express');
const router = express.Router();
const { getDaily, generate, updateStatus } = require('../controllers/recommendationController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/daily', optionalAuth, getDaily);
router.post('/generate', optionalAuth, generate);
router.patch('/:id', protect, updateStatus);

module.exports = router;
