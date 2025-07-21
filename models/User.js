const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  name: DataTypes.STRING,
  email: { type: DataTypes.STRING, unique: true },
  password: DataTypes.STRING, // hashed
  googleId: DataTypes.STRING, // if user logs in via Google
  role: { type: DataTypes.STRING, defaultValue: 'user' }, // 'user' or 'admin'
  number: { type: DataTypes.STRING,allowNull:true }, 
});

module.exports = User;
