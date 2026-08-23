const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const ticketController = require('../controllers/ticketController');
const { protect } = require('../middlewares/authMiddleware');

// Debug Log
console.log("ROUTER RELOADED: PUBLIC TICKET ENDPOINTS ACTIVE!"); 

// ----------------------------------------------------
// NEW: GET ALL BOOKINGS (Admin)
// ----------------------------------------------------
router.get('/all', bookingController.getAllBookings);  

// ----------------------------------------------------                                                                                                            // 1. Clear History (Cheat Code: POST)
// ----------------------------------------------------
router.post('/clear-history', bookingController.clearUserHistory);

// ----------------------------------------------------
// 2. Create Booking
// ----------------------------------------------------
router.post('/', bookingController.createBooking);

// ----------------------------------------------------
// 3. Get User History
// ----------------------------------------------------
router.get('/user/:userId', bookingController.getUserBookings);

// ----------------------------------------------------
// 4. Get E-Ticket (Publicly accessible for QR code scanners)
// ----------------------------------------------------
router.get('/:id/ticket', ticketController.getTicket);
router.get('/ticket/:id', ticketController.getTicket);

// ----------------------------------------------------
// 5. Cancel Single Booking
// ----------------------------------------------------
router.delete('/:id', protect, bookingController.cancelBooking);

module.exports = router;