const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Banner = sequelize.define('Banner', {
  images: {
    type: DataTypes.ARRAY(DataTypes.STRING), // URLs from Cloudinary
    defaultValue: []
  },
  altText: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active',
  }
});

module.exports = Banner;
