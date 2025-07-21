const axios = require('axios');
require('dotenv').config();

let accessToken = null;

const loginToShiprocket = async () => {
  const res = await axios.post(`${process.env.SHIPROCKET_BASE_URL}/auth/login`, {
    email: process.env.SHIPROCKET_EMAIL,
    password: process.env.SHIPROCKET_PASSWORD
  });

  accessToken = res.data.token;
  return accessToken;
};

const getToken = async () => {
  if (!accessToken) {
    return await loginToShiprocket();
  }
  return accessToken;
};

// Create Shipment Order
const createShiprocketOrder = async (order, user) => {
  const token = await getToken();

  const payload = {
    order_id: `VV-${order.id}`,
    order_date: new Date().toISOString().slice(0, 10),
    pickup_location: 'Primary', // configured in Shiprocket
    billing_customer_name: user.name,
    billing_email: user.email,
    billing_address: order.shippingAddress,
    billing_city: 'Delhi',
    billing_state: 'Delhi',
    billing_country: 'India',
    billing_pincode: '110001',
    billing_phone: '9876543210',
    order_items: order.OrderItems.map(item => ({
      name: item.Product.productType,
      sku: `SKU-${item.Product.id}`,
      units: item.quantity,
      selling_price: item.price
    })),
    payment_method: order.status === 'paid' ? 'Prepaid' : 'COD',
    total_discount: 0,
    sub_total: order.totalAmount,
    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5
  };

  const res = await axios.post(`${process.env.SHIPROCKET_BASE_URL}/orders/create/adhoc`, payload, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

// Track Order
const trackOrder = async (awbCode) => {
  const token = await getToken();
  const res = await axios.get(`${process.env.SHIPROCKET_BASE_URL}/courier/track/awb/${awbCode}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return res.data;
};

module.exports = {
  createShiprocketOrder,
  trackOrder
};
