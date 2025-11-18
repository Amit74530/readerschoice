// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const port = process.env.PORT || 5000;
require("dotenv").config();

// --- ROUTE IMPORTS ---
const bookRoutes = require("./src/books/book.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");
const testimonialRoutes = require("./src/testimonials/testimonial.route");

// --- Optional firebase-login route ---
let firebaseAuthRoutes;
try {
  firebaseAuthRoutes = require("./src/auth/firebase-login.route");
} catch (err) {
  firebaseAuthRoutes = null;
}

// --- ✅ FLEXIBLE CORS SETUP (supports env + safe defaults) ---
const DEFAULT_ALLOWED = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "https://readerschoice.vercel.app",
  "https://readerschoice-frontend.vercel.app", // replace with your actual Vercel domain if different
  "https://readerschoice-ip2w.onrender.com"   // backend or other domain if needed
];

// Read extra allowed origins from .env (comma separated)
const envAllowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

// merge unique list
const ALLOWED = Array.from(new Set([...DEFAULT_ALLOWED, ...envAllowed]));

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (curl, Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    if (ALLOWED.includes(origin)) return callback(null, true);

    console.warn("❌ Blocked CORS request from:", origin);
    return callback(new Error("Not allowed by CORS"), false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
  ],
};

// allow preflight on all routes
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));


// --- Serve uploaded images publicly ---
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// --- Routes ---
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

if (firebaseAuthRoutes) {
  app.use("/api/auth", firebaseAuthRoutes);
  console.log("Mounted /api/auth/firebase-login route");
} else {
  console.log("firebase-login.route not found — skipping mount.");
}

app.use("/api/admin", adminRoutes);
app.use("/api/testimonials", testimonialRoutes);
console.log("Mounted /api/testimonials route");

// --- DEV ONLY: quick dev-login route (remove for production) ---
try {
  const jwt = require("jsonwebtoken");
  const User = require("./src/users/user.model");

  app.post("/api/auth/dev-login", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) return res.status(400).json({ message: "userId required" });
      const user = await User.findById(userId);
      if (!user) return res.status(404).json({ message: "User not found" });
      const token = jwt.sign(
        { id: user._id.toString(), role: user.role || "user" },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "7d" }
      );
      return res.json({ token, user });
    } catch (err) {
      console.error("dev-login error", err);
      return res.status(500).json({ message: "dev-login failed" });
    }
  });

  console.log("Mounted /api/auth/dev-login (DEV ONLY)");
} catch (err) {
  console.warn("Could not mount dev-login route:", err.message || err);
}

// --- Root Route ---
app.get("/", (req, res) => res.send("Book Store Server is running!"));

// --- Start server and connect DB ---
async function main() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected");

    app.listen(port, () => {
      console.log(`🚀 Server listening on port ${port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

main();
