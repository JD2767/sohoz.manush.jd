const jwt = require('jsonwebtoken');
const { User, ServiceProviderProfile, ClientProfile } = require('../models');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Register user
exports.register = async (req, res) => {
  try {
    const { username, email, phone, password, user_type } = req.body;

    // Create user
    const user = await User.create({
      username,
      email,
      phone,
      password,
      user_type
    });

    // Create profile based on user type
    if (user_type === 'service_provider') {
      const { full_name, nid_number, address, area, bio, experience } = req.body;
      
      // Get profile picture path
      let profile_picture = 'default.jpg';
      if (req.file) {
        profile_picture = req.file.filename;
      }
      
      await ServiceProviderProfile.create({
        user_id: user.id,
        full_name,
        nid_number,
        profile_picture,
        address,
        area,
        bio,
        experience
      });
    } else if (user_type === 'client') {
      const { full_name, address, area } = req.body;
      
      // Get profile picture path
      let profile_picture = 'default.jpg';
      if (req.file) {
        profile_picture = req.file.filename;
      }
      
      await ClientProfile.create({
        user_id: user.id,
        full_name,
        address,
        area,
        profile_picture
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        user_type: user.user_type
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    let profile = null;
    if (user.user_type === 'service_provider') {
      profile = await ServiceProviderProfile.findOne({
        where: { user_id: user.id }
      });
    } else if (user.user_type === 'client') {
      profile = await ClientProfile.findOne({
        where: { user_id: user.id }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        profile
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message
    });
  }
};
