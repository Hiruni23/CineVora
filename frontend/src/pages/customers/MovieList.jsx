import React, { useState, useEffect, useCallback } from "react";
import MovieCard from "../../components/MovieCard";
import SearchBar from "../../components/SearchBar";
import FilterPanel from "../../components/FilterPanel";
import { getMovies } from "../../services/movieService";
import "./MovieList.css";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    language: '',
    rating: '',
    status: ''
  });

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      if (filters.genre) params.genre = filters.genre;
      if (filters.language) params.language = filters.language;
      if (filters.rating) params.rating = filters.rating;
      if (filters.status) params.status = filters.status;

      const data = await getMovies(params);
      setMovies(data);
    } catch (err) {
      console.error("Error fetching movies:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filters]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const handleFilterChange = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  // Separate by status (only when no status filter is active)
  const showSeparated = !filters.status;
  const nowShowing = showSeparated ? movies.filter(m => m.status === "now") : [];
  const comingSoon = showSeparated ? movies.filter(m => m.status === "soon") : [];

  const resultCount = movies.length;

  return (
    <div className="movies-page">
      {/* Search + Filters */}
      <div className="movies-toolbar">
        <SearchBar onSearch={handleSearch} placeholder="Search movies by title..." />
      </div>

      <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

      {/* Results info */}
      {(searchTerm || filters.genre || filters.language || filters.rating) && (
        <p className="results-count">
          {loading ? 'Searching...' : `${resultCount} movie${resultCount !== 1 ? 's' : ''} found`}
        </p>
      )}

      {loading ? (
        <div className="movies-loading">
          <div className="loading-spinner-movies"></div>
          <p>Loading movies...</p>
        </div>
      ) : showSeparated ? (
        <>
          {nowShowing.length > 0 && (
            <>
              <h2 className="page-title">Now Showing</h2>
              <div className="movie-grid">
                {nowShowing.map(movie => <MovieCard key={movie._id} movie={movie} />)}
              </div>
            </>
          )}

          {comingSoon.length > 0 && (
            <>
              <h2 className="page-title">Coming Soon</h2>
              <div className="movie-grid">
                {comingSoon.map(movie => <MovieCard key={movie._id} movie={movie} />)}
              </div>
            </>
          )}

          {nowShowing.length === 0 && comingSoon.length === 0 && (
            <div className="no-movies-msg">
              <h3>No movies found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </>
      ) : (
        <>
          <h2 className="page-title">
            {filters.status === 'now' ? 'Now Showing' : 'Coming Soon'}
          </h2>
          <div className="movie-grid">
            {movies.length > 0 ? (
              movies.map(movie => <MovieCard key={movie._id} movie={movie} />)
            ) : (
              <div className="no-movies-msg">
                <h3>No movies found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MovieList;