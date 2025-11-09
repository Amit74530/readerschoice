// src/testimonials/testimonial.controller.js
const Testimonial = require('./testimonial.model');

/**
 * GET /api/testimonials?limit=3
 */
exports.getTestimonials = async (req, res) => {
  try {
    const limit = Math.min(50, Number(req.query.limit) || 3);
    const testimonials = await Testimonial.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    res.status(200).json(testimonials);
  } catch (err) {
    console.error('getTestimonials error:', err);
    res.status(500).json({ message: 'Failed to fetch testimonials', error: err.message });
  }
};

/**
 * POST /api/testimonials
 * Body: { name?, email?, comment, rating }
 */
exports.postTestimonial = async (req, res) => {
  try {
    const { name, email, comment, rating } = req.body;

    if (!comment || rating == null) {
      return res.status(400).json({ message: 'Comment and rating are required.' });
    }

    const r = Number(rating);
    if (!(r >= 1 && r <= 5)) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
    }

    const newReview = new Testimonial({
      name: (name || '').trim() || undefined,
      email: (email || '').trim() || undefined,
      comment: comment.trim(),
      rating: r
    });

    const saved = await newReview.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error('postTestimonial error:', err);
    res.status(500).json({ message: 'Failed to save testimonial', error: err.message });
  }
};
