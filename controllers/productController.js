const Product = require('../models/Product');
const Inventory = require('../models/Inventory');
const ProductVariant = require('../models/ProductVariant');
const uploadToCloudinary = require('../utils/uploadToCloudinary');
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

    // Create the main product
    const product = await Product.create({
      ...productFields,
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : JSON.parse(seoKeywords || '[]'),
      tags: Array.isArray(tags) ? tags : JSON.parse(tags || '[]')
    });

    const parsedVariants = JSON.parse(variants || '[]');

    // Group uploaded files by variant index
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

    // Loop through each variant
    for (let i = 0; i < parsedVariants.length; i++) {
      const variantData = parsedVariants[i];
      const files = variantFilesMap[i] || { images: [], videos: [] };

      // Upload to Cloudinary
      const imageUrls = await Promise.all(
        files.images.map(f => uploadToCloudinary(f.path, 'products/images'))
      );

      const videoUrls = await Promise.all(
        files.videos.map(f => uploadToCloudinary(f.path, 'products/videos'))
      );

      // Create variant with Cloudinary URLs
      await ProductVariant.create({
        productId: product.id,
        ...variantData,
        images: imageUrls,
        videos: videoUrls
      });
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

    // Just return the images/videos directly without BASE_URL
    const productsWithUrls = products.map(product => {
      const variants = product.variants.map(variant => ({
        ...variant.toJSON(),
        images: (variant.images || []),  // Already full Cloudinary URLs
        videos: (variant.videos || [])
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

    const parsedVariants = JSON.parse(variants || '[]');

    const variantFilesMap = {};

    // First structure (multer.single / any)
    for (const file of req.files || []) {
      const match = file.fieldname.match(/variantFiles\[(\d+)]\[(images|videos)]/);
      if (match) {
        const index = Number(match[1]);
        const type = match[2];
        if (!variantFilesMap[index]) variantFilesMap[index] = { images: [], videos: [] };
        variantFilesMap[index][type].push(file);
      }
    }

    // Second structure (multer.fields)
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

    // Handle updating variants (you can choose to delete + recreate, or update in-place)
    for (let i = 0; i < parsedVariants.length; i++) {
      const variantData = parsedVariants[i];
      const files = variantFilesMap[i] || { images: [], videos: [] };

      // Upload files to Cloudinary
      const imageUrls = await Promise.all(
        files.images.map(f => uploadToCloudinary(f.path, 'products/images'))
      );
      const videoUrls = await Promise.all(
        files.videos.map(f => uploadToCloudinary(f.path, 'products/videos'))
      );

      if (variantData.id) {
        // Update existing variant
        await ProductVariant.update(
          {
            ...variantData,
            images: imageUrls.length ? imageUrls : variantData.images,
            videos: videoUrls.length ? videoUrls : variantData.videos
          },
          { where: { id: variantData.id } }
        );
      } else {
        // Create new variant
        await ProductVariant.create({
          productId: product.id,
          ...variantData,
          images: imageUrls,
          videos: videoUrls
        });
      }
    }

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (err) {
    console.error('Error updating product:', err);
    next(err);
  }
};


exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: ProductVariant,
          as: 'variants'
        }
      ]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Delete associated ProductVariants
    if (product.variants && product.variants.length > 0) {
      for (const variant of product.variants) {
        await variant.destroy();
      }
    }

    // Finally, delete the product
    await product.destroy();

    res.json({ success: true, message: 'Product and variants deleted successfully' });
  } catch (err) {
    next(err);
  }
};


