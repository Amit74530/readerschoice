// index.js
const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config();

const port = process.env.PORT || 5000;

// ---------- Route imports ----------
const bookRoutes = require("./src/books/book.route");
const userRoutes = require("./src/users/user.route");
const adminRoutes = require("./src/stats/admin.stats");
const testimonialRoutes = require("./src/testimonials/testimonial.route");

// optional firebase-login route
let firebaseAuthRoutes;
try {
  firebaseAuthRoutes = require("./src/auth/firebase-login.route");
} catch (err) {
  firebaseAuthRoutes = null;
}

// ---------- JSON parser ----------
app.use(express.json());

// ---------- CORS configuration ----------
const DEFAULT_ALLOWED = [
  "https://readerschoice.vercel.app",   // production frontend
  // add any specific Vercel preview domains here if needed
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// allow extra origins via environment variable (comma-separated)
const envAllowed = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const FINAL_ALLOWED = Array.from(new Set([...DEFAULT_ALLOWED, ...envAllowed]));

const corsOptions = {
  origin: function (origin, callback) {
    // allow non-browser requests (curl, Postman) that have no origin
    if (!origin) return callback(null, true);
    if (FINAL_ALLOWED.includes(origin)) return callback(null, true);
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

// ---------- Always-respond preflight + minimal CORS headers (fix for Render & proxies) ----------
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && FINAL_ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
  } else if (!origin) {
    // non-browser clients (curl, server-to-server) — allow
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  // Reply to preflight immediately so proxies/frontends get the CORS headers even if route crashes
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Apply standard cors middleware (keeps behavior consistent for actual requests)
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// ---------- Optional debug endpoint (temporary) ----------
app.get("/_cors-test", (req, res) => {
  res.json({ ok: true, originSeen: req.headers.origin || null });
});

// ---------- Serve uploaded images ----------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/*
  ---------- Lightweight health endpoint ----------
  This returns 200 OK immediately and does NOT touch DB or other services.
  Use this in uptime monitors (UptimeRobot / cron-job.org / GitHub Actions)
  to keep your Render instance awake without stressing your backend.
*/
app.get("/health", (req, res) => {
  return res.status(200).send("OK");
});

// ---------- Mount routes ----------
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

// ---------- DEV-only quick-login (remove in production) ----------
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

// ---------- Root route ----------
app.get("/", (req, res) => res.send("Book Store Server is running!"));

// ---------- Error handler (ensures CORS headers on errors) ----------
app.use((err, req, res, next) => {
  console.error("[UNHANDLED ERROR]", err && err.stack ? err.stack : err);
  const origin = req.headers.origin;
  if (origin && FINAL_ALLOWED.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
  } else if (!origin) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.status(500).json({ error: "internal server error" });
});

// ---------- Start server & connect DB ----------
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
