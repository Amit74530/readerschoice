// backend/src/middleware/uploadCloudinary.js

const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

// Ensure Cloudinary env vars exist
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("❌ Cloudinary configuration missing!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Use memory storage only
const upload = multer({ storage: multer.memoryStorage() });

// Convert normal text → clean filename
function clean(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Upload the buffer to Cloudinary with title-based public_id
async function uploadToCloudinary(buffer, title, original) {
  return new Promise((resolve, reject) => {
    const ext = (original.split(".").pop() || "jpg").toLowerCase();

    const name = clean(title);
    const public_id = `${name}-${Date.now()}`;

    const options = {
      folder: process.env.CLOUDINARY_FOLDER || "book_covers",
      public_id,
      format: ext,
      overwrite: false,
      resource_type: "image",
    };

    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

function uploadAndAttach(field = "cover") {
  return [
    upload.single(field),

    async (req, res, next) => {
      try {
        if (!req.file) return next();

        const title = req.body?.title || req.body?.name || "book";
        const original = req.file.originalname || "image.jpg";

        const result = await uploadToCloudinary(
          req.file.buffer,
          title,
          original
        );

        req.body.coverImage = result.secure_url;
        req.file.path = result.secure_url;

        next();
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        return res.status(500).json({
          message: "Image upload failed",
          error: err.message,
        });
      }
    },
  ];
}

module.exports = { uploadAndAttach };
