// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 5000;

// ---------------------- ROUTES ----------------------
const bookRoutes = require("./src/books/book.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");
const testimonialRoutes = require("./src/testimonials/testimonial.route");

// Firebase auth optional
let firebaseAuthRoutes;
try {
  firebaseAuthRoutes = require("./src/auth/firebase-login.route");
} catch {
  firebaseAuthRoutes = null;
}

// ---------------------- FINAL CORS CONFIG ----------------------
/**
 * Your frontend origins:
 *  - Production: https://readerschoice.vercel.app
 *  - Local dev: http://localhost:5173 etc.
 */
const ALLOWED_ORIGINS = [
  "https://readerschoice.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// Allow adding more through environment variable
const extra = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const FINAL_ALLOWED = Array.from(new Set([...ALLOWED_ORIGINS, ...extra]));

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // server-to-server
    if (FINAL_ALLOWED.includes(origin)) return callback(null, true);

    console.warn("❌ Blocked CORS:", origin);
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

// Preflight for ALL routes
app.options("*", cors(corsOptions));

// Apply CORS globally
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// ---------------------- STATIC FILES ----------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ---------------------- ROUTES ----------------------
app.use("/api/books", bookRoutes);
app.use("/api/auth", userRoutes);

if (firebaseAuthRoutes) {
  app.use("/api/auth", firebaseAuthRoutes);
  console.log("Mounted /api/auth/firebase-login");
}

app.use("/api/admin", adminRoutes);
app.use("/api/testimonials", testimonialRoutes);

// ---------------------- DEV LOGIN ROUTE ----------------------
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
      res.status(500).json({ message: "dev-login failed" });
    }
  });

  console.log("Mounted /api/auth/dev-login (DEV ONLY)");
} catch {
  console.log("⚠️ dev-login route skipped");
}

// ---------------------- HEALTH ROUTE ----------------------
app.get("/", (req, res) => {
  res.send("Book Store Server is running!");
});

// ---------------------- START SERVER ----------------------
async function main() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("✅ MongoDB connected");

    app.listen(port, () =>
      console.log(`🚀 Server running at port ${port}`)
    );
  } catch (err) {
    console.error("❌ Server failed to start:", err);
    process.exit(1);
  }
}

main();
