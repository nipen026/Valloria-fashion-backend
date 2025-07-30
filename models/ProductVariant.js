const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProductVariant = sequelize.define('ProductVariant', {
  color: { type: DataTypes.STRING, allowNull: false },
  size: DataTypes.ARRAY(DataTypes.STRING),
  images: DataTypes.ARRAY(DataTypes.STRING),
  videos: DataTypes.ARRAY(DataTypes.STRING),
  mrp: { type: DataTypes.FLOAT, allowNull: false },
  salePrice: { type: DataTypes.FLOAT, allowNull: false },
  taxRate: DataTypes.FLOAT,
  taxType: DataTypes.STRING,
  stockQuantity: { type: DataTypes.INTEGER, allowNull: false },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
});

ProductVariant.associate = (models) => {
  ProductVariant.belongsTo(models.Product, {
    foreignKey: "productId",
    onDelete: "CASCADE",
  });
};

module.exports = ProductVariant;
