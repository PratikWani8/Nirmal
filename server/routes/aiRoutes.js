const express = require('express');
const router = express.Router();
const { chat, explain } = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/chat', optionalAuth, chat);
router.post('/explain', optionalAuth, explain);

module.exports = router;
