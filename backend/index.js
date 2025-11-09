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

// --- ✅ FIXED CORS SETUP ---
const allowedOrigins = [
  "https://readerschoice.vercel.app",
  "http://localhost:5174",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);

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

// ✅ Apply CORS before all routes
app.use(cors(corsOptions));
app.use(express.json());

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
