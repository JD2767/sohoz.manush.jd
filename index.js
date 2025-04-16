const { sequelize } = require('../config/database');
const User = require('./User');
const ServiceProviderProfile = require('./ServiceProviderProfile');
const ClientProfile = require('./ClientProfile');
const ServiceCategory = require('./ServiceCategory');
const Service = require('./Service');
const Booking = require('./Booking');
const Payment = require('./Payment');
const Review = require('./Review');

module.exports = {
  sequelize,
  User,
  ServiceProviderProfile,
  ClientProfile,
  ServiceCategory,
  Service,
  Booking,
  Payment,
  Review
};
