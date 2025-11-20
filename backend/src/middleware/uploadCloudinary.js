// src/middleware/uploadCloudinary.js
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;

// fail fast if Cloudinary not configured
if (
  !process.env.CLOUDINARY_CLOUD_NAME ||
  !process.env.CLOUDINARY_API_KEY ||
  !process.env.CLOUDINARY_API_SECRET
) {
  console.error('❌ Cloudinary env vars missing. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET');
  throw new Error('Cloudinary not configured');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const upload = multer({ storage: multer.memoryStorage() });

function toKebab(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function makePublicId(title, originalName) {
  const bad = ['file', 'file.jpg', 'blob', 'image', 'undefined', 'null'];
  const safeTitle = toKebab(title || '');
  let baseName = originalName ? originalName.replace(/\.[^/.]+$/, '') : '';
  if (bad.includes((baseName || '').toLowerCase())) baseName = '';
  const fallback = safeTitle || toKebab(baseName) || 'book';
  return `${fallback}-${Date.now()}`;
}

/**
 * Upload a buffer to Cloudinary.
 * - If reqBookId is provided: public_id = `book_<id>` and overwrite = true (replace image on update)
 * - Otherwise: public_id = title-kebab-timestamp, overwrite = false (create new asset)
 */
function uploadBufferToCloudinary(buffer, originalName, bookTitle, reqBookId) {
  return new Promise((resolve, reject) => {
    const extMatch = (originalName || '').match(/\.([a-z0-9]+)$/i);
    const ext = extMatch ? extMatch[1] : undefined;

    let publicId;
    let overwrite = false;
    if (reqBookId) {
      publicId = `book_${reqBookId}`; // e.g. book_691b7fe3...
      overwrite = true;
    } else {
      publicId = makePublicId(bookTitle, originalName);
      overwrite = false;
    }

    const opts = {
      folder: process.env.CLOUDINARY_FOLDER || 'book_covers',
      public_id: publicId,
      overwrite,
      resource_type: 'image',
      transformation: [{ width: 1200, crop: 'limit' }],
      ...(ext ? { format: ext } : {}),
    };

    // debug: what we're sending
    console.log('uploadCloudinary -> sending opts to Cloudinary:', JSON.stringify(opts));

    const uploadStream = cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) {
        console.error('uploadCloudinary -> cloudinary error:', err && (err.message || err));
        return reject(err);
      }
      console.log('uploadCloudinary -> cloudinary result.public_id:', result && result.public_id);
      resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

/**
 * Middleware factory: uploadAndAttach(fieldName)
 * - usage: ...uploadAndAttach('cover') in your route
 * After upload, it attaches:
 *   req.file.path, req.file.secure_url, req.file.cloudinary
 *   req.body.cover, req.body.coverImage
 */
function uploadAndAttach(fieldName = 'cover') {
  return [
    upload.single(fieldName),
    async (req, res, next) => {
      try {
        if (!req.file || !req.file.buffer) return next();

        const originalName = req.file.originalname || 'file.jpg';
        const title = req.body && (req.body.title || req.body.name) ? req.body.title || req.body.name : undefined;
        const reqBookId = (req.params && req.params.id) ? req.params.id : undefined;

        console.log('uploadCloudinary middleware -> file detected:', originalName, 'title:', title, 'reqBookId:', reqBookId);

        const result = await uploadBufferToCloudinary(req.file.buffer, originalName, title, reqBookId);
        const url = result.secure_url || result.url;

        // normalize fields for downstream controllers
        req.file.path = url;
        req.file.secure_url = url;
        req.file.cloudinary = { public_id: result.public_id, raw: result };

        req.body = req.body || {};
        req.body.cover = url;
        req.body.coverImage = url;

        return next();
      } catch (err) {
        console.error('uploadCloudinary middleware error:', err && (err.stack || err.message || err));
        return res.status(500).json({ message: 'Failed to upload to Cloudinary', error: (err && err.message) || String(err) });
      }
    },
  ];
}

module.exports = { uploadAndAttach, upload };
