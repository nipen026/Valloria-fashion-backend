const cloudinary = require('cloudinary').v2;
const fs = require('fs/promises'); // Use async FS for cleaner code

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (localFilePath, folder = 'products') => {
  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: 'auto'
    });

    // ✅ Async cleanup using fs.promises
    await fs.unlink(localFilePath);

    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

module.exports = uploadToCloudinary;
