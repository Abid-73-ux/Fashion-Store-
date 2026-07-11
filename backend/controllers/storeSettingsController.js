/**
 * Store Settings Controller
 * Handles CRUD operations for store-wide configuration
 */

const StoreSettings = require('../models/StoreSettings');

// Get current store settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await StoreSettings.create({
        currency: 'PKR',
        currencySymbol: 'Rs',
        taxPercentage: 0,
        shippingCost: 0,
        freeShippingThreshold: 5000,
        storeName: 'TAKANJ'
      });
    }
    
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch store settings',
      error: error.message
    });
  }
};

// Update store settings (Admin only)
exports.updateSettings = async (req, res) => {
  try {
    const {
      currency,
      currencySymbol,
      taxPercentage,
      shippingCost,
      freeShippingThreshold,
      storeName,
      storePhone,
      storeEmail
    } = req.body;
    
    // Validate tax percentage
    if (taxPercentage !== undefined && (taxPercentage < 0 || taxPercentage > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Tax percentage must be between 0 and 100'
      });
    }
    
    // Validate shipping cost
    if (shippingCost !== undefined && shippingCost < 0) {
      return res.status(400).json({
        success: false,
        message: 'Shipping cost cannot be negative'
      });
    }
    
    // Validate free shipping threshold
    if (freeShippingThreshold !== undefined && freeShippingThreshold < 0) {
      return res.status(400).json({
        success: false,
        message: 'Free shipping threshold cannot be negative'
      });
    }
    
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = await StoreSettings.create({
        currency: currency || 'PKR',
        currencySymbol: currencySymbol || 'Rs',
        taxPercentage: taxPercentage !== undefined ? taxPercentage : 0,
        shippingCost: shippingCost !== undefined ? shippingCost : 0,
        freeShippingThreshold: freeShippingThreshold || 5000,
        storeName: storeName || 'TAKANJ',
        storePhone,
        storeEmail
      });
    } else {
      // Update existing settings
      if (currency !== undefined) settings.currency = currency;
      if (currencySymbol !== undefined) settings.currencySymbol = currencySymbol;
      if (taxPercentage !== undefined) settings.taxPercentage = taxPercentage;
      if (shippingCost !== undefined) settings.shippingCost = shippingCost;
      if (freeShippingThreshold !== undefined) settings.freeShippingThreshold = freeShippingThreshold;
      if (storeName !== undefined) settings.storeName = storeName;
      if (storePhone !== undefined) settings.storePhone = storePhone;
      if (storeEmail !== undefined) settings.storeEmail = storeEmail;
      
      await settings.save();
    }
    
    res.json({
      success: true,
      message: 'Store settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update store settings',
      error: error.message
    });
  }
};

// Reset to default settings
exports.resetSettings = async (req, res) => {
  try {
    await StoreSettings.truncate();
    
    const defaultSettings = await StoreSettings.create({
      currency: 'PKR',
      currencySymbol: 'Rs',
      taxPercentage: 0,
      shippingCost: 0,
      freeShippingThreshold: 5000,
      storeName: 'TAKANJ'
    });
    
    res.json({
      success: true,
      message: 'Settings reset to defaults',
      data: defaultSettings
    });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};
