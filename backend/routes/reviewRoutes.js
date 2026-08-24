const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const reviewController = require('../controllers/reviewController');

// POST   /api/reviews          — Create a review (auth required)
router.post('/', protect, reviewController.createReview);

// GET    /api/reviews/movie/:movieId  — Get reviews for a movie (public)
router.get('/movie/:movieId', reviewController.getMovieReviews);

// GET    /api/reviews/check/:movieId  — Check if user can review (auth required)
router.get('/check/:movieId', protect, reviewController.canReview);

// DELETE /api/reviews/:id       — Delete a review (auth required)
router.delete('/:id', protect, reviewController.deleteReview);

module.exports = router;
