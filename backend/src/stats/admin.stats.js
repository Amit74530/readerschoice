const mongoose = require('mongoose');
const express = require('express');
// const Order = require('../orders/order.model'); // <-- REMOVED
const Book = require('../books/book.model');
const router = express.Router();


// Function to calculate admin stats
router.get("/", async (req, res) => {
    try {
        // --- All Order-related stats have been removed ---

        // 4. Trending books statistics: 
        const trendingBooksCount = await Book.aggregate([
            { $match: { trending: true } },  // Match only trending books
            { $count: "trendingBooksCount" }  // Return the count of trending books
        ]);
        
        // If you want just the count as a number, you can extract it like this:
        const trendingBooks = trendingBooksCount.length > 0 ? trendingBooksCount[0].trendingBooksCount : 0;

        // 5. Total number of books
        const totalBooks = await Book.countDocuments();

        // --- Monthly sales have been removed ---

        // Result summary
        res.status(200).json({  
            totalOrders: 0, // Sending 0 as a placeholder
            totalSales: 0,  // Sending 0 as a placeholder
            trendingBooks,
            totalBooks,
            monthlySales: [], // Sending empty array as a placeholder
         });
      
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ message: "Failed to fetch admin stats" });
    }
})

module.exports = router;