const { Service, ServiceCategory, ServiceProviderProfile, User } = require('../models');
const { Op } = require('sequelize');

// Get all services
exports.getAllServices = async (req, res) => {
  try {
    const { category, area, price_min, price_max, rating, search } = req.query;
    
    // Build filter conditions
    const whereConditions = {};
    const providerWhereConditions = {};
    
    if (category) {
      whereConditions.category_id = category;
    }
    
    if (price_min && price_max) {
      whereConditions.price = { [Op.between]: [parseFloat(price_min), parseFloat(price_max)] };
    } else if (price_min) {
      whereConditions.price = { [Op.gte]: parseFloat(price_min) };
    } else if (price_max) {
      whereConditions.price = { [Op.lte]: parseFloat(price_max) };
    }
    
    if (area) {
      providerWhereConditions.area = area;
    }
    
    if (rating) {
      providerWhereConditions.rating = { [Op.gte]: parseFloat(rating) };
    }
    
    if (search) {
      whereConditions[Op.or] = [
        { title_bn: { [Op.like]: `%${search}%` } },
        { title_en: { [Op.like]: `%${search}%` } },
        { description_bn: { [Op.like]: `%${search}%` } },
        { description_en: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Find services with filters
    const services = await Service.findAll({
      where: whereConditions,
      include: [
        {
          model: ServiceCategory,
          as: 'category'
        },
        {
          model: ServiceProviderProfile,
          as: 'provider',
          where: providerWhereConditions,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['username', 'email', 'phone']
            }
          ]
        }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get services',
      error: error.message
    });
  }
};

// Get single service
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id, {
      include: [
        {
          model: ServiceCategory,
          as: 'category'
        },
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
        },
        {
          model: Review,
          as: 'reviews',
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
        }
      ]
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get service',
      error: error.message
    });
  }
};

// Create new service
exports.createService = async (req, res) => {
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
    
    // Create service
    const { category_id, title_bn, title_en, description_bn, description_en, price } = req.body;
    
    const service = await Service.create({
      provider_id: provider.id,
      category_id,
      title_bn,
      title_en,
      description_bn,
      description_en,
      price,
      availability: true
    });
    
    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Update service
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Check if user is authorized to update this service
    const provider = await ServiceProviderProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!provider || service.provider_id !== provider.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }
    
    // Update service
    const { category_id, title_bn, title_en, description_bn, description_en, price, availability } = req.body;
    
    await service.update({
      category_id,
      title_bn,
      title_en,
      description_bn,
      description_en,
      price,
      availability
    });
    
    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByPk(req.params.id);
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }
    
    // Check if user is authorized to delete this service
    const provider = await ServiceProviderProfile.findOne({
      where: { user_id: req.user.id }
    });
    
    if (!provider || service.provider_id !== provider.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }
    
    // Delete service
    await service.destroy();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};
