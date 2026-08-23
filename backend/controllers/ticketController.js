const Booking = require('../models/Booking');
const { generateTicketQR, verifyTicketQR } = require('../utils/qrTicket');

// GET /api/tickets/:id — Get e-ticket with QR code (Public for QR scanning)
exports.getTicket = async (req, res) => {
  try {
    const bookingId = req.params.id;
    console.log(`🎟️ [PUBLIC GET TICKET] Query ID/Ref: ${bookingId}`);

    let booking;
    // 1. Try finding by MongoDB _id if 24-char hex string
    if (bookingId && bookingId.match(/^[0-9a-fA-F]{24}$/)) {
      booking = await Booking.findById(bookingId)
        .populate('userId', 'name email')
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movie', select: 'title posterUrl duration genre' },
            { path: 'hall', select: 'name' }
          ]
        });
    }

    // 2. If not found by _id, try finding by bookingReference (e.g. H645JBG6)
    if (!booking && bookingId) {
      booking = await Booking.findOne({ 
        bookingReference: { $regex: new RegExp(`^${bookingId}$`, 'i') } 
      })
        .populate('userId', 'name email')
        .populate({
          path: 'showtimeId',
          populate: [
            { path: 'movie', select: 'title posterUrl duration genre' },
            { path: 'hall', select: 'name' }
          ]
        });
    }

    if (!booking) {
      return res.status(404).json({ message: 'Booking record not found' });
    }

    const statusStr = (booking.status || 'Confirmed').toLowerCase();
    if (statusStr !== 'confirmed') {
      return res.status(400).json({ message: `Ticket is unavailable because booking status is ${booking.status}` });
    }

    // Reference code
    const refCode = booking.bookingReference || String(booking._id).slice(-8).toUpperCase();
    
    // Generate QR code safely
    let qrImage = '';
    try {
      const qrResult = await generateTicketQR(String(booking._id), refCode);
      qrImage = qrResult.qrImage;
    } catch (qrErr) {
      console.error('QR Generation failed:', qrErr);
    }

    // Fallback seat extraction if seatDetails missing
    let seats = booking.seatDetails || [];
    if ((!seats || seats.length === 0) && booking.seatIds && booking.seatIds.length > 0) {
      seats = booking.seatIds.map(s => {
        if (typeof s === 'object' && s.row) return { row: s.row, number: s.number };
        const str = String(s);
        return { row: str.charAt(0) || '', number: str.slice(1) || str };
      });
    }

    const ticket = {
      bookingId: booking._id,
      bookingReference: refCode,
      customerName: booking.userId?.name || 'Valued Customer',
      customerEmail: booking.userId?.email || '',
      movie: booking.showtimeId?.movie?.title || 'Cinema Movie',
      posterUrl: booking.showtimeId?.movie?.posterUrl || '',
      duration: booking.showtimeId?.movie?.duration || 120,
      genre: booking.showtimeId?.movie?.genre || [],
      hall: booking.showtimeId?.hall?.name || 'Main Cinema Hall',
      date: booking.showtimeId?.date || booking.createdAt,
      startTime: booking.showtimeId?.startTime || 'TBD',
      seats: seats,
      totalPrice: booking.totalPrice || 0,
      discountAmount: booking.discountAmount || 0,
      promoCode: booking.promoCode || null,
      status: booking.status || 'Confirmed',
      bookedAt: booking.createdAt,
      qrCode: qrImage
    };

    res.json(ticket);
  } catch (error) {
    console.error('❌ [GET TICKET ERROR]:', error);
    res.status(500).json({ message: 'Server error loading ticket', error: error.message });
  }
};

// POST /api/tickets/verify — Admin verifies a scanned QR code
exports.verifyTicket = async (req, res) => {
  try {
    const { payload } = req.body;

    if (!payload) {
      return res.status(400).json({ message: 'QR payload is required' });
    }

    const { valid, data } = verifyTicketQR(payload);

    if (!valid) {
      return res.status(400).json({ 
        valid: false, 
        message: 'Invalid or tampered ticket' 
      });
    }

    // Look up the booking
    const booking = await Booking.findById(data.id)
      .populate('userId', 'name email')
      .populate({
        path: 'showtimeId',
        populate: [
          { path: 'movie', select: 'title' },
          { path: 'hall', select: 'name' }
        ]
      });

    if (!booking) {
      return res.status(404).json({ 
        valid: false, 
        message: 'Booking not found' 
      });
    }

    if (booking.status !== 'Confirmed') {
      return res.status(400).json({ 
        valid: false, 
        message: `Ticket is ${booking.status.toLowerCase()}`,
        booking: {
          reference: booking.bookingReference,
          status: booking.status
        }
      });
    }

    res.json({
      valid: true,
      message: 'Ticket verified successfully',
      booking: {
        reference: booking.bookingReference,
        customer: booking.userId?.name || 'Customer',
        movie: booking.showtimeId?.movie?.title || 'Movie',
        hall: booking.showtimeId?.hall?.name || 'Hall',
        date: booking.showtimeId?.date,
        time: booking.showtimeId?.startTime,
        seats: (booking.seatDetails || []).map(s => `${s.row}${s.number}`),
        status: booking.status
      }
    });
  } catch (error) {
    console.error('Verify ticket error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
