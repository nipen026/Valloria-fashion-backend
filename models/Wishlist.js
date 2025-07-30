const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Wishlist = sequelize.define('Wishlist', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});


  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.Product, {
      foreignKey: 'productId',
      as: 'product',
    });
  };



module.exports = Wishlist;
