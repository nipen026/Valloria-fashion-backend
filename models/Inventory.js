const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Inventory = sequelize.define('Inventory', {
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  stockQuantity: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'inactive'
  }
});

// ✅ Associate function for reverse relation
Inventory.associate = models => {
  Inventory.belongsTo(models.Product, {
    foreignKey: 'productId'
  });
};

module.exports = Inventory;
