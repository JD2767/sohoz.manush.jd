const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createPayment,
  updatePaymentStatus,
  getPaymentByBooking,
  processBkashPayment,
  processNagadPayment
} = require('../controllers/payment.controller');

// Routes
router.post('/', protect, createPayment);
router.put('/:id', protect, updatePaymentStatus);
router.get('/booking/:bookingId', protect, getPaymentByBooking);
router.post('/bkash', protect, processBkashPayment);
router.post('/nagad', protect, processNagadPayment);

module.exports = router;
