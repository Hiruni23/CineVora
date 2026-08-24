import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './ReviewList.css';

const StarDisplay = ({ rating }) => (
  <span className="rl-stars">
    {[1,2,3,4,5].map(s => (
      <span key={s} className={`rl-star${s <= rating ? ' rl-star--on' : ''}`}>★</span>
    ))}
  </span>
);

const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);
  const isLong = review.comment && review.comment.length > 180;
  const initial = review.userId?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="rl-card">
      <div className="rl-card-head">
        <div className="rl-avatar">{initial}</div>
        <div className="rl-meta">
          <div className="rl-meta-top">
            <span className="rl-name">{review.userId?.name || 'Anonymous'}</span>
            <span className="rl-verified">✓ Verified</span>
          </div>
          <span className="rl-date">
            {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'short', day: 'numeric',
            })}
          </span>
        </div>
        <div className="rl-rating-col">
          <StarDisplay rating={review.rating} />
        </div>
      </div>

      {review.comment && (
        <div className="rl-comment-wrap">
          <p className={`rl-comment${!expanded && isLong ? ' rl-comment--clamped' : ''}`}>
            {review.comment}
          </p>
          {isLong && (
            <button className="rl-toggle" onClick={() => setExpanded(!expanded)}>
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const ReviewList = ({ movieId, refreshTrigger }) => {
  const [reviews, setReviews]     = useState([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading]     = useState(true);
  const [sort, setSort]           = useState('newest');

  const fetchReviews = async (pageNum = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get(`/reviews/movie/${movieId}?page=${pageNum}&limit=5`);
      setReviews(data.reviews);
      setTotal(data.total);
      setPage(data.page);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    fetchReviews(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movieId, refreshTrigger]);

  const sorted = [...reviews].sort((a, b) => {
    if (sort === 'highest') return b.rating - a.rating;
    if (sort === 'lowest')  return a.rating - b.rating;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const avg = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading && reviews.length === 0) {
    return <div className="rl-loading">Loading reviews…</div>;
  }

  return (
    <div className="rl-root">

      {/* ── Summary row ── */}
      <div className="rl-summary">
        <span className="rl-avg">{avg}</span>
        <StarDisplay rating={Math.round(Number(avg))} />
        <span className="rl-count">{total} {total === 1 ? 'review' : 'reviews'}</span>

        {reviews.length > 0 && (
          <select
            className="rl-sort"
            value={sort}
            onChange={e => setSort(e.target.value)}
          >
            <option value="newest">Most Recent</option>
            <option value="highest">Highest Rated</option>
            <option value="lowest">Lowest Rated</option>
          </select>
        )}
      </div>

      {/* ── Cards ── */}
      {sorted.length === 0 ? (
        <p className="rl-empty">No reviews yet. Be the first to share your thoughts!</p>
      ) : (
        <div className="rl-cards">
          {sorted.map(r => <ReviewCard key={r._id} review={r} />)}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="rl-pagination">
          <button className="rl-page-btn" onClick={() => fetchReviews(page - 1)} disabled={page <= 1}>← Prev</button>
          <span className="rl-page-info">Page {page} of {totalPages}</span>
          <button className="rl-page-btn" onClick={() => fetchReviews(page + 1)} disabled={page >= totalPages}>Next →</button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
