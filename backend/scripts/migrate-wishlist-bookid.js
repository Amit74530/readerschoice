// scripts/migrate-wishlist-bookid.js
require('dotenv').config();
const mongoose = require('mongoose');
const Wishlist = require('../src/wishlist/wishlist.model');

async function main() {
  await mongoose.connect(process.env.DB_URL);
  console.log('Connected to DB');

  const docs = await Wishlist.find({ book: { $exists: false }, bookId: { $exists: true } });
  console.log('Found', docs.length, 'legacy wishlist docs to migrate');

  let migrated = 0;
  for (const d of docs) {
    const bid = d.bookId;
    if (!mongoose.Types.ObjectId.isValid(bid)) {
      console.log('Skipping invalid bookId for wishlist', d._id.toString(), bid);
      continue;
    }
    d.book = mongoose.Types.ObjectId(bid);
    d.bookId = undefined;
    await d.save();
    migrated++;
    console.log('Migrated', d._id.toString());
  }

  console.log('Done. Migrated', migrated);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
