// scripts/migrate-uploads-to-cloudinary.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const Book = require('../src/books/book.model');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function upload(localPath) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(localPath, { folder: 'book_covers' }, (err, res) => {
      if (err) return reject(err);
      resolve(res);
    });
  });
}

async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to DB');

  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('No uploads directory found at', uploadsDir);
    process.exit(0);
  }

  const books = await Book.find({});
  let updated = 0;

  for (const book of books) {
    const ci = book.coverImage;
    // skip if already a URL
    if (!ci || /^https?:\/\//i.test(ci)) continue;

    // handle filenames with possible spaces
    const localFile = path.join(uploadsDir, ci);

    if (!fs.existsSync(localFile)) {
      console.log('Local file missing for', book._id, 'expected at', localFile);
      continue;
    }

    try {
      console.log('Uploading', localFile, 'for book', book._id);
      const res = await upload(localFile);
      book.coverImage = res.secure_url;
      await book.save();
      console.log('Updated', book._id, '->', res.secure_url);
      updated++;
    } catch (err) {
      console.error('Failed upload for', book._id, err.message || err);
    }
  }

  console.log('Done. Updated', updated, 'books');
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
