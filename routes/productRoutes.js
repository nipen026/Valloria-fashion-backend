const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const validateProduct = require('../middlewares/validateProduct');
const upload = require('../middlewares/uploadMedia');

router.post(
  '/addProduct',
  upload.any(), // accept all files (we parse manually below)
  async (req, res, next) => {
    console.log('FILES RECEIVED:', req.files?.map(f => f.fieldname));
    next();
  },
  validateProduct,
  productController.createProduct
);
router.get('/getProducts', productController.getAllProducts);
router.get('/getProductById/:id', productController.getProductById);
router.get('/getFilteredProducts', productController.getFilteredProducts);
router.put(
  '/updateProductById/:id',
 upload.any(), // accept all files (we parse manually below)
  productController.updateProduct
);
router.delete('/deleteProductById/:id', productController.deleteProduct);
router.get('/search', productController.searchProducts);

module.exports = router;
