// backend/src/books/book.controller.js
const Book = require("./book.model");
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

// POST - create a new book (image optional, categories optional)
const postABook = async (req, res) => {
  try {
    const fileUrl = uploadedFileToPublicUrl(req.file) || req.body.coverImage || undefined;
    const categories = parseCategories(req.body?.category);

    const bookData = {
      title: req.body.title,
      author: req.body.author || 'Unknown',
      description: req.body.description || '',
      category: categories,
      trending: req.body.trending === 'true' || req.body.trending === true || false,
      ...(fileUrl ? { coverImage: fileUrl } : {}),
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : 0,
      newPrice: req.body.newPrice ? Number(req.body.newPrice) : 0,
      count: req.body.count ? Number(req.body.count) : 1,
    };

    const newBook = new Book(bookData);
    await newBook.save();

    return res.status(201).json({ message: 'Book posted successfully', book: newBook });
  } catch (error) {
    console.error('Error creating book', error);
    return res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
};

// get all books
const getAllBooks =  async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1});
    res.status(200).send(books);
  } catch (error) {
    console.error("Error fetching books", error);
    res.status(500).send({message: "Failed to fetch books"});
  }
};

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
    console.error('Error fetching book', error);
    return res.status(500).json({ message: 'Failed to fetch book' });
  }
};

const UpdateBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid book id' });
    }

    // Build update object from provided fields
    const update = {};

    if (req.body.title !== undefined) update.title = req.body.title;
    if (req.body.author !== undefined) update.author = req.body.author;
    if (req.body.description !== undefined) update.description = req.body.description;

    if (req.body.category !== undefined) {
      update.category = parseCategories(req.body.category);
    }

    if (req.body.trending !== undefined) {
      update.trending = req.body.trending === 'true' || req.body.trending === true;
    }

    if (req.body.oldPrice !== undefined) update.oldPrice = Number(req.body.oldPrice);
    if (req.body.newPrice !== undefined) update.newPrice = Number(req.body.newPrice);
    if (req.body.count !== undefined) update.count = Number(req.body.count);

    // If a new cover was uploaded, convert to public URL (disk -> /uploads/<filename>, cloud -> secure_url)
    const fileUrl = uploadedFileToPublicUrl(req.file);
    if (fileUrl) update.coverImage = fileUrl;

    // If no fields provided, return a 400 (avoid accidental empty updates)
    if (Object.keys(update).length === 0) {
      return res.status(400).json({ message: 'No update fields provided' });
    }

    const updatedBook = await Book.findByIdAndUpdate(id, update, { new: true });

    if (!updatedBook) {
      return res.status(404).json({ message: "Book is not Found!" });
    }

    return res.status(200).json({ message: "Book updated successfully", book: updatedBook });
  } catch (error) {
    console.error("Error updating a book", error);
    return res.status(500).json({ message: "Failed to update a book", error: error.message });
  }
};

const deleteABook = async (req, res) => {
  try {
    const {id} = req.params;
    const deletedBook =  await Book.findByIdAndDelete(id);
    if(!deletedBook) {
      return res.status(404).send({message: "Book is not Found!"});
    }
    res.status(200).send({
      message: "Book deleted successfully",
      book: deletedBook
    });
  } catch (error) {
    console.error("Error deleting a book", error);
    res.status(500).send({message: "Failed to delete a book"});
  }
};

module.exports = {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook
};
