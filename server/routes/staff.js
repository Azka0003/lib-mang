const express    = require('express');
const router     = express.Router();
const Book       = require('../models/Book');
const IssuedBook = require('../models/IssuedBook');
const { isLoggedIn, isRole } = require('../middleware/auth');

const guard = [isLoggedIn, isRole('staff')];

// POST /api/staff/add-book
router.post('/add-book', guard, async (req, res) => {
  const { title, author, isbn, totalCopies } = req.body;
  try {
    const book = new Book({ title, author, isbn, totalCopies, availableCopies: totalCopies });
    await book.save();
    res.json({ message: 'Book added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding book' });
  }
});

// POST /api/staff/delete-book
router.post('/delete-book', guard, async (req, res) => {
  const { bookId } = req.body;
  try {
    await Book.findByIdAndDelete(bookId);
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting book' });
  }
});

// POST /api/staff/issue-book
router.post('/issue-book', guard, async (req, res) => {
  const { bookId, studentId } = req.body;
  try {
    const book = await Book.findById(bookId);
    if (!book || book.availableCopies < 1) {
      return res.status(400).json({ message: 'Book not available' });
    }
    const issued = new IssuedBook({ bookId, studentId, issueDate: new Date() });
    await issued.save();
    book.availableCopies -= 1;
    await book.save();
    res.json({ message: 'Book issued successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error issuing book' });
  }
});

// GET /api/staff/issued-books
router.get('/issued-books', guard, async (req, res) => {
  try {
    const issued = await IssuedBook.find({ returned: false })
      .populate('bookId', 'title')
      .populate('studentId', 'name email');
    res.json(issued);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching issued books' });
  }
});

// GET /api/staff/available-books
router.get('/available-books', guard, async (req, res) => {
  try {
    const books = await Book.find({ availableCopies: { $gt: 0 } });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

module.exports = router;
