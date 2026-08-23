import React from "react";
import { useNavigate } from "react-router-dom";
import "./MovieCard.css";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const genreText = Array.isArray(movie.genre) ? movie.genre.join(", ") : movie.genre;
  const displayRating = movie.averageRating > 0 ? movie.averageRating.toFixed(1) : (movie.rating || 'N/A');

  return (
    <div className="movie-card">
      <div className="poster-wrapper">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="movie-poster"
        />

        {/* Rating badge */}
        <div className="rating-badge">
          <span className="rating-star">★</span>
          <span className="rating-value">{displayRating}</span>
        </div>

        <div className="movie-overlay">
          <button
            className="btn primary"
            onClick={() => navigate(`/movies/${movie._id}`)}
          >
            View Details
          </button>

          <button
            className="btn secondary"
            onClick={() => navigate(`/buy-tickets/${movie._id}`)}
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="movie-info">
        <h4 className="movie-title">{movie.title}</h4>
        <span className="movie-meta">{genreText} • {movie.duration} mins</span>
      </div>
    </div>
  );
};

export default MovieCard;
