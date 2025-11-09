// src/books/book.route.js
const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { postABook, getAllBooks, getSingleBook, UpdateBook, deleteABook } = require('./book.controller');
const { verifyToken, verifyAdmin } = require('../middleware/auth');


const router = express.Router();

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer storage that uploads directly to Cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'book_covers', // folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

const upload = multer({ storage });

router.post("/create-book", verifyAdmin, upload.single('cover'), postABook); // admin only
router.get("/", getAllBooks); // public
router.get("/:id", getSingleBook); // public
router.put("/edit/:id", verifyAdmin, upload.single('cover'), UpdateBook); // admin only
router.delete("/:id", verifyAdmin, deleteABook); // admin only

module.exports = router;
