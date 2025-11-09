// src/testimonials/testimonial.model.js
const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: false },
  email: { type: String, trim: true, required: false },
  comment: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
