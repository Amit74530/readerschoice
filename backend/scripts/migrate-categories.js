/**
 * migrate-categories.js
 *
 * Usage:
 *   # from backend folder
 *   DB_URL="mongodb://..." node scripts/migrate-categories.js
 *
 * The script:
 * - creates a backup collection named books_backup_<timestamp>
 * - converts string categories to arrays
 * - ensures missing category becomes []
 */

const mongoose = require('mongoose');

const DB_URL = process.env.DB_URL || process.env.MONGO_URL;
if (!DB_URL) {
  console.error('ERROR: set DB_URL environment variable before running this script.');
  console.error('Example: DB_URL="mongodb://localhost:27017/readerschoice" node scripts/migrate-categories.js');
  process.exit(1);
}

async function main() {
  await mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection.db;
  const booksColl = db.collection('books');

  const ts = new Date();
  const stamp = ts.toISOString().replace(/[:.]/g, '-');
  const backupName = `books_backup_${stamp}`;

  console.log('Connected to DB.');
  console.log(`Creating backup collection: ${backupName} ...`);

  // 1) Backup all books
  try {
    // copy all documents to backup collection
    const copyResult = await db.collection('books').aggregate([
      { $match: {} },
      { $out: backupName }
    ]).toArray(); // $out executes and returns empty cursor in Node, but we await to ensure completion
  } catch (err) {
    // Note: mongodb driver may throw if aggregate with $out returns no documents — ignore if collection created
    // We'll try an alternative copy if $out failed
    console.warn('Warning while using $out for backup (this may be fine):', err.message || err);
    // fallback: insertMany
    const docs = await booksColl.find({}).toArray();
    if (docs.length) {
      await db.collection(backupName).insertMany(docs);
    } else {
      await db.collection(backupName).insertOne({ _backupEmpty: true, createdAt: new Date() });
    }
  }

  console.log('Backup done.');

  // 2) Find books needing change
  // - category is a string
  // - category is missing or null (we will set [] for these too)
  const cursorString = booksColl.find({ category: { $type: "string" } });
  const stringDocs = await cursorString.toArray();
  console.log(`Found ${stringDocs.length} document(s) where category is a string.`);

  let updatedCount = 0;

  // Update each string -> array
  for (const doc of stringDocs) {
    const catStr = (doc.category || '').toString().trim();
    const cats = catStr ? [catStr] : [];
    const res = await booksColl.updateOne({ _id: doc._id }, { $set: { category: cats }});
    if (res.modifiedCount > 0) updatedCount++;
  }

  // 3) Ensure documents where category is missing or null become []
  const cursorMissing = booksColl.find({ $or: [ { category: { $exists: false } }, { category: null } ] });
  const missingDocs = await cursorMissing.toArray();
  console.log(`Found ${missingDocs.length} document(s) where category is missing or null.`);

  let missingUpdated = 0;
  for (const doc of missingDocs) {
    const res = await booksColl.updateOne({ _id: doc._id }, { $set: { category: [] }});
    if (res.modifiedCount > 0) missingUpdated++;
  }

  console.log('--- Migration summary ---');
  console.log(`Backed up collection: ${backupName}`);
  console.log(`String->Array conversions: ${updatedCount}`);
  console.log(`Missing/null category updated to []: ${missingUpdated}`);
  console.log('If everything looks good you can remove the backup collection later.');

  await mongoose.disconnect();
  console.log('Done. Disconnected from DB.');
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
