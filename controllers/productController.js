const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ProductVariant = require('../models/ProductVariant');
// Create Product
Product.hasMany(ProductVariant, { foreignKey: 'productId', as: 'variants' });
ProductVariant.belongsTo(Product, { foreignKey: 'productId' });


exports.createProduct = async (req, res, next) => {
  try {
    const {
      variants, // JSON string
      seoKeywords,
      tags,
      ...productFields
    } = req.body;

    const product = await Product.create({
      ...productFields,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : JSON.parse(seoKeywords || '[]'),
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]')
    });

    const parsedVariants = JSON.parse(variants || '[]');

    // Group files by variant index and field (images/videos)
    const variantFilesMap = {};

    for (const file of req.files || []) {
      const match = file.fieldname.match(/variantFiles\[(\d+)]\[(images|videos)]/);
      if (match) {
        const index = Number(match[1]);
        const type = match[2]; // 'images' or 'videos'

        if (!variantFilesMap[index]) variantFilesMap[index] = { images: [], videos: [] };
        variantFilesMap[index][type].push(file);
      }
    }

    // Create each variant and link files
    for (let i = 0; i < parsedVariants.length; i++) {
      const variantData = parsedVariants[i];
      const files = variantFilesMap[i] || { images: [], videos: [] };

      await ProductVariant.create({
        productId: product.id,
        ...variantData,
        images: files.images.map(f => f.originalname), // or upload URL if using cloud
        videos: files.videos.map(f => f.originalname)
      });

      // Optionally, save files to disk or upload to cloud (S3, Cloudinary, etc.)
    }

    res.status(201).json({ success: true, product });
  } catch (err) {
    console.error('Error creating product and variants:', err);
    next(err);
  }
};

// Get All Products
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: [
            'id',
            'color',
            'size',
            'images',
            'videos',
            'mrp',
            'salePrice',
            'taxRate',
            'taxType',
            'stockQuantity',
            'status'
          ]
        }
      ]
    });

    const BASE_URL = `${req.protocol}://${req.get('host')}/uploads/`;

    // Map over products and format image URLs
    const productsWithUrls = products.map(product => {
      const variants = product.variants.map(variant => ({
        ...variant.toJSON(),
        images: (variant.images || []).map(file => BASE_URL + file),
        videos: (variant.videos || []).map(file => BASE_URL + file)
      }));
      return {
        ...product.toJSON(),
        variants
      };
    });

    res.json({ success: true, products: productsWithUrls });
  } catch (err) {
    next(err);
  }
};

// Get Product by ID
exports.getProductById = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariant,
          as: 'variants',
          attributes: [
            'id',
            'color',
            'size',
            'images',
            'videos',
            'mrp',
            'salePrice',
            'taxRate',
            'taxType',
            'stockQuantity',
            'status'
          ]
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const BASE_URL = `${req.protocol}://${req.get('host')}/uploads/`;

    // Format variant image and video URLs
    const variants = product.variants.map(variant => ({
      ...variant.toJSON(),
      images: (variant.images || []).map(file => BASE_URL + file),
      videos: (variant.videos || []).map(file => BASE_URL + file)
    }));

    res.json({
      success: true,
      product: {
        ...product.toJSON(),
        variants
      }
    });
  } catch (err) {
    next(err);
  }
};


// Update Product
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: ProductVariant, as: 'variants' }]
    });
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const {
      variants, // JSON string
      seoKeywords,
      tags,
      ...productFields
    } = req.body;

    const updatedFields = {
      ...productFields,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : JSON.parse(seoKeywords || '[]'),
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]')
    };

    await product.update(updatedFields);

    // Handle variant updates
    const parsedVariants = JSON.parse(variants || '[]');

    // Group uploaded files by variant index and type
    const variantFilesMap = {};
    for (const file of req.files || []) {
      const match = file.fieldname.match(/variantFiles\[(\d+)]\[(images|videos)]/);
      if (match) {
        const index = Number(match[1]);
        const type = match[2];
        if (!variantFilesMap[index]) variantFilesMap[index] = { images: [], videos: [] };
        variantFilesMap[index][type].push(file);
      }
    }

    // Process each variant
 if (req.files && typeof req.files === 'object') {
  for (const fieldname in req.files) {
    const filesArray = req.files[fieldname];
    const match = fieldname.match(/variantFiles\[(\d+)]\[(images|videos)]/);
    if (match && Array.isArray(filesArray)) {
      const index = Number(match[1]);
      const type = match[2];
      if (!variantFilesMap[index]) variantFilesMap[index] = { images: [], videos: [] };
      variantFilesMap[index][type].push(...filesArray);
    }
  }
}

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    next(err);
  }
};


// Delete Product
exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.findByPk(req.params.id);
        if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

        await product.destroy();
        res.json({ success: true, message: 'Product deleted successfully' });
    } catch (err) {
        next(err);
    }
};

