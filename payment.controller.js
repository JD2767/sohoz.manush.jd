const { Payment, Booking, Service } = require('../models');

// Create payment for a booking
exports.createPayment = async (req, res) => {
  try {
    // Check if booking exists
    const booking = await Booking.findByPk(req.body.booking_id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if payment already exists for this booking
    const existingPayment = await Payment.findOne({
      where: { booking_id: booking.id }
    });
    
    if (existingPayment) {
      return res.status(400).json({
        success: false,
        message: 'Payment already exists for this booking'
      });
    }
    
    // Get service price
    const service = await Service.findByPk(booking.service_id);
    
    // Create payment
    const { payment_method, transaction_id } = req.body;
    
    const payment = await Payment.create({
      booking_id: booking.id,
      amount: service.price,
      payment_method,
      transaction_id,
      status: 'pending',
      service_fee: 5.00 // Fixed service fee as per requirement
    });
    
    res.status(201).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment',
      error: error.message
    });
  }
};

// Update payment status
exports.updatePaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findByPk(req.params.id);
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }
    
    // Update payment status
    const { status, transaction_id } = req.body;
    
    await payment.update({ 
      status,
      transaction_id: transaction_id || payment.transaction_id
    });
    
    // If payment is completed, update booking status to confirmed
    if (status === 'completed') {
      const booking = await Booking.findByPk(payment.booking_id);
      await booking.update({ status: 'confirmed' });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update payment status',
      error: error.message
    });
  }
};

// Get payment by booking ID
exports.getPaymentByBooking = async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: { booking_id: req.params.bookingId },
      include: [
        {
          model: Booking,
          as: 'booking',
          include: [
            {
              model: Service,
              as: 'service'
            }
          ]
        }
      ]
    });
    
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found for this booking'
      });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payment',
      error: error.message
    });
  }
};

// Process bKash payment
exports.processBkashPayment = async (req, res) => {
  try {
    const { booking_id, phone_number, transaction_id } = req.body;
    
    // Validate bKash transaction (in a real system, this would call bKash API)
    // For demo purposes, we'll just simulate a successful transaction
    
    // Create or update payment
    let payment = await Payment.findOne({
      where: { booking_id }
    });
    
    if (payment) {
      await payment.update({
        transaction_id,
        status: 'completed'
      });
    } else {
      // Get service price
      const booking = await Booking.findByPk(booking_id);
      const service = await Service.findByPk(booking.service_id);
      
      payment = await Payment.create({
        booking_id,
        amount: service.price,
        payment_method: 'bkash',
        transaction_id,
        status: 'completed',
        service_fee: 5.00
      });
      
      // Update booking status
      await booking.update({ status: 'confirmed' });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bKash payment',
      error: error.message
    });
  }
};

// Process Nagad payment
exports.processNagadPayment = async (req, res) => {
  try {
    const { booking_id, phone_number, transaction_id } = req.body;
    
    // Validate Nagad transaction (in a real system, this would call Nagad API)
    // For demo purposes, we'll just simulate a successful transaction
    
    // Create or update payment
    let payment = await Payment.findOne({
      where: { booking_id }
    });
    
    if (payment) {
      await payment.update({
        transaction_id,
        status: 'completed'
      });
    } else {
      // Get service price
      const booking = await Booking.findByPk(booking_id);
      const service = await Service.findByPk(booking.service_id);
      
      payment = await Payment.create({
        booking_id,
        amount: service.price,
        payment_method: 'nagad',
        transaction_id,
        status: 'completed',
        service_fee: 5.00
      });
      
      // Update booking status
      await booking.update({ status: 'confirmed' });
    }
    
    res.status(200).json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to process Nagad payment',
      error: error.message
    });
  }
};
