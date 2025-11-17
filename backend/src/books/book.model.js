// src/books/book.model.js
const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
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
      default: '',
    },

    // 🔥 CATEGORY NOW SUPPORTS MULTIPLE TAGS
    category: {
      type: [String], // array of strings
      default: [],     // NOT required
    },

    trending: {
      type: Boolean,
      default: false,
    },

    // 🔥 IMAGE OPTIONAL (so edit won't fail)
    coverImage: {
      type: String,
      default: "", 
    },

    oldPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    newPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    count: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Book', bookSchema);
