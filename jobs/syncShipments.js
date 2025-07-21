const cron = require('node-cron');
const Order = require('../models/Order');
const { trackOrder } = require('../services/shiprocketService');

const syncShiprocketStatuses = () => {
  // Runs every 2 hours
  cron.schedule('0 */2 * * *', async () => {
    console.log('⏳ Syncing Shiprocket delivery statuses...');
    const orders = await Order.findAll({
      where: {
        status: 'paid',
        awbCode: { [require('sequelize').Op.ne]: null }
      }
    });

    for (const order of orders) {
      try {
        const tracking = await trackOrder(order.awbCode);
        const currentStatus = tracking?.tracking_data?.shipment_status;

        // Optionally store status as field
        if (currentStatus && currentStatus !== order.deliveryStatus) {
          order.deliveryStatus = currentStatus;
          await order.save();
          console.log(`✅ Updated order #${order.id} to ${currentStatus}`);
        }
      } catch (err) {
        console.error(`❌ Failed to track order #${order.id}:`, err.message);
      }
    }
  });
};

module.exports = syncShiprocketStatuses;
