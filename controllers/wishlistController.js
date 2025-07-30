const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const ProductVariant = require('../models/ProductVariant');

exports.addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user.id;

    const [item, created] = await Wishlist.findOrCreate({
      where: { userId, productId },
    });

    if (!created) {
      return res.status(409).json({ success: false, message: 'Item already in wishlist' });
    }

    res.json({ success: true, message: 'Added to wishlist', item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add to wishlist' });
  }
};
exports.removeFromWishlist = async (req, res) => {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const deleted = await Wishlist.destroy({
      where: { userId, productId },
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
    }

    return res.json({ success: true, message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('❌ Error removing wishlist item:', error);
    return res.status(500).json({ success: false, message: 'Failed to remove from wishlist' });
  }
};



exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Get wishlist items only by userId (without include)
    const wishlist = await Wishlist.findAll({ where: { userId } });

    // 2. Get product IDs from wishlist
    const productIds = wishlist.map(item => item.productId);

    // 3. Fetch all relevant products and their variants
    const products = await Product.findAll({
      where: { id: productIds },
      include: [
        {
          model: ProductVariant,
          as: 'variants',
        },
      ],
    });

    // 4. Merge product data with wishlist
    const wishlistWithProducts = wishlist.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item.toJSON(),
        product: product ? product.toJSON() : null,
      };
    });

    res.json({ success: true, wishlist: wishlistWithProducts });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch wishlist' });
  }
};

