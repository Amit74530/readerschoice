// scripts/fix-cover-paths.js
const mongoose = require('mongoose');
require('dotenv').config();
const Book = require('../src/books/book.model');

async function main() {
  await mongoose.connect(process.env.DB_URL, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
  });
  console.log('✅ Connected to MongoDB');

  const books = await Book.find({});
  let updated = 0;

  for (const b of books) {
    if (
      b.coverImage &&
      !b.coverImage.includes('/') &&
      !/^https?:\/\//i.test(b.coverImage)
    ) {
      b.coverImage = `uploads/${b.coverImage}`;
      await b.save();
      updated++;
    }
  }

  console.log(`✨ Updated ${updated} book(s)`);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
