// backend/routes/stats.route.js
const express = require('express');
const router = express.Router();
const Interest = require('../models/Interest'); // adjust the path if needed

// 📊 GET /api/stats/interest
router.get('/interest', async (req, res) => {
  try {
    const monthlyStats = await Interest.aggregate([
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    res.json(monthlyStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
});

module.exports = router;
