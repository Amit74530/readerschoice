// backend/src/books/book.controller.js
const Book = require('./book.model');
const mongoose = require('mongoose');
const path = require('path');

/**
 * Normalize category input into array
 */
function parseCategories(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(String).map(s => s.trim()).filter(Boolean);

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map(String).map(s => s.trim()).filter(Boolean);
    } catch (err) {
      // not JSON -> continue
    }

    return trimmed.split(',').map(s => s.trim()).filter(Boolean);
  }

  return [];
}

/**
 * Helper to obtain a web-accessible URL for uploaded file.
 * - If the file comes from Cloudinary (req.file.secure_url or req.file.path is a URL), return it.
 * - If the file is stored on disk (req.file.path is an absolute path), convert to a relative '/uploads/<basename>'.
 */
function uploadedFileToPublicUrl(file) {
  if (!file) return undefined;

  // Some Cloudinary multer integrations set secure_url
  if (file.secure_url) return file.secure_url;

  // If path looks like an http(s) URL, return it
  if (typeof file.path === 'string' && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }

  // Otherwise assume disk storage: return '/uploads/<basename>'
  if (typeof file.path === 'string') {
    const filename = path.basename(file.path);
    return `/uploads/${filename}`;
  }

  // fallback undefined
  return undefined;
}

/**
 * GET - list all books
 */
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({}).sort({ createdAt: -1 }).lean();
    return res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books', error && (error.stack || error.message));
    return res.status(500).json({ message: 'Failed to fetch books', error: error?.message });
  }
};

/**
 * POST - create a new book (image optional, categories optional)
 */
const postABook = async (req, res) => {
  try {
    // Normalize cover URL from multiple possible sources (prefer Cloudinary)
    const coverUrl =
      (req.body && (req.body.coverImage || req.body.cover)) ||
      (req.file && (req.file.path || req.file.secure_url || req.file.url)) ||
      (typeof uploadedFileToPublicUrl === 'function' ? uploadedFileToPublicUrl(req.file) : undefined) ||
      undefined;

    const categories = parseCategories(req.body?.category);

    const bookData = {
      title: req.body.title,
      author: req.body.author || 'Unknown',
      description: req.body.description || '',
      category: categories,
      trending: req.body.trending === 'true' || req.body.trending === true || false,
      ...(coverUrl ? { coverImage: coverUrl } : {}),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : 0,
      newPrice: req.body.newPrice ? Number(req.body.newPrice) : 0,
      count: req.body.count ? Number(req.body.count) : 1,
    };

    const newBook = new Book(bookData);
    await newBook.save();

    console.log('Created book with cover:', newBook.coverImage || '(none)');

    return res.status(201).json({ message: 'Book posted successfully', book: newBook });
  } catch (error) {
    console.error('Error creating book', error && (error.stack || error.message));
    return res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
};

/**
 * GET - single book
 */
const getSingleBook = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book id' });
    }
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not Found!' });
    return res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book', error && (error.stack || error.message));
    return res.status(500).json({ message: 'Failed to fetch book' });
  }
};

/**
 * PUT - update a book (image optional)
 */
const UpdateBook = async (req, res) => {
  try {
    const coverUrl =
      (req.body && (req.body.coverImage || req.body.cover)) ||
      (req.file && (req.file.path || req.file.secure_url || req.file.url)) ||
      (typeof uploadedFileToPublicUrl === 'function' ? uploadedFileToPublicUrl(req.file) : undefined) ||
      undefined;

    const updateData = {
      title: req.body.title,
      author: req.body.author,
      description: req.body.description,
      category: parseCategories(req.body?.category),
      trending: req.body.trending === 'true' || req.body.trending === true || false,
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : undefined,
      newPrice: req.body.newPrice ? Number(req.body.newPrice) : undefined,
      count: req.body.count ? Number(req.body.count) : undefined,
      // only set coverImage if a new cover is present
      ...(coverUrl ? { coverImage: coverUrl } : {}),
    };

    // remove undefined keys so we don't overwrite fields unintentionally
    Object.keys(updateData).forEach((k) => updateData[k] === undefined && delete updateData[k]);

    const updated = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updated) return res.status(404).json({ message: 'Book not found' });

    console.log('Updated book', updated._id, 'cover:', updated.coverImage || '(none)');

    return res.json({ message: 'Book updated', book: updated });
  } catch (error) {
    console.error('Error updating book', error && (error.stack || error.message));
    return res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};

/**
 * DELETE - delete a book
 */
const deleteABook = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedBook = await Book.findByIdAndDelete(id);
    if (!deletedBook) {
      return res.status(404).send({ message: 'Book is not Found!' });
    }
    res.status(200).send({
      message: 'Book deleted successfully',
      book: deletedBook,
    });
  } catch (error) {
    console.error('Error deleting a book', error && (error.stack || error.message));
    res.status(500).send({ message: 'Failed to delete a book' });
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
};
