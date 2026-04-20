const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fine:     { type: Number, default: 0 }
});

module.exports = mongoose.model('Student', studentSchema);
