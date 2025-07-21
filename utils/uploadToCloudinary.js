// utils/uploadToCloudinary.js
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const uploadToCloudinary = (filePath, folder = 'products') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder, resource_type: 'auto' },
      (error, result) => {
        fs.unlinkSync(filePath); // remove local file after upload
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
};

module.exports = uploadToCloudinary;
