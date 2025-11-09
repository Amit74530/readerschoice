// src/auth/firebase-login.controller.js
const admin = require('firebase-admin');
const User = require('../users/user.model'); // adjust path if needed
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// initialize firebase-admin once
if (!admin.apps.length) {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      }),
    });
  } else {
    try { admin.initializeApp(); } catch (e) { console.warn('Firebase admin init failed:', e.message); }
  }
}

async function firebaseLogin(req, res) {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ message: 'idToken required' });

    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name } = decoded;

    let user = await User.findOne({ firebaseUid: uid }) || await User.findOne({ email });
    if (!user) {
      user = new User({
        username: name || (email ? email.split('@')[0] : `user_${uid.slice(-6)}`),
        email: email || undefined,
        firebaseUid: uid,
        role: 'user'
      });
      await user.save();
    } else if (!user.firebaseUid) {
      user.firebaseUid = uid;
      await user.save();
    }

    const payload = { id: user._id.toString(), role: user.role || 'user', isAdmin: !!user.isAdmin };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('firebase-login error:', err);
    return res.status(500).json({ message: 'Failed to verify Firebase token' });
  }
}

module.exports = { firebaseLogin };
