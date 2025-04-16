const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const ServiceProviderProfile = require('./ServiceProviderProfile');
const ServiceCategory = require('./ServiceCategory');

const Service = sequelize.define('Service', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  provider_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiceProviderProfile,
      key: 'id'
    }
  },
  category_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiceCategory,
      key: 'id'
    }
  },
  title_bn: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  title_en: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description_bn: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  description_en: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Associations
ServiceProviderProfile.hasMany(Service, { foreignKey: 'provider_id', as: 'services' });
Service.belongsTo(ServiceProviderProfile, { foreignKey: 'provider_id', as: 'provider' });

ServiceCategory.hasMany(Service, { foreignKey: 'category_id', as: 'services' });
Service.belongsTo(ServiceCategory, { foreignKey: 'category_id', as: 'category' });

module.exports = Service;
