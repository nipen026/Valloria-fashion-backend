const app = require('./app');
const sequelize = require('./config/db');

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // 🔄 Sync all models automatically (DO NOT use force: true in production!)
    await sequelize.sync({ alter: true }); // use alter for dev-safe updates

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    process.exit(1); // Exit on DB connection error
  }
})();
