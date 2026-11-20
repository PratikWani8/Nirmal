const express = require('express');
const router = express.Router();
const {
  getPresets,
  run,
  save,
  getHistory,
  getById,
  deleteById,
  compare,
  generateActionPlan,
  exportSummary,
} = require('../controllers/simulatorController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.get('/presets', getPresets);
router.post('/run', optionalAuth, run);
router.post('/save', protect, save);
router.get('/history', protect, getHistory);
router.post('/compare', optionalAuth, compare);
router.post('/action-plan', optionalAuth, generateActionPlan);
router.get('/:id', optionalAuth, getById);
router.delete('/:id', protect, deleteById);
router.get('/:id/export', optionalAuth, exportSummary);

module.exports = router;
