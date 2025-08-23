const { Sequelize } = require('sequelize');
require('dotenv').config();

// Use full DB URI instead of individual params
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,              // Render + Supabase need SSL
      rejectUnauthorized: false,  // allows self-signed certs
    },
  },
});

module.exports = sequelize;

