const Booking = require('../models/Booking');
const Seat = require('../models/Seat'); 
const Notification = require('../models/Notification');
const PromoCode = require('../models/PromoCode');
const Showtime = require('../models/Showtime');
const { normalizeConcessions, getConcessionsTotal } = require('../utils/concessions');
const { calculateSplitBreakdown } = require('../utils/splitPayment');

// Cancellation cutoff in hours
const CANCEL_CUTOFF_HOURS = 2;

// Get ALL bookings (Admin)
exports.getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',
                populate: [
                    { path: 'movie' },
                    { path: 'hall' }
                ]
            })
            .populate('seatIds')
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (error) {
        console.error("Error fetching all bookings:", error);
        res.status(500).json({ message: "Error fetching bookings" });
    }
};

// CREATE: Confirm a new booking (with optional promo code)
exports.createBooking = async (req, res) => {
    try {
        const { userId, showtimeId, seatIds, totalPrice, ticketSubtotal, promoCode, concessions, ticketTypes } = req.body;

        console.log("------------------------------------------------");
        console.log("ATTEMPTING TO CREATE BOOKING:");
        console.log("   👉 User ID:   ", userId);
        console.log("   👉 Showtime:  ", showtimeId);
        console.log("   👉 Seats:     ", seatIds);
        console.log("   👉 Promo:     ", promoCode || 'none');
        console.log("------------------------------------------------");

        const baseTicketSubtotal = Number(ticketSubtotal || totalPrice || 0);
        const normalizedConcessions = normalizeConcessions(concessions);
        const concessionsTotal = getConcessionsTotal(normalizedConcessions);

        // Validation: Prevent double booking
        const existingBooking = await Booking.findOne({ 
            showtimeId, 
            seatIds: { $in: seatIds },
            status: 'Confirmed' 
        });

        if (existingBooking) {
            console.log("FAILURE: Seats already booked!");
            return res.status(400).json({ message: "One or more seats are already booked!" });
        }

        // Fetch actual seat details to store permanently
        const seats = await Seat.find({ _id: { $in: seatIds } });
        const seatDetails = seats.map(s => ({
            row: s.row,
            number: s.number,
            price: s.price,
            seatId: s._id
        }));

        // --- PROMO CODE LOGIC (server-side validation) ---
        let discountAmount = 0;
        let appliedPromoCode = null;

        if (promoCode) {
            const promo = await PromoCode.findOne({ code: promoCode.toUpperCase(), isActive: true });
            
            if (promo && new Date() <= new Date(promo.expiryDate)) {
                const withinUsageLimit = promo.usageLimit === null || promo.usedCount < promo.usageLimit;
                const meetsMinPurchase = baseTicketSubtotal >= promo.minPurchase;

                if (withinUsageLimit && meetsMinPurchase) {
                    if (promo.discountType === 'percentage') {
                        discountAmount = Math.round((baseTicketSubtotal * promo.discountValue / 100) * 100) / 100;
                    } else {
                        discountAmount = promo.discountValue;
                    }

                    // Don't let discount exceed total
                    if (discountAmount > totalPrice) {
                        discountAmount = totalPrice;
                    }

                    appliedPromoCode = promo.code;
                    promo.usedCount += 1;
                    await promo.save();
                }
            }
        }

        const finalPrice = Math.max(0, baseTicketSubtotal - discountAmount) + concessionsTotal;
        const seatLabels = seatDetails.map((seat) => `${seat.row}${seat.number}`);
        const splitSummary = calculateSplitBreakdown(finalPrice, seatLabels.length || 1, seatLabels);

        const newBooking = new Booking({ 
            userId, 
            showtimeId, 
            seatIds,
            seatDetails,
            ticketSubtotal: baseTicketSubtotal,
            totalPrice: finalPrice,
            promoCode: appliedPromoCode,
            discountAmount,
            concessions: normalizedConcessions,
            ticketTypes: Array.isArray(ticketTypes) ? ticketTypes : [],
            concessionsTotal,
            splitCount: splitSummary.participants,
            splitBreakdown: splitSummary.breakdown,
            splitRemainderCents: splitSummary.remainderCents
        });
        await newBooking.save();

        // Update Seats
        await Seat.updateMany(
            { _id: { $in: seatIds } }, 
            { $set: { status: 'booked' } }
        );

        // Notification Logic
        const discountMsg = discountAmount > 0 ? ` (Saved Rs. ${discountAmount.toFixed(2)} with promo!)` : '';
        const concessionsMsg = concessionsTotal > 0 ? ` (+ Rs. ${concessionsTotal.toFixed(2)} concessions)` : '';
        const message = `Booking Confirmed! Ref: ${newBooking.bookingReference}${discountMsg}${concessionsMsg}`;
        const notification = await Notification.create({
            userId: userId, 
            message: message
        });

        // Send Real-Time Popup
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const strUserId = String(userId);

        if (onlineUsers && onlineUsers.has(strUserId)) {
            const socketId = onlineUsers.get(strUserId);
            io.to(socketId).emit('receive_notification', notification);
            console.log(`🔔 Notification SENT to Socket ${socketId}`);
        }

        console.log("SUCCESS: Booking Created! Final price:", finalPrice);
        res.status(201).json({ 
            message: "Booking successful!", 
            booking: newBooking,
            discountApplied: discountAmount > 0,
            discountAmount
        });
    } catch (error) {
        console.error("SERVER ERROR in Create:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get User History
exports.getUserBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ 
            userId: req.params.userId,
            hiddenFromUser: { $ne: true }
        })
            .populate('userId', 'name email')
            .populate({
                path: 'showtimeId',
                populate: { path: 'movie' }   
            })
            .populate('seatIds')
            .sort({ createdAt: -1 });        

        res.json(bookings);
    } catch (error) {
        console.error("SERVER ERROR in History:", error);
        res.status(500).json({ message: "Error fetching history" });
    }
};

