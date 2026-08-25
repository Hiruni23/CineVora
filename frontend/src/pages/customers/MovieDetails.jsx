import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import ReviewForm from "../../components/ReviewForm";
import ReviewList from "../../components/ReviewList";
import API from "../../services/api";
import "./MovieDetails.css";

const RATING_LABELS = ["", "Terrible", "Poor", "Okay", "Good", "Excellent"];

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTrailer, setShowTrailer] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [reviewRefresh, setReviewRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  // Check if user can review this movie
  useEffect(() => {
    const checkReviewEligibility = async () => {
      if (!token) return;
      try {
        const { data } = await API.get(`/reviews/check/${id}`);
        setCanReview(data.canReview);
      } catch (err) {
        console.error("Error checking review eligibility:", err);
      }
    };
    checkReviewEligibility();
  }, [id, token, reviewRefresh]);


  const handleReviewSubmitted = useCallback(() => {
    setReviewRefresh((prev) => prev + 1);
    setCanReview(false);
    getMovieById(id).then((data) => setMovie(data)).catch(console.error);
  }, [id]);

  const handleBooking = () => navigate(`/buy-tickets/${movie._id}`);
  const toggleTrailer = () => setShowTrailer((prev) => !prev);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtu.be/")) {
      const vid = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes("youtube.com/watch?v=")) {
      const vid = new URL(url).searchParams.get("v");
      return `https://www.youtube.com/embed/${vid}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="md-loading-screen">
        <div className="md-loading-spinner" />
        <p>Loading movie…</p>
      </div>
    );
  }
  if (!movie) {
    return (
      <div className="md-loading-screen">
        <p className="md-not-found">Movie not found</p>
      </div>
    );
  }

  const genres = Array.isArray(movie.genre) ? movie.genre : (movie.genre ? movie.genre.split(",") : []);
  const displayRating = movie.averageRating > 0 ? movie.averageRating.toFixed(1) : movie.rating;
  const ratingLabel = RATING_LABELS[Math.round(Number(displayRating))] || "";

  return (
    <div className="md-page">
      {/* ── Hero backdrop ── */}
      {movie.posterUrl && (
        <div className="md-backdrop" style={{ backgroundImage: `url(${movie.posterUrl})` }} />
      )}
      <div className="md-backdrop-overlay" />

      {/* ── Hero card ── */}
      <div className="md-hero-wrapper">
        <div className="md-hero-card">
          {/* Poster */}
          <div className="md-poster-col">
            {movie.posterUrl ? (
              <img className="md-poster" src={movie.posterUrl} alt={movie.title} />
            ) : (
              <div className="md-poster-placeholder">🎬</div>
            )}
            {/* Rating badge on poster */}
            <div className="md-poster-rating">
              <span className="md-poster-rating-star">★</span>
              <span className="md-poster-rating-num">{displayRating}</span>
              <span className="md-poster-rating-label">{ratingLabel}</span>
            </div>
          </div>

          {/* Info */}
          <div className="md-info-col">
            <h1 className="md-title">{movie.title}</h1>

            {/* Meta row */}
            <div className="md-meta-row">
              {genres.map((g) => (
                <span key={g} className="md-genre-badge">{g.trim()}</span>
              ))}
              <span className="md-meta-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                {movie.duration} min
              </span>
              {movie.reviewCount > 0 && (
                <span className="md-meta-pill md-meta-pill--gold">
                  ★ {displayRating} · {movie.reviewCount} {movie.reviewCount === 1 ? "review" : "reviews"}
                </span>
              )}
            </div>

            {/* Info grid */}
            <div className="md-info-grid">
              {movie.language && (
                <div className="md-info-item">
                  <span className="md-info-label">Language</span>
                  <span className="md-info-value">{movie.language}</span>
                </div>
              )}
              {movie.releaseYear && (
                <div className="md-info-item">
                  <span className="md-info-label">Year</span>
                  <span className="md-info-value">{movie.releaseYear}</span>
                </div>
              )}
              {movie.director && (
                <div className="md-info-item">
                  <span className="md-info-label">Director</span>
                  <span className="md-info-value">{movie.director}</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="md-description">
              <h2 className="md-section-label">Synopsis</h2>
              <p>{movie.description}</p>
            </div>

            {/* CTA buttons */}
            <div className="md-buttons">
              <button className="md-btn md-btn--primary" onClick={handleBooking}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                Book Now
              </button>
              {movie.trailerUrl && (
                <button className="md-btn md-btn--secondary" onClick={toggleTrailer}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  Watch Trailer
                </button>
              )}
              <button
                className="md-btn md-btn--ghost"
                onClick={() => {
                  setActiveTab("reviews");
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Reviews
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div className="md-tabs-wrapper">
        <div className="md-tabs">
          {[
            { key: "overview", label: "Overview" },
            { key: "reviews", label: `Reviews${movie.reviewCount > 0 ? ` (${movie.reviewCount})` : ""}` },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`md-tab ${activeTab === tab.key ? "md-tab--active" : ""}`}
              onClick={() => {
                setActiveTab(tab.key);
                if (tab.key === "reviews") {
                  document.getElementById("reviews-section")?.scrollIntoView({ behavior: "smooth" });
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Reviews Section ── */}
      <div className="md-reviews-section" id="reviews-section">
        <div className="md-reviews-header">
          <h2 className="md-reviews-title">
            <span className="md-reviews-title-bar" />
            Reviews &amp; Ratings
          </h2>
          {!token && (
            <p className="md-login-hint">
              <a href="/login">Sign in</a> to leave a review
            </p>
          )}
        </div>

        {canReview && token && (
          <ReviewForm movieId={id} onReviewSubmitted={handleReviewSubmitted} />
        )}

        {token && !canReview && (
          <div className="md-review-ineligible">
            <span className="md-review-ineligible-icon">🎟️</span>
            <p>Only verified ticket holders can write a review. Book this movie to share your thoughts!</p>
            <button className="md-btn md-btn--primary md-btn--sm" onClick={handleBooking}>
              Book a Ticket
            </button>
          </div>
        )}

        <ReviewList movieId={id} refreshTrigger={reviewRefresh} />
      </div>

      {/* ── Trailer modal ── */}
      {showTrailer && (
        <div className="md-trailer-modal" onClick={toggleTrailer}>
          <div className="md-trailer-content" onClick={(e) => e.stopPropagation()}>
            <button className="md-close-btn" onClick={toggleTrailer} aria-label="Close trailer">×</button>
            <iframe
              width="100%"
              height="450"
              src={getEmbedUrl(movie.trailerUrl)}
              title={`${movie.title} Trailer`}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default MovieDetails;