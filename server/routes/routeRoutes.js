const express = require('express');
const router = express.Router();
const { compare } = require('../controllers/routeController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/compare', optionalAuth, compare);

module.exports = router;