// CANCEL a booking (with 2-hour cutoff)
exports.cancelBooking = async (req, res) => {
    try {
        const bookingToCancel = await Booking.findById(req.params.id)
            .populate({
                path: 'showtimeId',
                populate: { path: 'movie' }
            });
        
        if (!bookingToCancel) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (bookingToCancel.status !== 'Confirmed') {
            return res.status(400).json({ message: "This booking is already cancelled" });
        }

        // --- CUTOFF ENFORCEMENT ---
        if (bookingToCancel.showtimeId) {
            const showtime = bookingToCancel.showtimeId;
            const showtimeDate = new Date(showtime.date);
            
            // Parse startTime (e.g., "14:30") and combine with date
            if (showtime.startTime) {
                const [hours, minutes] = showtime.startTime.split(':').map(Number);
                showtimeDate.setHours(hours, minutes, 0, 0);
            }

            const now = new Date();
            const hoursUntilShow = (showtimeDate - now) / (1000 * 60 * 60);

            if (hoursUntilShow < CANCEL_CUTOFF_HOURS) {
                return res.status(400).json({ 
                    message: `Cannot cancel within ${CANCEL_CUTOFF_HOURS} hours of showtime. The show starts in ${Math.max(0, Math.round(hoursUntilShow * 10) / 10)} hours.`,
                    hoursUntilShow: Math.max(0, Math.round(hoursUntilShow * 10) / 10)
                });
            }
        }

        // Change Booking Status
        bookingToCancel.status = 'Cancelled';
        bookingToCancel.cancelledAt = new Date();
        await bookingToCancel.save();

        // FREE UP THE SEATS
        await Seat.updateMany(
            { _id: { $in: bookingToCancel.seatIds } },
            { $set: { status: 'available' } }
        );

        // Create Notification
        const message = `Booking Cancelled. Ref: ${bookingToCancel.bookingReference}. Your seats have been released.`;
        const notification = new Notification({
            userId: bookingToCancel.userId,
            message: message,
            isRead: false
        });
        await notification.save();

        // Send Real-Time Popup
        const io = req.app.get('io');
        const onlineUsers = req.app.get('onlineUsers');
        const strUserId = String(bookingToCancel.userId);

        if (onlineUsers && onlineUsers.has(strUserId)) {
            const socketId = onlineUsers.get(strUserId);
            io.to(socketId).emit('receive_notification', notification);
        }

        res.json({ message: "Booking cancelled successfully", booking: bookingToCancel });
    } catch (error) {
        console.error("Cancel error:", error);
        res.status(500).json({ message: "Cancel failed", error: error.message });
    }
};

// Clear (hide) cancelled bookings from user view
exports.clearUserHistory = async (req, res) => {
    try {
        const { userId } = req.body; 

        if (!userId) {
            return res.status(400).json({ message: "User ID is required" });
        }

        const result = await Booking.updateMany({ 
            userId, 
            status: 'Cancelled' 
        }, {
            $set: { hiddenFromUser: true }
        });
        
        res.status(200).json({ 
            message: `Cleared ${result.modifiedCount} cancelled booking(s) from your view`,
            hiddenCount: result.modifiedCount
        });
    } catch (error) {
        console.error("Clear History Error:", error);
        res.status(500).json({ message: "Could not clear history" });
    }
};