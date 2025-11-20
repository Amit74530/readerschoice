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

// CREATE
router.post("/create-book", verifyAdmin, ...uploadAndAttach("cover"), postABook);

// UPDATE
router.put("/edit/:id", verifyAdmin, ...uploadAndAttach("cover"), UpdateBook);

// READ
router.get("/", getAllBooks);
router.get("/:id", getSingleBook);

// DELETE
router.delete("/:id", verifyAdmin, deleteABook);

module.exports = router;
