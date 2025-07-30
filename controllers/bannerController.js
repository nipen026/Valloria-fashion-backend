const Banner = require("../models/Banner");
const uploadToCloudinary = require('../utils/uploadToCloudinary');
const fs = require('fs');
const path = require('path');

exports.uploadBanner = async (req, res) => {
  try {
    const { altText } = req.body;
  let imageUrls = [];

    if (req.files && req.files.length > 0) {
       const images = await Promise.all(
        req.files.map(f => uploadToCloudinary(f.path, 'banner'))
      );
      imageUrls = await Promise.all(images);
    }

const banner = await Banner.create({
  images: imageUrls,
  altText,
});

    res.status(201).json({ success: true, banner });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload failed' });
  }
};


exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
};

exports.updateBannerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    banner.status = status;
    await banner.save();

    res.json({ success: true, message: 'Status updated', banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};

exports.getActiveBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { status: 'active' },
      order: [['createdAt', 'DESC']]
    });

    res.json({ success: true, banners });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch banners' });
  }
};

exports.updateBannerStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const banner = await Banner.findByPk(id);
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }
0
    banner.status = status;
    await banner.save();

    res.json({ success: true, message: 'Status updated', banner });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update status' });
  }
};