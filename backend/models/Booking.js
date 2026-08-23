const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  // Reference to User collection
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  }, 

  //  LINK TO SHOWTIME COLLECTION
  showtimeId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Showtime',
      required: true 
  }, 

  //  LINK TO SEAT COLLECTION
  seatIds: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Seat',
      required: true 
  }], 

  //  Store seat details for historical record
  seatDetails: [{
    row: String,
    number: Number,
    price: Number,
    seatId: mongoose.Schema.Types.ObjectId
  }],
  
  totalPrice: { type: Number, required: true },
  
  // --- ENHANCED: Status with enum + cancellation tracking ---
  status: { 
    type: String, 
    enum: ['Confirmed', 'Cancelled', 'Refunded'],
    default: 'Confirmed' 
  }, 
  cancelledAt: { type: Date },
  
  // Track if user has hidden this from their view (soft delete)
  hiddenFromUser: { type: Boolean, default: false },
  
  // Unique code for the user
  bookingReference: { 
    type: String, 
    unique: true, 
    default: () => Math.random().toString(36).substring(2, 10).toUpperCase() 
  },

  // --- NEW: Promo code support ---
  promoCode: { type: String },
  discountAmount: { type: Number, default: 0 },

  // --- NEW: Concession add-ons tied to this booking ---
  ticketSubtotal: { type: Number, default: 0 },
  concessions: [{
    item: String,
    name: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],
  concessionsTotal: { type: Number, default: 0 },

  ticketTypes: [{
    key: String,
    label: String,
    description: String,
    quantity: Number,
    unitPrice: Number,
    totalPrice: Number
  }],

  // --- NEW: Split payment tracking for group bookings ---
  splitCount: { type: Number, default: 1 },
  splitBreakdown: [{
    label: String,
    amount: Number
  }],
  splitRemainderCents: { type: Number, default: 0 },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);