const Review = require('../models/Review');
const Movie = require('../models/movie');
const Booking = require('../models/Booking');

// Helper: recalculate and update movie's average rating
const updateMovieRating = async (movieId) => {
  const result = await Review.aggregate([
    { $match: { movieId: movieId } },
    { $group: { _id: '$movieId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);

  if (result.length > 0) {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: Math.round(result[0].avgRating * 10) / 10,
      reviewCount: result[0].count
    });
  } else {
    await Movie.findByIdAndUpdate(movieId, {
      averageRating: 0,
      reviewCount: 0
    });
  }
};

// POST /api/reviews — Create a review
exports.createReview = async (req, res) => {
  try {
    const { movieId, rating, comment } = req.body;
    const userId = req.userId;

    // 1. Verify the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ message: 'Movie not found' });
    }

    // 2. Verify the user has a confirmed booking for this movie
    const hasBooking = await Booking.findOne({
      userId,
      status: 'Confirmed'
    }).populate({
      path: 'showtimeId',
      match: { movie: movieId }
    });

    // Check if the populated showtime matches the movie
    const validBooking = hasBooking && hasBooking.showtimeId && 
      String(hasBooking.showtimeId.movie) === String(movieId);

    if (!validBooking) {
      return res.status(403).json({ 
        message: 'You can only review movies you have booked' 
      });
    }

    // 3. Check for existing review (compound unique index also prevents this)
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }

    // 4. Create the review
    const review = await Review.create({ userId, movieId, rating, comment });

    // 5. Update movie's cached average rating
    await updateMovieRating(movie._id);

    // 6. Populate user info for response
    const populated = await Review.findById(review._id).populate('userId', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Create review error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already reviewed this movie' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/reviews/movie/:movieId — Get reviews for a movie
exports.getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ movieId })
        .populate('userId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ movieId })
    ]);

    res.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/reviews/:id — Delete a review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Only the review author or an admin can delete
    if (String(review.userId) !== req.userId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this review' });
    }

    const movieId = review.movieId;
    await Review.findByIdAndDelete(req.params.id);

    // Recalculate movie rating
    await updateMovieRating(movieId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/reviews/check/:movieId — Check if current user can review a movie
exports.canReview = async (req, res) => {
  try {
    const userId = req.userId;
    const { movieId } = req.params;

    // Check if user already reviewed
    const existingReview = await Review.findOne({ userId, movieId });
    if (existingReview) {
      return res.json({ canReview: false, reason: 'already_reviewed', review: existingReview });
    }

    // Check if user has a confirmed booking for this movie
    const bookings = await Booking.find({ userId, status: 'Confirmed' })
      .populate({ path: 'showtimeId', match: { movie: movieId } });

    const hasValidBooking = bookings.some(b => b.showtimeId && String(b.showtimeId.movie) === String(movieId));

    if (!hasValidBooking) {
      return res.json({ canReview: false, reason: 'no_booking' });
    }

    return res.json({ canReview: true });
  } catch (error) {
    console.error('Can review check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
