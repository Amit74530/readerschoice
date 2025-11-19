// backend/src/books/book.route.js

const express = require("express");
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

const {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
} = require("./book.controller");

const { verifyAdmin } = require("../middleware/auth");

// --- Cloudinary must be configured (both local + Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- Multer STORAGE (memory only — NO DISK /uploads)
const upload = multer({ storage: multer.memoryStorage() });

// --- Upload buffer to Cloudinary
function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "book_covers",
        use_filename: true,
        unique_filename: false,
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

// --- Middleware to upload coverImage BEFORE controller runs
async function uploadCover(req, res, next) {
  try {
    if (!req.file) return next();

    console.log("Uploading to Cloudinary:", req.file.originalname);

    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    req.body.coverImage = result.secure_url;
    req.file.path = result.secure_url;

    console.log("Uploaded:", result.secure_url);

    next();
  } catch (err) {
    console.error("Cloudinary upload error:", err.message);
    return res.status(500).json({
      message: "Failed to upload image to Cloudinary",
      error: err.message,
    });
  }
}

const router = express.Router();

// CREATE BOOK
router.post(
  "/create-book",
  verifyAdmin,
  upload.single("cover"),
  uploadCover,
  postABook
);

// UPDATE BOOK
router.put(
  "/edit/:id",
  verifyAdmin,
  upload.single("cover"),
  uploadCover,
  UpdateBook
);

// PUBLIC ROUTES
router.get("/", getAllBooks);
router.get("/:id", getSingleBook);
router.delete("/:id", verifyAdmin, deleteABook);

module.exports = router;
