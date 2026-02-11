const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Service name is required'],
    trim: true
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: { 
    type: String, 
    enum: ['hair', 'nails', 'face', 'body', 'spa', 'makeup'],
    required: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: [15, 'Duration must be at least 15 minutes']
  },
  price: { 
    type: Number, 
    required: true,
    min: [0, 'Price cannot be negative']
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Service', serviceSchema);