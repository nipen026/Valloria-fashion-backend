// controllers/addressController.js
const Address = require('../models/Address');

exports.addAddress = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken
    const address = await Address.create({ ...req.body, userId });  
    res.status(201).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add address', error: error.message });
  }
};

exports.getUserAddresses = async (req, res) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({ where: { userId } });
    res.status(200).json({ success: true, addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch addresses', error: error.message });
  }
};

exports.updateAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    await address.update(req.body);
    res.status(200).json({ success: true, address });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update address', error: error.message });
  }
};

exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    await address.destroy();
    res.status(200).json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete address', error: error.message });
  }
};
