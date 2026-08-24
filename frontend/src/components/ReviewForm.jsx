import React, { useState } from 'react';
import API from '../services/api';
import './ReviewForm.css';

const STAR_LABELS = ['', 'Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

const ReviewForm = ({ movieId, onReviewSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const active = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a rating.'); return; }
    setLoading(true);
    setError('');
    try {
      await API.post('/reviews', { movieId, rating, comment });
      setSubmitted(true);
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rf-success">
        <span className="rf-success-check">✓</span>
        <div>
          <p className="rf-success-title">Review published</p>
          <span className="rf-success-stars">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={s <= rating ? 'filled' : ''}>★</span>
            ))}
          </span>
        </div>
      </div>
    );
  }

  return (
    <form className="rf-form" onSubmit={handleSubmit}>
      <div className="rf-row">
        {/* Stars */}
        <div className="rf-stars">
          {[1,2,3,4,5].map(s => (
            <button
              key={s}
              type="button"
              className={`rf-star${s <= active ? ' rf-star--on' : ''}`}
              onClick={() => setRating(s)}
              onMouseEnter={() => setHoverRating(s)}
              onMouseLeave={() => setHoverRating(0)}
              aria-label={`${s} stars`}
            >★</button>
          ))}
        </div>
        {active > 0 && (
          <span className="rf-label">{STAR_LABELS[active]}</span>
        )}
      </div>

      <textarea
        className="rf-textarea"
        value={comment}
        onChange={e => setComment(e.target.value)}
        placeholder="Share your thoughts… (optional)"
        maxLength={500}
        rows={2}
      />
      <div className="rf-footer">
        <span className="rf-count">{comment.length}/500</span>
        {error && <span className="rf-error">{error}</span>}
        <button
          type="submit"
          className="rf-submit"
          disabled={loading || rating === 0}
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>
    </form>
  );
};

export default ReviewForm;
