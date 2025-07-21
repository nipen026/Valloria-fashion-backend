const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const productRoutes = require('./routes/productRoutes');
const passport = require('passport');
const authRoutes = require('./routes/authRoutes');
const cartRoutes = require('./routes/cartRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const shiprocketWebhook = require('./routes/shiprocketWebhook');
const adminDashboardRoutes = require('./routes/adminDashboard');
const orderRoutes = require('./routes/orderRoutes')
require('./jobs/syncShipments')();
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes

app.use(passport.initialize());
app.use('/api/auth', authRoutes); // done
app.get('/', (req, res) => {
  res.send('Connection done');
});
app.use('/api/products', productRoutes); // done
app.use('/api/cart', cartRoutes); // done
app.use('/api/orders', orderRoutes); // done
app.use('/api/payment', paymentRoutes);
app.use('/webhook', webhookRoutes);
app.use('/webhook/shiprocket', shiprocketWebhook);
app.use('/api/admin/dashboard', adminDashboardRoutes); //done
app.use('/invoices', express.static('invoices'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


module.exports = app;
