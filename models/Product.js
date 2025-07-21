// const { DataTypes } = require('sequelize');
// const sequelize = require('../config/db');

// const Product = sequelize.define('Product', {
//     productName: { type: DataTypes.STRING, allowNull: false },
//     productType: { type: DataTypes.STRING, allowNull: false },
//     brandName: { type: DataTypes.STRING, allowNull: false },
//     description: DataTypes.TEXT,
//     category: { type: DataTypes.STRING, allowNull: false },
//     subCategory: DataTypes.STRING,
//     mrp: { type: DataTypes.FLOAT, allowNull: false },
//     salePrice: { type: DataTypes.FLOAT, allowNull: false },
//     taxRate: DataTypes.FLOAT,
//     taxType: DataTypes.STRING,
//     stockQuantity: { type: DataTypes.INTEGER, allowNull: false },
//     size: DataTypes.ARRAY(DataTypes.STRING),
//     colors: DataTypes.ARRAY(DataTypes.STRING),
//     material: DataTypes.STRING,
//     weight: DataTypes.FLOAT,
//     originCountry: DataTypes.STRING,
//     productTypeTag: DataTypes.STRING,
//     images: DataTypes.ARRAY(DataTypes.STRING),
//     tags: DataTypes.ARRAY(DataTypes.STRING),
//     deliveryTime: DataTypes.STRING,
//     seoKeywords: DataTypes.ARRAY(DataTypes.STRING),
//     notes: DataTypes.TEXT,
//     videos: DataTypes.ARRAY(DataTypes.STRING),
//     status: {
//         type: DataTypes.ENUM('active', 'inactive'),
//         defaultValue: 'active'
//     },
// });
// Product.associate = models => {
//   Product.hasOne(models.Inventory, {
//     foreignKey: 'productId',
//     onDelete: 'CASCADE'
//   });
// };


// module.exports = Product;


const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Product = sequelize.define('Product', {
  productName: { type: DataTypes.STRING, allowNull: true },
  productType: { type: DataTypes.STRING, allowNull: true },
  brandName: { type: DataTypes.STRING, allowNull: true },
  description: DataTypes.TEXT,
  category: { type: DataTypes.STRING, allowNull: true },
  subCategory: DataTypes.STRING,
  material: DataTypes.STRING,
  weight: DataTypes.FLOAT,
  originCountry: DataTypes.STRING,
  productTypeTag: DataTypes.STRING,
  deliveryTime: DataTypes.STRING,
  seoKeywords: DataTypes.ARRAY(DataTypes.STRING),
  tags: DataTypes.ARRAY(DataTypes.STRING),
  notes: DataTypes.TEXT,
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  },
});

Product.associate = models => {
  Product.hasMany(models.ProductVariant, { foreignKey: 'productId', as: 'variants', onDelete: 'CASCADE' });
};
Product.associate = models => {
  Product.hasOne(models.Inventory, {
    foreignKey: 'productId',
    onDelete: 'CASCADE'
  });
};
module.exports = Product;
