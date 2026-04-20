require('dotenv').config();
const express      = require('express');
const session      = require('express-session');
const MongoStore   = require('connect-mongo');
const path         = require('path');
const connectDB    = require('./config/db');

const authRoutes    = require('./routes/auth');
const adminRoutes   = require('./routes/admin');
const staffRoutes   = require('./routes/staff');
const studentRoutes = require('./routes/student');

const { isLoggedIn, isRole } = require('./middleware/auth');

const app = express();
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

app.get('/admin', isLoggedIn, isRole('admin'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/admin.html'));
});

app.get('/staff', isLoggedIn, isRole('staff'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/staff.html'));
});

app.get('/student', isLoggedIn, isRole('student'), (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/student.html'));
});

// API Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/student', studentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
