// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET_KEY;

// helper to extract a stable id from various token shapes
function extractUserIdFromDecoded(decoded) {
  if (!decoded) return null;
  // common places where id may live
  const candidate = decoded.id || decoded._id || decoded.userId || decoded.sub || decoded;
  // if candidate is an object with toString, return its string form
  if (typeof candidate === 'object' && candidate?.toString) return candidate.toString();
  return String(candidate);
}

// verifyToken: any authenticated user
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication token is required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // debug: uncomment when needed
    // console.log('verifyToken decoded:', decoded);

    // normalize req.user to always be { id: "<userId>" }
    const id = extractUserIdFromDecoded(decoded);
    req.user = { id };
    
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// verifyAdmin: only admin users
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access Denied. No token provided' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid credentials' });

    // debug: uncomment when needed
    // console.log('verifyAdmin decoded:', decoded);

    const isAdmin = decoded?.isAdmin || decoded?.role === 'admin';
    if (!isAdmin) {
      return res.status(403).json({ message: 'Forbidden. Admins only' });
    }

    const id = extractUserIdFromDecoded(decoded);
    req.user = { id };

    next();
  });
};

module.exports = { verifyToken, verifyAdmin };
