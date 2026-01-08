const express = require('express');
const router = express.Router();

const {
  getRenterHistory,
  getOwnerHistory,
  getAdminHistory
} = require('../controllers/historyController');

const protect = require('../middleware/auth');

// RENTER
router.get('/renter', protect, (req, res, next) => {
  if (req.user.role !== 'RENTER') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, getRenterHistory);

// OWNER
router.get('/owner', protect, (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, getOwnerHistory);

// ADMIN
router.get('/admin', protect, (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
}, getAdminHistory);

module.exports = router;
