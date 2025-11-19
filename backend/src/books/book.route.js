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

// Fail fast if Cloudinary env vars missing on startup (so deployed server won't silently fallback)
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error("❌ Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET");
  throw new Error("Cloudinary not configured");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Multer memory storage (no disk writes)
const upload = multer({ storage: multer.memoryStorage() });

function uploadToCloudinary(buffer, filename) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "book_covers",
        use_filename: true,
        unique_filename: false,
        resource_type: "image",
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

async function uploadCover(req, res, next) {
  try {
    if (!req.file || !req.file.buffer) return next();

    console.log("uploadCover: detected file", req.file.originalname, "size", req.file.size);
    const result = await uploadToCloudinary(req.file.buffer, req.file.originalname);
    const url = result.secure_url || result.url;

    // normalize
    req.file.path = url;
    req.file.secure_url = url;
    req.body = req.body || {};
    req.body.cover = url;
    req.body.coverImage = url;

    console.log("uploadCover: uploaded to Cloudinary ->", url);
    return next();
  } catch (err) {
    console.error("uploadCover: Cloudinary upload failed:", err && (err.message || err));
    return res.status(500).json({ message: "Failed to upload cover to Cloudinary", error: (err && err.message) || String(err) });
  }
}

const router = express.Router();

router.post("/create-book", verifyAdmin, upload.single("cover"), uploadCover, postABook);
router.put("/edit/:id", verifyAdmin, upload.single("cover"), uploadCover, UpdateBook);
router.get("/", getAllBooks);
router.get("/:id", getSingleBook);
router.delete("/:id", verifyAdmin, deleteABook);

module.exports = router;
