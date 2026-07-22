/**
 * File Service
 * Handles file uploads, validation, and storage for payment proofs and other files
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Supported MIME types with magic bytes for validation
const ALLOWED_MIME_TYPES = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46] // RIFF header for WebP
};

// File size limit (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Upload directories
const UPLOAD_DIRS = {
  paymentProofs: path.join(__dirname, '../uploads/payment_proofs'),
  products: path.join(__dirname, '../uploads/products'),
  profiles: path.join(__dirname, '../uploads/profiles')
};

/**
 * Ensure upload directory exists
 * @param {string} uploadDir - Directory path
 */
function ensureUploadDir(uploadDir) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

/**
 * Validate MIME type by checking magic bytes
 * @param {Buffer} fileBuffer - File buffer to check
 * @param {string} mimeType - Claimed MIME type
 * @returns {boolean} True if MIME type is valid
 */
function validateMimeType(fileBuffer, mimeType) {
  const magicBytes = ALLOWED_MIME_TYPES[mimeType];

  if (!magicBytes) {
    return false; // MIME type not allowed
  }

  // Check if file buffer starts with expected magic bytes
  for (let i = 0; i < magicBytes.length; i++) {
    if (fileBuffer[i] !== magicBytes[i]) {
      return false;
    }
  }

  return true;
}

/**
 * Validate uploaded file
 * @param {Object} file - Express file object (from multer or similar)
 * @returns {Object} { isValid: boolean, error: string, mimeType: string }
 */
function validateFile(file) {
  const errors = [];

  // Check if file exists
  if (!file) {
    return { isValid: false, error: 'No file uploaded' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    errors.push(`File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB (current: ${(file.size / (1024 * 1024)).toFixed(2)}MB)`);
  }

  // Check MIME type against allowed types
  if (!Object.keys(ALLOWED_MIME_TYPES).includes(file.mimetype)) {
    errors.push('File type not allowed. Please upload JPG, PNG, or WebP images only');
  }

  // If we have buffer data, validate magic bytes
  if (file.buffer && file.mimetype) {
    if (!validateMimeType(file.buffer, file.mimetype)) {
      errors.push('File content does not match the file extension. Please check your file');
    }
  }

  if (errors.length > 0) {
    return { isValid: false, error: errors.join('; ') };
  }

  return { isValid: true, mimeType: file.mimetype };
}

/**
 * Generate secure filename for uploaded file
 * @param {string} orderId - Order ID to include in filename
 * @param {string} originalFilename - Original filename
 * @returns {string} Secure filename
 */
function generateSecureFilename(orderId, originalFilename) {
  // Extract file extension
  const ext = path.extname(originalFilename).toLowerCase();

  // Generate random string using crypto
  const randomString = crypto.randomBytes(16).toString('hex');

  // Generate timestamp
  const timestamp = Date.now();

  // Create filename: order_{orderId}_{timestamp}_{random}.{ext}
  return `order_${orderId}_${timestamp}_${randomString}${ext}`;
}

/**
 * Save uploaded file to payment proofs directory
 * @param {Object} file - Express file object with buffer
 * @param {string} orderId - Order ID for filename
 * @returns {Object} { success: boolean, filePath: string, fileName: string, error: string }
 */
function savePaymentProof(file, orderId) {
  try {
    // Validate file first
    const validation = validateFile(file);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    // Ensure directory exists
    ensureUploadDir(UPLOAD_DIRS.paymentProofs);

    // Generate secure filename
    const filename = generateSecureFilename(orderId, file.originalname || 'payment_proof');

    // Full file path
    const filePath = path.join(UPLOAD_DIRS.paymentProofs, filename);

    // Save file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Return relative path for database storage
    const relativePath = path.join('uploads', 'payment_proofs', filename);

    return {
      success: true,
      filePath: relativePath,
      fileName: filename,
      mimeType: file.mimetype
    };
  } catch (error) {
    console.error('Error saving payment proof:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete file from storage
 * @param {string} filePath - Relative file path
 * @returns {Object} { success: boolean, error: string }
 */
function deleteFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);

    // Prevent path traversal
    if (!fullPath.startsWith(path.join(__dirname, '../uploads'))) {
      return { success: false, error: 'Invalid file path' };
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      return { success: true }; // Already deleted, no error
    }

    // Delete file
    fs.unlinkSync(fullPath);

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Get file URL for serving
 * @param {string} filePath - Relative file path
 * @returns {string} URL path for accessing file
 */
function getFileUrl(filePath) {
  if (!filePath) return null;
  // Remove leading/trailing slashes and construct URL path
  return `/files/${filePath.replace(/\\/g, '/')}`;
}

/**
 * Generate thumbnail for image (placeholder - actual implementation would use sharp library)
 * @param {string} sourceFilePath - Source file path
 * @param {string} orderId - Order ID for thumbnail filename
 * @returns {Object} { success: boolean, thumbnailPath: string, error: string }
 */
function generateThumbnail(sourceFilePath, orderId) {
  try {
    // For now, return the original path as thumbnail
    // In production, this would generate a 60x75px image using sharp library
    return {
      success: true,
      thumbnailPath: sourceFilePath
    };
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return { success: false, error: error.message };
  }
}

module.exports = {
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
  UPLOAD_DIRS,
  ensureUploadDir,
  validateMimeType,
  validateFile,
  generateSecureFilename,
  savePaymentProof,
  deleteFile,
  getFileUrl,
  generateThumbnail
};
