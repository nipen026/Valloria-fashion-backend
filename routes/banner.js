const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMedia');
const {
  uploadBanner,
  updateBannerStatus,
  getActiveBanners
} = require('../controllers/bannerController');

router.post('/upload',   upload.any(), uploadBanner);
router.put('/:id/status', updateBannerStatus);
router.get('/active', getActiveBanners);

module.exports = router;
