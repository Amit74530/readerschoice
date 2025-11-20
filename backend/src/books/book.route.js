// backend/src/books/book.route.js

const express = require("express");
const { uploadAndAttach } = require("../middleware/uploadCloudinary");

const {
  postABook,
  getAllBooks,
  getSingleBook,
  UpdateBook,
  deleteABook,
} = require("./book.controller");

const { verifyAdmin } = require("../middleware/auth");

const router = express.Router();

router.post("/create-book", verifyAdmin, ...uploadAndAttach("cover"), postABook);

router.put("/edit/:id", verifyAdmin, ...uploadAndAttach("cover"), UpdateBook);

router.get("/", getAllBooks);
router.get("/:id", getSingleBook);

router.delete("/:id", verifyAdmin, deleteABook);

module.exports = router;
