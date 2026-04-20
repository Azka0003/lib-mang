const express    = require('express');
const router     = express.Router();
const bcrypt     = require('bcrypt');
const Staff      = require('../models/Staff');
const IssuedBook = require('../models/IssuedBook');
const { isLoggedIn, isRole } = require('../middleware/auth');

const guard = [isLoggedIn, isRole('admin')];

// POST /api/admin/add-staff
router.post('/add-staff', guard, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const staff  = new Staff({ name, email, password: hashed });
    await staff.save();
    res.json({ message: 'Staff added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error adding staff' });
  }
});

// POST /api/admin/set-fine
router.post('/set-fine', guard, async (req, res) => {
  const { issuedBookId, finePerDay } = req.body;
  try {
    await IssuedBook.findByIdAndUpdate(issuedBookId, { finePerDay });
    res.json({ message: 'Fine updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating fine' });
  }
});

// POST /api/admin/set-return-date
router.post('/set-return-date', guard, async (req, res) => {
  const { issuedBookId, returnDate } = req.body;
  try {
    await IssuedBook.findByIdAndUpdate(issuedBookId, { returnDate: new Date(returnDate) });
    res.json({ message: 'Return date updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating return date' });
  }
});

module.exports = router;
