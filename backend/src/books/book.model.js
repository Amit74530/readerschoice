const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
    default: 'Unknown',
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  trending: {
    type: Boolean,
    default: false,
  },
  coverImage: {
    type: String,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  newPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  count: {
    type: Number,
    required: true,
    min: 0,
    default: 1,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
