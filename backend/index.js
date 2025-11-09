// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const port = process.env.PORT || 5000;
require('dotenv').config();

// --- ROUTE IMPORTS ---
const bookRoutes = require('./src/books/book.route');
const userRoutes = require("./src/users/user.route");
const adminRoutes = require('./src/stats/admin.stats');


// ---------- NEW: testimonials route ----------
const testimonialRoutes = require('./src/testimonials/testimonial.route');
// ---------------------------------------------

// ---------- NEW: firebase-login route (if present) ----------
let firebaseAuthRoutes;
try {
  firebaseAuthRoutes = require('./src/auth/firebase-login.route');
} catch (err) {
  // route file not present yet — that's fine, we handle it gracefully
  firebaseAuthRoutes = null;
}
// -----------------------------------------------------------

// --- CORS SETUP ---
const allowedOrigins = [
  'https://readerschoice.vercel.app',
  'http://localhost:5174', 
  // add other production origins here if needed
];

const localhostRegex = /^http:\/\/localhost:5\d{3}$/;

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || localhostRegex.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('The CORS policy for this site does not allow access from the specified origin.'), false);
  },
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
};

// Enable preflight for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// --- Middleware ---
app.use(express.json());

// --- Serve uploaded images publicly from /uploads ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes ---
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

// --- Mount firebase exchange route if file exists ---
if (firebaseAuthRoutes) {
  app.use("/api/auth", firebaseAuthRoutes);
  console.log('Mounted /api/auth/firebase-login route');
} else {
  console.log('firebase-login.route not found — skipping mount. Add src/auth/firebase-login.route.js to enable it.');
}

app.use("/api/admin", adminRoutes);


// ---------- NEW: mount testimonials route ----------
app.use('/api/testimonials', testimonialRoutes);
console.log('Mounted /api/testimonials route');
// --------------------------------------------------

// DEV ONLY: quick dev-login route to mint app JWT for an existing user
// remove this before deploying to production
try {
  const jwt = require('jsonwebtoken');
  const User = require('./src/users/user.model');

  app.post('/api/auth/dev-login', async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: 'userId required' });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: 'User not found' });
      const token = jwt.sign({ id: user._id.toString(), role: user.role || 'user' }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
      return res.json({ token, user });
    } catch (err) {
      console.error('dev-login error', err);
      return res.status(500).json({ message: 'dev-login failed' });
    }
  });

  console.log('Mounted /api/auth/dev-login (DEV ONLY)');
} catch (err) {
  console.warn('Could not mount dev-login route (User model or jwt missing).', err.message || err);
}

// simple root
app.get('/', (req, res) => res.send('Book Store Server is running!'));

// --- Start server with DB connect ---
async function main() {
  await mongoose.connect(process.env.DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('MongoDB connected');
  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

main().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
