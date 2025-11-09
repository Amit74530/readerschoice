// src/testimonials/testimonial.route.js
const express = require('express');
const router = express.Router();
const { getTestimonials, postTestimonial } = require('./testimonial.controller');

router.get('/', getTestimonials);
router.post('/', postTestimonial);

module.exports = router;
