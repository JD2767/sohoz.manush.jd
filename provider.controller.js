const { ServiceProviderProfile, User, Service, Review } = require('../models');
const { Op } = require('sequelize');

// Get all service providers
exports.getAllProviders = async (req, res) => {
  try {
    const { area, category, rating, search } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    
    if (area) {
      whereConditions.area = area;
    }
    
    if (rating) {
      whereConditions.rating = { [Op.gte]: parseFloat(rating) };
    }
    
    if (search) {
      whereConditions.full_name = { [Op.like]: `%${search}%` };
    }
    
    // Find providers with filters
    const providers = await ServiceProviderProfile.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'phone']
        },
        {
          model: Service,
          as: 'services',
          where: category ? { category_id: category } : {},
          required: category ? true : false
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: providers.length,
      data: providers
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service providers',
      error: error.message
    });
  }
};

// Get single service provider
exports.getProviderById = async (req, res) => {
  try {
    const provider = await ServiceProviderProfile.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['username', 'email', 'phone']
        },
        {
          model: Service,
          as: 'services'
        }
      ]
    });
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }
    
    // Get reviews for this provider's services
    const services = await Service.findAll({
      where: { provider_id: provider.id },
      attributes: ['id']
    });
    
    const serviceIds = services.map(service => service.id);
    
    const reviews = await Review.findAll({
      where: { service_id: { [Op.in]: serviceIds } },
      include: [
        {
          model: ClientProfile,
          as: 'client',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      data: {
        provider,
        reviews
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service provider',
      error: error.message
    });
  }
};

// Update service provider profile
exports.updateProviderProfile = async (req, res) => {
  try {
    const provider = await ServiceProviderProfile.findByPk(req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Service provider not found'
      });
    }
    
    // Check if user is authorized to update this profile
    if (provider.user_id !== req.user.id && req.user.user_type !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this profile'
      });
    }
    
    // Update profile
    const { full_name, address, area, bio, experience } = req.body;
    
    // Get profile picture path if uploaded
    let profile_picture = provider.profile_picture;
    if (req.file) {
      profile_picture = req.file.filename;
    }
    
    await provider.update({
      full_name,
      address,
      area,
      bio,
      experience,
      profile_picture
    });
    
    res.status(200).json({
      success: true,
      data: provider
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service provider profile',
      error: error.message
    });
  }
};
