const express    = require('express');
const router     = express.Router();
const Book       = require('../models/Book');
const Student    = require('../models/Student');
const IssuedBook = require('../models/IssuedBook');
const { isLoggedIn, isRole } = require('../middleware/auth');

const guard = [isLoggedIn, isRole('student')];

// GET /api/student/search?q=
router.get('/search', guard, async (req, res) => {
  const q = req.query.q || '';
  try {
    const books = await Book.find({
      $or: [
        { title:  { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error searching books' });
  }
});

// GET /api/student/my-fine
router.get('/my-fine', guard, async (req, res) => {
  try {
    const student = await Student.findById(req.session.user.id);
    res.json({ fine: student.fine });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching fine' });
  }
});

// GET /api/student/my-books
router.get('/my-books', guard, async (req, res) => {
  try {
    const books = await IssuedBook.find({ studentId: req.session.user.id, returned: false })
      .populate('bookId', 'title author');
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// POST /api/student/return-book
router.post('/return-book', guard, async (req, res) => {
  const { issuedBookId } = req.body;
  try {
    const issued = await IssuedBook.findById(issuedBookId);
    if (!issued || issued.returned) {
      return res.status(400).json({ message: 'Invalid issue record' });
    }

    // Calculate fine if overdue
    const today = new Date();
    let fine = 0;
    if (issued.returnDate && today > issued.returnDate) {
      const daysLate = Math.ceil((today - issued.returnDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * issued.finePerDay;
    }

    // Update issued record
    issued.returned = true;
    await issued.save();

    // Increment available copies
    await Book.findByIdAndUpdate(issued.bookId, { $inc: { availableCopies: 1 } });

    // Add fine to student
    if (fine > 0) {
      await Student.findByIdAndUpdate(req.session.user.id, { $inc: { fine: fine } });
    }

    res.json({ message: 'Book returned successfully', fineAdded: fine });
  } catch (err) {
    res.status(500).json({ message: 'Error returning book' });
  }
});

module.exports = router;
