import React from 'react';
import './FilterPanel.css';

const GENRES = [
  'Action', 'Drama', 'Comedy', 'Adventure', 'Sci-Fi',
  'Fantasy', 'Animation', 'Family', 'Musical', 'Thriller',
  'Horror', 'Romance', 'Documentary'
];

const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Korean', 'Japanese', 'Spanish', 'French'];

const FilterPanel = ({ filters, onFilterChange }) => {
  const { genre, language, rating, status } = filters;

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const handleGenreClick = (g) => {
    handleChange('genre', genre === g ? '' : g);
  };

  const clearAll = () => {
    onFilterChange({ genre: '', language: '', rating: '', status: '' });
  };

  const hasActiveFilters = genre || language || rating || status;

  return (
    <div className="filter-panel" id="movie-filter-panel">
      {/* Genre Chips */}
      <div className="filter-row">
        <span className="filter-label">Genre</span>
        <div className="genre-chips">
          {GENRES.map(g => (
            <button
              key={g}
              className={`genre-chip ${genre === g ? 'active' : ''}`}
              onClick={() => handleGenreClick(g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Dropdowns Row */}
      <div className="filter-row filter-dropdowns">
        <div className="filter-group">
          <label className="filter-label" htmlFor="language-filter">Language</label>
          <select
            id="language-filter"
            value={language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="filter-select"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="rating-filter">Min Rating</label>
          <select
            id="rating-filter"
            value={rating}
            onChange={(e) => handleChange('rating', e.target.value)}
            className="filter-select"
          >
            <option value="">All Ratings</option>
            <option value="6">6+ ★</option>
            <option value="7">7+ ★</option>
            <option value="8">8+ ★</option>
            <option value="9">9+ ★</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label" htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All</option>
            <option value="now">Now Showing</option>
            <option value="soon">Coming Soon</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button className="clear-filters-btn" onClick={clearAll}>
            ✕ Clear All
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterPanel;
