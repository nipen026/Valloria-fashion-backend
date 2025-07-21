const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add item to cart
exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const total = product.salePrice * quantity;

    const existingItem = await Cart.findOne({
      where: { userId: req.user.id, productId }
    });

    let cartItem;
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.total = existingItem.quantity * product.salePrice;
      await existingItem.save();
      cartItem = existingItem;
    } else {
      cartItem = await Cart.create({
        userId: req.user.id,
        productId,
        quantity,
        total
      });
    }

    res.status(201).json(cartItem);
  } catch (err) {
    next(err);
  }
};

// Get all cart items for a user
exports.getUserCart = async (req, res, next) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: ['Product']
    });
    res.json(cartItems);
  } catch (err) {
    next(err);
  }
};

// Update cart item quantity
exports.updateCartItem = async (req, res, next) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findByPk(req.params.id, { include: Product });

    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found or unauthorized' });
    }

    cartItem.quantity = quantity;
    cartItem.total = quantity * cartItem.Product.salePrice;
    await cartItem.save();

    res.json(cartItem);
  } catch (err) {
    next(err);
  }
};

// Remove item from cart
exports.removeCartItem = async (req, res, next) => {
  try {
    const cartItem = await Cart.findByPk(req.params.id);
    if (!cartItem || cartItem.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found or unauthorized' });
    }

    await cartItem.destroy();
    res.json({ message: 'Item removed from cart' });
  } catch (err) {
    next(err);
  }
};
