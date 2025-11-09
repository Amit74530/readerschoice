// src/books/book.controller.js
const Book = require("./book.model");
const mongoose = require('mongoose');
// inside src/books/book.controller.js — replace postABook with this:
const postABook = async (req, res) => {
  try {
    // multer-storage-cloudinary sets req.file.path to the uploaded Cloudinary URL
    const coverUrl = req.file?.path || req.body.coverImage || '';

    const bookData = {
      title: req.body.title,
      author: req.body.author || 'Unknown',
      description: req.body.description || '',
      category: req.body.category || '',
      trending: req.body.trending === 'true' || req.body.trending === true || false,
      coverImage: coverUrl, // store full Cloudinary HTTPS URL
      oldPrice: req.body.oldPrice ? Number(req.body.oldPrice) : 0,
      newPrice: req.body.newPrice ? Number(req.body.newPrice) : 0,
      count: req.body.count ? Number(req.body.count) : 1,
    };

    const newBook = new (require('./book.model'))(bookData);
    await newBook.save();

    return res.status(200).json({ message: 'Book posted successfully', book: newBook });
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
}

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

    // Build update object from body fields
    const update = {
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.author !== undefined && { author: req.body.author }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.category !== undefined && { category: req.body.category }),
      ...(req.body.trending !== undefined && { trending: req.body.trending === 'true' || req.body.trending === true }),
      ...(req.body.oldPrice !== undefined && { oldPrice: Number(req.body.oldPrice) }),
      ...(req.body.newPrice !== undefined && { newPrice: Number(req.body.newPrice) }),
      ...(req.body.count !== undefined && { count: Number(req.body.count) }),
    };

    // If a new cover was uploaded (multer-storage-cloudinary), req.file.path is the Cloudinary URL
    if (req.file?.path) {
      update.coverImage = req.file.path;
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
