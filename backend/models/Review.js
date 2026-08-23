const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  movieId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Movie',
    required: [true, 'Movie ID is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: [500, 'Comment cannot exceed 500 characters'],
    trim: true
  }
}, {
  timestamps: true
});

// One review per user per movie
reviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });
// Fast lookup by movie
reviewSchema.index({ movieId: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
