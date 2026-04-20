const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const Admin = require('../models/Admin');
const Staff = require('../models/Staff');
const Student = require('../models/Student');

// POST /api/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = null;
    let role = null;

    // 1. Check Admin
    const admin = await Admin.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.password)) {
      user = admin; role = 'admin';
    }

    // 2. Check Staff
    if (!user) {
      const staff = await Staff.findOne({ email });
      if (staff && await bcrypt.compare(password, staff.password)) {
        user = staff; role = 'staff';
      }
    }

    // 3. Check Student
    if (!user) {
      const student = await Student.findOne({ email });
      if (student && await bcrypt.compare(password, student.password)) {
        user = student; role = 'student';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Set Session
    req.session.user = { id: user._id, role };
    
    // Redirect based on role
    const redirectMap = { admin: '/admin', staff: '/staff', student: '/student' };
    res.redirect(redirectMap[role]);

  } catch (err) {
    res.status(500).json({ message: 'Server error during login.' });
  }
});

// POST /api/logout
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/');
  });
});

module.exports = router;