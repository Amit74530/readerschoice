// backend/src/books/book.route.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

let CloudinaryStorage;
let cloudinary;
try {
  CloudinaryStorage = require('multer-storage-cloudinary').CloudinaryStorage;
  cloudinary = require('cloudinary').v2;
} catch (err) {
  CloudinaryStorage = null;
  cloudinary = null;
}

// controllers & middleware
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook } = require('./book.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth'); // <- important

// Ensure uploads directory exists (backend/uploads)
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure storage: prefer Cloudinary if available + env vars; fallback to disk
let upload;
if (
  CloudinaryStorage &&
  cloudinary &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'book_covers',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, crop: 'limit' }],
    },
  });

  upload = multer({ storage });
  console.log('Using CloudinaryStorage for uploads');
} else {
  // local disk storage fallback
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (req, file, cb) {
      const ts = Date.now();
      const safeName = file.originalname.replace(/\s+/g, '-').toLowerCase();
      cb(null, `${ts}-${safeName}`);
    },
  });

  upload = multer({ storage: diskStorage });
  console.log('Cloudinary not configured — using local disk storage at', UPLOADS_DIR);
}

const router = express.Router();

// Routes
// POST create-book (admin protected)
router.post('/create-book', verifyAdmin, upload.single('cover'), postABook);

// GET all books (public)
router.get('/', getAllBooks);

// GET single book
router.get('/:id', getSingleBook);

// PUT edit book (admin protected, cover optional)
router.put('/edit/:id', verifyAdmin, upload.single('cover'), UpdateBook);

// DELETE book (admin)
router.delete('/:id', verifyAdmin, deleteABook);

module.exports = router;
