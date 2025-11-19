// scripts/upload_and_update_book.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;

async function main() {
  const [,, bookId, localPath] = process.argv;
  if (!bookId || !localPath) {
    console.error('Usage: node scripts/upload_and_update_book.js <BOOK_ID> <LOCAL_FILE_PATH>');
    process.exit(1);
  }
  if (!fs.existsSync(localPath)) {
    console.error('Local file not found:', localPath);
    process.exit(1);
  }

  if (!process.env.DB_URL) {
    console.error('❌ Set DB_URL in .env');
    process.exit(1);
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.error('❌ Set CLOUDINARY_* env vars in .env');
    process.exit(1);
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  await mongoose.connect(process.env.DB_URL);

  const Book = mongoose.model('Book', new mongoose.Schema({}, { strict: false, collection: 'books' }));

  try {
    console.log('Uploading to Cloudinary:', localPath);
    const res = await cloudinary.uploader.upload(localPath, {
      folder: process.env.CLOUDINARY_FOLDER || 'book_covers',
      use_filename: true,
      unique_filename: false,
    });

    const url = res.secure_url || res.url;
    console.log('Uploaded ->', url);

    const update = await Book.findByIdAndUpdate(
      bookId,
      { $set: { coverImage: url } },
      { new: true }
    );

    if (!update) {
      console.error('Book not found with id:', bookId);
    } else {
      console.log('Book updated. New coverImage:', update.coverImage);
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

main();
