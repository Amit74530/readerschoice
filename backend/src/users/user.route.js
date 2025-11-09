const express = require('express');
const User = require('./user.model'); // Correct path
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET_KEY;

// --- User Registration Route ---
// POST /api/auth/register
router.post("/register", async (req, res) => {
    const { email, password, username } = req.body;

    try {
        // 1. Check if user already exists
        // NOTE: Your model has `username` as unique, not email.
        // We'll check for both.
        let userByUsername = await User.findOne({ username });
        if (userByUsername) {
            return res.status(400).json({ message: "Username is already taken." });
        }
        
        // Per your model, `email` is NOT a field, so we can't check it.
        // We also can't save it. This is why your old User route was failing.

        // 2. Create the new user
        // We send the plain password, and the `pre('save')` hook in your model will hash it.
        const user = new User({
            username: username,
            password: password, // Send plain password
            role: 'user'
        });

        // 4. Save to database
        await user.save(); // The pre-save hook will run here

        // 5. Create and send token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" } // 1 day
        );

        return res.status(201).json({
            message: "User registered successfully!",
            token: token,
            user: {
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Failed to register user", error);
        res.status(500).send({ message: "Failed to register user" });
    }
});

// --- User Login Route ---
// POST /api/auth/login
router.post("/login", async (req, res) => {
    // We login with username, not email, because email is not in your model
    const { username, password } = req.body;
    try {
        // 1. Check if user exists
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).send({ message: "Invalid credentials." });
        }

        // 2. Check password (using bcrypt.compare)
        // This will compare the plain `password` from the user with the
        // hashed `user.password` from the database.
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send({ message: "Invalid credentials." });
        }

        // 3. Create and send token
        const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: "1d" } // 1 day
        );

        return res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Failed to login user", error);
        res.status(500).send({ message: "Failed to login user" });
    }
});


// --- Admin Login Route (NOW FIXED) ---
// POST /api/auth/admin
router.post("/admin", async (req, res) => {
    const { username, password } = req.body;
    try {
        let admin = await User.findOne({ username });

        // --- "FIRST-TIME ADMIN" LOGIC (NOW CORRECT) ---
        if (!admin && username === 'admin') {
            console.log("Admin user not found, creating one...");
            
            // NO email field (it's not in your schema)
            // NO manual hashing (your model does it automatically)
            admin = new User({
                username: 'admin',
                password: password, // Send the plain password
                role: 'admin'
            });
            
            await admin.save(); // The pre-save hook will hash the password
            console.log("New admin user created!");
            
            // We re-fetch the user to ensure we have the hashed password
            // (though we don't need it for the compare logic)
            // The logic will now fall through to the password check.
        }
        // --- End of First-Time Logic ---

        // 1. Check if user exists (after potential creation)
        if (!admin) {
            return res.status(404).send({ message: "Admin not found!" });
        }

        // 2. Check if user is an admin
        if (admin.role !== 'admin') {
            return res.status(403).send({ message: "You are not an admin!" });
        }

        // 3. Check password
        // This will compare the plain `password` from the user with the
        // hashed `admin.password` from the database.
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            // This is the error you were getting.
            return res.status(401).send({ message: "Invalid password!" });
        }

        // 4. Create and send token
        const token = jwt.sign(
            { id: admin._id, username: admin.username, role: admin.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.status(200).json({
            message: "Authentication successful",
            token: token,
            user: {
                username: admin.username,
                role: admin.role
            }
        });

    } catch (error) {
        console.error("Failed to login as admin", error);
        res.status(500).send({ message: "Failed to login as admin" });
    }
});

module.exports = router;