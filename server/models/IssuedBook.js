const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema({
  bookId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Book',    required: true },
  studentId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  issueDate:  { type: Date, default: Date.now },
  returnDate: { type: Date },
  finePerDay: { type: Number, default: 0 },
  returned:   { type: Boolean, default: false }
});

module.exports = mongoose.model('IssuedBook', issuedBookSchema);
