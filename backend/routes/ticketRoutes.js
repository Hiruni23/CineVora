const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const ticketController = require('../controllers/ticketController');

// GET  /api/tickets/:id    — Get e-ticket with QR code (Publicly accessible for QR code scanning)
router.get('/:id', ticketController.getTicket);

// POST /api/tickets/verify — Verify a scanned QR code (admin only)
router.post('/verify', protect, isAdmin, ticketController.verifyTicket);

module.exports = router;
