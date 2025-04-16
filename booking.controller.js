const { Booking, Service, ClientProfile, ServiceProviderProfile, User } = require('../models');

// Get all bookings for a client
exports.getClientBookings = async (req, res) => {
  try {
    // Get client profile
    const client = await ClientProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Get bookings
    const bookings = await Booking.findAll({
      where: { client_id: client.id },
      include: [
        {
          model: Service,
          as: 'service',
          include: [
            {
              model: ServiceProviderProfile,
              as: 'provider',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['username', 'email', 'phone']
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

// Get all bookings for a service provider
exports.getProviderBookings = async (req, res) => {
  try {
    // Get provider profile
    const provider = await ServiceProviderProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider profile not found'
      });
    }
    
    // Get services offered by this provider
    const services = await Service.findAll({
      where: { provider_id: provider.id },
      attributes: ['id']
    });
    
    const serviceIds = services.map(service => service.id);
    
    // Get bookings for these services
    const bookings = await Booking.findAll({
      where: { service_id: { [Op.in]: serviceIds } },
      include: [
        {
          model: Service,
          as: 'service'
        },
        {
          model: ClientProfile,
          as: 'client',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username', 'email', 'phone']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get bookings',
      error: error.message
    });
  }
};

// Create new booking
exports.createBooking = async (req, res) => {
  try {
    // Get client profile
    const client = await ClientProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client profile not found'
      });
    }
    
    // Check if service exists
    const service = await Service.findByPk(req.body.service_id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Create booking
    const { service_id, booking_date, booking_time, notes } = req.body;
    
    const booking = await Booking.create({
      service_id,
      client_id: client.id,
      booking_date,
      booking_time,
      notes,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
};

// Update booking status
exports.updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to update this booking
    const service = await Service.findByPk(booking.service_id);
    const provider = await ServiceProviderProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!provider || service.provider_id !== provider.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }
    
    // Update booking status
    const { status } = req.body;
    
    await booking.update({ status });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByPk(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Check if user is authorized to cancel this booking
    const client = await ClientProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!client || booking.client_id !== client.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }
    
    // Cancel booking
    await booking.update({ status: 'cancelled' });
    
    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel booking',
      error: error.message
    });
  }
};
