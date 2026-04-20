/**
 * Seed script — creates default Admin, Staff, and Student accounts.
 * Run ONCE with: node server/seed.js
 *
 * Default credentials:
 *   Admin:   admin@library.com  / Admin@123
 *   Staff:   staff@library.com  / Staff@123
 *   Student: student@library.com / Student@123
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcrypt');

const Admin   = require('./models/Admin');
const Staff   = require('./models/Staff');
const Student = require('./models/Student');
const Book    = require('./models/Book');

const SALT = 10;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB:', process.env.MONGO_URI);

  // ── Admin ───────────────────────────────────────────────────────────────
  const adminEmail = 'admin@library.com';
  const adminExists = await Admin.findOne({ email: adminEmail });
  if (!adminExists) {
    await Admin.create({
      email:    adminEmail,
      password: await bcrypt.hash('Admin@123', SALT)
    });
    console.log('✔  Admin created   →', adminEmail, '/ Admin@123');
  } else {
    console.log('–  Admin already exists, skipping.');
  }

  // ── Staff ────────────────────────────────────────────────────────────────
  const staffEmail = 'staff@library.com';
  const staffExists = await Staff.findOne({ email: staffEmail });
  if (!staffExists) {
    await Staff.create({
      name:     'Library Staff',
      email:    staffEmail,
      password: await bcrypt.hash('Staff@123', SALT)
    });
    console.log('✔  Staff created   →', staffEmail, '/ Staff@123');
  } else {
    console.log('–  Staff already exists, skipping.');
  }

  // ── Student ──────────────────────────────────────────────────────────────
  const studentEmail = 'student@library.com';
  const studentExists = await Student.findOne({ email: studentEmail });
  if (!studentExists) {
    await Student.create({
      name:     'Demo Student',
      email:    studentEmail,
      password: await bcrypt.hash('Student@123', SALT),
      fine:     0
    });
    console.log('✔  Student created →', studentEmail, '/ Student@123');
  } else {
    console.log('–  Student already exists, skipping.');
  }

  // ── Sample Books ─────────────────────────────────────────────────────────
  const bookCount = await Book.countDocuments();
  if (bookCount === 0) {
    await Book.insertMany([
      { title: 'The Great Gatsby',         author: 'F. Scott Fitzgerald', isbn: '978-0743273565', totalCopies: 5, availableCopies: 5 },
      { title: 'To Kill a Mockingbird',    author: 'Harper Lee',          isbn: '978-0061935466', totalCopies: 3, availableCopies: 3 },
      { title: 'Data Structures in C++',  author: 'D.S. Malik',          isbn: '978-1285415017', totalCopies: 4, availableCopies: 4 },
      { title: 'Introduction to Algorithms', author: 'Cormen et al.',    isbn: '978-0262033848', totalCopies: 2, availableCopies: 2 },
    ]);
    console.log('✔  Sample books inserted.');
  } else {
    console.log('–  Books already exist, skipping.');
  }

  await mongoose.disconnect();
  console.log('\nSeeding complete! You can now run: npm start');
}

seed().catch(err => { console.error(err); process.exit(1); });
