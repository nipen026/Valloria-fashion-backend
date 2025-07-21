const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Product = require('./Product');
const Inventory = require('./Inventory');

// Collect all models
const models = {
  Product,
  Inventory
};

// Attach associations
Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

module.exports = models;
