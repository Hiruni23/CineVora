const mongoose = require('mongoose');

const showtimeSchema = new mongoose.Schema({
  movie: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie', 
    required: true
  },
  hall: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hall', 
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String, 
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  // --- THIS WAS MISSING ---
  // We need this array to store seats like ["A1", "A2"]
  bookedSeats: {
    type: [String], // Array of Seat Numbers
    default: []     // Starts empty
  }
}, { timestamps: true });

// Index for date-based queries
showtimeSchema.index({ date: 1 });
showtimeSchema.index({ movie: 1, date: 1 });

module.exports = mongoose.model('Showtime', showtimeSchema);