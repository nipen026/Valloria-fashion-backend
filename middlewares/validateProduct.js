module.exports = (req, res, next) => {
  const { productType, brandName, category, variants } = req.body;

  // Basic required fields
  if (!productType || !brandName || !category) {
    return res.status(400).json({ success: false, message: 'Missing required fields: productType, brandName, or category' });
  }

  let parsedVariants = [];

  try {
    parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
  } catch (err) {
    return res.status(400).json({ success: false, message: 'Invalid variants format' });
  }

  if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
    return res.status(400).json({ success: false, message: 'At least one variant is required' });
  }

  // Validate each variant's required fields
  for (let i = 0; i < parsedVariants.length; i++) {
    const { mrp, salePrice, stockQuantity } = parsedVariants[i];

    if (!mrp || !salePrice || !stockQuantity) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields in variant ${i + 1} (mrp, salePrice, or stockQuantity)`
      });
    }
  }

  next();
};
