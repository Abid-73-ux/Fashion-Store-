const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide product name'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please provide product description']
    },
    price: {
        type: Number,
        required: [true, 'Please provide product price'],
        min: 0
    },
    originalPrice: {
        type: Number,
        default: null
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    images: {
        type: [String],
        default: []
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    sku: {
        type: String,
        unique: true,
        sparse: true
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: {
        type: Number,
        default: 0
    },
    size: {
        type: [String],
        default: []
    },
    color: {
        type: [String],
        default: []
    },
    material: String,
    brand: String,
    featured: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for better query performance
productSchema.index({ categoryId: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1 });

module.exports = mongoose.model('Product', productSchema);
