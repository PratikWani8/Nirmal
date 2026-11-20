const express = require('express');
const router = express.Router();
const { logSustainableTrip, getImpact } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/log-trip', protect, logSustainableTrip);
router.get('/impact', protect, getImpact);

module.exports = router;
