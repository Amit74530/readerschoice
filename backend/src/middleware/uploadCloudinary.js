const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("cloudinary").v2;

// Require Cloudinary env
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  throw new Error("Cloudinary env vars missing");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Memory upload
const upload = multer({ storage: multer.memoryStorage() });

// Helpers
const clean = (s) =>
  String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Unique Cloudinary upload
function uploadBuffer(buffer, title, originalName) {
  return new Promise((resolve, reject) => {
    const ext = (originalName.split(".").pop() || "jpg").toLowerCase();
    const safeTitle = clean(title || '');
    const public_id = `${safeTitle}-${Date.now()}`;

    const opts = {
      folder: process.env.CLOUDINARY_FOLDER || "book_covers",
      public_id,
      overwrite: false,
      resource_type: "image",
      format: ext,
    };

    const stream = cloudinary.uploader.upload_stream(opts, (err, result) => {
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

        const title = req.body?.title || "book";
        const originalName = req.file.originalname || "image.jpg";

        const result = await uploadBuffer(req.file.buffer, title, originalName);
        const url = result.secure_url;

        req.body.coverImage = url;
        req.file.path = url;

        next();
      } catch (err) {
        console.error("Cloudinary upload error:", err);
        res.status(500).json({
          message: "Cloudinary upload failed",
          error: err.message,
        });
      }
    },
  ];
}

module.exports = { uploadAndAttach };
