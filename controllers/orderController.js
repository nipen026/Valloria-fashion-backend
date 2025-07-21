const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const User = require('../models/User');
const generateInvoice = require('../utils/generateInvoice');
const sendInvoiceEmail = require('../utils/mailer');
// Place an order (cart → order)
exports.placeOrder = async (req, res, next) => {
    try {
        const { shippingAddress } = req.body;
        const userId = req.user.id;

        const cartItems = await Cart.findAll({
            where: { userId },
            include: Product
        });

        if (!cartItems.length) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        const totalAmount = cartItems.reduce((acc, item) => acc + item.total, 0);

        const order = await Order.create({
            userId,
            shippingAddress,
            totalAmount,
            status: 'pending',
        });

        const orderItems = cartItems.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.Product.salePrice,
        }));

        await OrderItem.bulkCreate(orderItems);

        await Cart.destroy({ where: { userId } });

        res.status(201).json({ message: 'Order placed', orderId: order.id });
    } catch (err) {
        next(err);
    }
};

// Get logged-in user's orders
exports.getUserOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            where: { userId: req.user.id },
            include: {
                model: OrderItem,
                include: ['Product']
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// Admin: get all orders
exports.getAllOrders = async (req, res, next) => {
    try {
        const orders = await Order.findAll({
            include: {
                model: OrderItem,
                include: ['Product']
            },
            order: [['createdAt', 'DESC']]
        });

        res.json(orders);
    } catch (err) {
        next(err);
    }
};

// Admin: update order status and generate invoice
exports.updateOrderStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        const order = await Order.findByPk(req.params.id, {
            include: {
                model: OrderItem,
                include: ['Product']
            }
        });

        if (!order) return res.status(404).json({ message: 'Order not found' });

        order.status = status;
        await order.save();

        // Generate invoice only when marked "paid"
        if (status === 'paid') {
            const user = await User.findByPk(order.userId);
            const filename = `invoice-${order.id}.pdf`;
            const filePath = path.join(__dirname, '../invoices', filename);

            generateInvoice(order, user, filename);
            setTimeout(() => sendInvoiceEmail(user.email, order.id, filePath), 1000);

            // Create shipment order in Shiprocket
            await order.reload({ include: ['OrderItems', { model: OrderItem, include: ['Product'] }] });
            const shiprocketRes = await createShiprocketOrder(order, user);

            // Optional: save AWB or shipment id to DB
            order.shipmentId = shiprocketRes.shipment_id;
            order.awbCode = shiprocketRes.awb_code;
            await order.save();
        }

        res.json({ message: 'Order status updated', order });
    } catch (err) {
        next(err);
    }
};

exports.getOrderSummary = async (req, res, next) => {
  try {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'completed' } });

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        completedOrders
      }
    });
  } catch (error) {
    next(error);
  }
};