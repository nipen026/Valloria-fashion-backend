const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Product = require('./Product');
const Inventory = require('./Inventory');
const Wishlist = require('./Wishlist');
const User = require('./User');
const ProductVariant = require('./ProductVariant');
const Review = require('./Review');

// Collect all models
const models = {
  Product,
  Inventory
};

Wishlist.belongsTo(User, { foreignKey: 'userId' });
Wishlist.belongsTo(Product, { foreignKey: 'productId' });
Wishlist.belongsTo(ProductVariant, { foreignKey: 'variantId' });

User.hasMany(Wishlist, { foreignKey: 'userId' });
Product.hasMany(Wishlist, { foreignKey: 'productId' });
ProductVariant.hasMany(Wishlist, { foreignKey: 'variantId' });

// Attach associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});
User.hasMany(Review, { foreignKey: 'userId', onDelete: 'CASCADE' });
Review.belongsTo(User, { foreignKey: 'userId' });

Product.hasMany(Review, { foreignKey: 'productId', onDelete: 'CASCADE' });
Review.belongsTo(Product, { foreignKey: 'productId' });
module.exports = models;


