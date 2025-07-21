// const { Op, fn, col, literal } = require('sequelize');
// const Product = require('../models/Product');
// const Order = require('../models/Order');
// const OrderItem = require('../models/OrderItem');
// const Inventory = require('../models/Inventory'); // ✅ Add this

// exports.getAdminDashboard = async (req, res, next) => {
//   try {
//     const { startDate, endDate } = req.query;

//     const whereDate = {};
//     if (startDate && endDate) {
//       whereDate.createdAt = {
//         [Op.between]: [new Date(startDate), new Date(endDate)]
//       };
//     }

//     // Products
//     const totalProducts = await Product.count();

//     // ✅ Sum stock from Inventory + from active Products
//     const productStockSum = await Product.sum('stockQuantity', {
//       where: { status: 'active' }
//     });
//     const inventoryStockSum = await Inventory.sum('stockQuantity', {
//       where: { status: 'active' }
//     });
//     const totalInventory = (productStockSum || 0) + (inventoryStockSum || 0);

//     // Orders
//     const totalOrders = await Order.count({ where: whereDate });
//     const totalRevenue = await Order.sum('totalAmount', {
//       where: { ...whereDate, status: 'paid' }
//     });

//     // Orders by Status
//     const orderStatusCounts = await Order.findAll({
//       attributes: ['status', [fn('COUNT', col('status')), 'count']],
//       group: ['status']
//     });

//     // Chart: Orders group by date
//     const orderChart = await Order.findAll({
//       attributes: [
//         [fn('DATE', col('createdAt')), 'date'],
//         [fn('COUNT', col('id')), 'orderCount'],
//         [fn('SUM', col('totalAmount')), 'totalSales']
//       ],
//       where: whereDate,
//       group: [fn('DATE', col('createdAt'))],
//       order: [[literal('date'), 'ASC']]
//     });

//     res.json({
//       totals: {
//         totalProducts,
//         totalInventory,
//         totalOrders,
//         totalRevenue
//       },
//       statusSummary: orderStatusCounts,
//       chart: orderChart
//     });

//   } catch (err) {
//     next(err);
//   }
// };
const { Op, fn, col, literal } = require('sequelize');
const Product = require('../models/Product');
const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const Inventory = require('../models/Inventory');
const User = require('../models/User'); // ✅ Add this if needed
const sequelize = require('../config/db');
const ProductVariant = require('../models/ProductVariant');

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const whereDate = {};
    if (startDate && endDate) {
      whereDate.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    // Total Products
    const totalProducts = await Product.count();

    // Total Inventory (active only)
 let productStockSum = 0;
try {
  productStockSum = await ProductVariant.sum('stockQuantity', {
    where: { status: 'active' }
  });
} catch (e) {
  console.warn('ProductVariant stock sum failed:', e.message);
}
    const inventoryStockSum = await Inventory.sum('stockQuantity', {
      where: { status: 'active' }
    });

    const totalInventory = (inventoryStockSum || 0);

    // Total Orders
    const totalOrders = await Order.count({ where: whereDate });

    // Total Revenue from paid orders
    const totalRevenue = await Order.sum('totalAmount', {
      where: { ...whereDate, status: 'paid' }
    });

    // Orders by Status
    const orderStatusCounts = await Order.findAll({
      attributes: ['status', [fn('COUNT', col('status')), 'count']],
      group: ['status']
    });

    // Sales Chart by Date
    const orderChart = await Order.findAll({
      attributes: [
        [fn('DATE', col('createdAt')), 'date'],
        [fn('COUNT', col('id')), 'orderCount'],
        [fn('SUM', col('totalAmount')), 'totalSales']
      ],
      where: whereDate,
      group: [fn('DATE', col('createdAt'))],
      order: [[literal('date'), 'ASC']]
    });

    // Top Selling Products
    // const [topSellingProducts] = await sequelize.query(`
    //   SELECT 
    //     "OrderItem"."productId", 
    //     SUM("OrderItem"."quantity") AS "totalSold", 
    //     SUM("OrderItem"."price") AS "revenue", 
    //     "Product"."productType"
    //   FROM "OrderItems" AS "OrderItem"
    //   INNER JOIN "Products" AS "Product" 
    //     ON "OrderItem"."productId" = "Product"."id"
    //   GROUP BY "OrderItem"."productId", "Product"."productType"
    //   ORDER BY "totalSold" DESC
    //   LIMIT 5;
    // `);
const [topSellingProducts] = await sequelize.query(`
  SELECT 
    "OrderItem"."productId",
    "Product"."brandName",
    "Product"."productType",
    "Product"."id" AS "productId",
    SUM("OrderItem"."quantity") AS "totalSold",
    SUM("OrderItem"."price") AS "revenue",
    JSON_AGG(
      JSON_BUILD_OBJECT(
        'id', "Variant"."id",
        'color', "Variant"."color",
        'size', "Variant"."size",
        'images', "Variant"."images",
        'salePrice', "Variant"."salePrice",
        'stockQuantity', "Variant"."stockQuantity"
      )
    ) AS "variants"
  FROM "OrderItems" AS "OrderItem"
  INNER JOIN "Products" AS "Product"
    ON "OrderItem"."productId" = "Product"."id"
  LEFT JOIN "ProductVariants" AS "Variant"
    ON "Variant"."productId" = "Product"."id"
  GROUP BY 
    "OrderItem"."productId", 
    "Product"."id", 
    "Product"."brandName", 
    "Product"."productType"
  ORDER BY "totalSold" DESC
  LIMIT 5;
`);




    const result = await OrderItem.findAll({
      attributes: ['productId'],
      group: ['productId']
    });
    // Recent Orders
    const recentOrders = await Order.findAll({
      attributes: ['id', 'totalAmount', 'status', 'createdAt'],
      include: [
        {
          model: User,
          attributes: ['name']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: 5
    });
    // const formattedTopProducts = topSellingProducts.map(item => ({
    //   productType: item.Product,
    //   totalSold: parseInt(item.getDataValue('totalSold'), 10),
    //   revenue: parseFloat(item.getDataValue('revenue'))
    // }));
    // Response
    res.json({
      totals: {
        totalProducts,
        totalInventory,
        totalOrders,
        totalRevenue
      },
      statusSummary: orderStatusCounts,
      chart: orderChart,
      topSellingProducts: topSellingProducts,
      result: result,
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customerName: order.User.name,
        totalAmount: parseFloat(order.totalAmount),
        status: order.status,
        createdAt: order.createdAt
      }))
    });

  } catch (err) {
    next(err);
  }
};
