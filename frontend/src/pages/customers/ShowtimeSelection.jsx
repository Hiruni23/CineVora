import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovieById } from "../../services/movieService";
import { getShowtimesByMovie } from "../../services/showtimeService";
import { getHalls } from "../../services/hallService";
import { FaArrowLeft, FaStar, FaFilm, FaTv } from "react-icons/fa";
import { MdAccessTime } from "react-icons/md";
import "./ShowtimeSelection.css";

const ShowtimeSelection = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Movie Details
        const movieData = await getMovieById(movieId);
        setMovie(movieData);

        // 2. Fetch Showtimes
        const showtimeData = await getShowtimesByMovie(movieId);
        const allShowtimes = showtimeData.data || [];
        setShowtimes(allShowtimes);

        // 3. Fetch Halls
        const hallData = await getHalls();
        setHalls(hallData.data || []);

        // 4. Set Default Date (prefer today if available, else first future date)
        if (allShowtimes.length > 0) {
          const today = new Date();
          today.setHours(0,0,0,0);
          const dates = [...new Set(allShowtimes.map(st => new Date(st.date).toDateString()))]
            .filter(dateStr => {
              const dateObj = new Date(dateStr);
              dateObj.setHours(0,0,0,0);
              return dateObj >= today;
            });
          dates.sort((a, b) => new Date(a) - new Date(b));
          const todayStr = today.toDateString();
          if (dates.includes(todayStr)) {
            setSelectedDate(todayStr);
          } else if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }
      } catch (error) {
        console.error("Error loading showtime data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="selection-page">
        <div className="selection-loading-wrap">
          <div className="selection-spinner" />
          <p>Loading showtimes &amp; theater availability…</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="selection-page">
        <div className="selection-error-wrap">
          <h2>Movie not found</h2>
          <button className="selection-back-btn" onClick={() => navigate('/movies')}>
            <FaArrowLeft /> Back to Movies
          </button>
        </div>
      </div>
    );
  }

  // Filter dates for today and future only
  const today = new Date();
  today.setHours(0,0,0,0);
  const uniqueDates = [...new Set(showtimes.map(st => new Date(st.date).toDateString()))]
    .filter(dateStr => {
      const dateObj = new Date(dateStr);
      dateObj.setHours(0,0,0,0);
      return dateObj >= today;
    });
  uniqueDates.sort((a, b) => new Date(a) - new Date(b));

  const showtimesForDate = showtimes.filter(
    st => new Date(st.date).toDateString() === selectedDate
  );

  // Group showtimes by hall
  const showtimesByHall = showtimesForDate.reduce((acc, st) => {
    let hallName = "Standard Hall";

    if (st.hall && st.hall.name) {
      hallName = st.hall.name;
    } else if (st.hall) {
      const foundHall = halls.find(h => h._id === st.hall);
      if (foundHall) hallName = foundHall.name;
    }

    if (!acc[hallName]) acc[hallName] = [];
    acc[hallName].push(st);
    return acc;
  }, {});

  const handleTimeClick = (showtimeId) => {
    navigate(`/booking/${showtimeId}`);
  };

  return (
    <div className="selection-page">
      {/* ── Top Navigation Bar (Properly Placed, No Overlap) ── */}
      <div className="selection-top-bar">
        <div className="selection-top-bar-inner">
          <button className="selection-back-btn" onClick={() => navigate('/movies')} aria-label="Back to movies">
            <FaArrowLeft size={11} />
            <span>Back to movies</span>
          </button>
        </div>
      </div>

      {/* ── Movie Showcase Hero Banner ── */}
      <section 
        className="selection-hero-banner"
        style={{ 
          backgroundImage: `radial-gradient(ellipse at center, rgba(7, 17, 31, 0.82) 0%, rgba(7, 17, 31, 0.98) 100%), url(${movie.posterUrl || ''})` 
        }}
      >
        <div className="selection-hero-container">
          <div className="selection-poster-box">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="selection-poster-img" />
            ) : (
              <div className="selection-poster-placeholder"><FaFilm size={32} /></div>
            )}
          </div>

          <div className="selection-hero-meta">
            <span className="selection-kicker">NOW BOOKING SHOWTIMES</span>
            <h1 className="selection-movie-title">{movie.title}</h1>

            <div className="selection-tags-row">
              {movie.rating && (
                <span className="selection-tag selection-tag--rating">
                  <FaStar size={11} /> {movie.rating}
                </span>
              )}
              {movie.duration && (
                <span className="selection-tag">
                  <MdAccessTime size={13} /> {movie.duration} MINS
                </span>
              )}
              {movie.language && (
                <span className="selection-tag">{movie.language}</span>
              )}
            </div>

            {movie.genre && (
              <p className="selection-genres">
                {Array.isArray(movie.genre) ? movie.genre.join(" • ") : movie.genre}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── Date Picker Section (Clean, Clock Removed) ── */}
      <section className="date-picker-section">
        <div className="date-picker-header">
          <span className="date-picker-kicker">PLAN YOUR VISIT</span>
          <h2 className="date-picker-title">Choose a Date &amp; Showtime</h2>
        </div>

        <div className="date-cards-scroll">
          <div className="date-cards-track">
            {uniqueDates.length === 0 ? (
              <div className="date-no-dates">No dates scheduled for this title</div>
            ) : (
              uniqueDates.map((dateStr) => {
                const dateObj = new Date(dateStr);
                const day = dateObj.toLocaleDateString('en-US', { weekday: 'short' }); 
                const dayNum = dateObj.getDate(); 
                const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
                const isActive = selectedDate === dateStr;

                return (
                  <button 
                    key={dateStr} 
                    className={`date-pill-btn ${isActive ? "date-pill-btn--active" : ""}`}
                    onClick={() => setSelectedDate(dateStr)}
                  >
                    <span className="date-pill-month">{month}</span>
                    <span className="date-pill-num">{dayNum}</span>
                    <span className="date-pill-day">{day}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* ── Main Auditoriums & Showtimes List ── */}
      <main className="showtimes-section">
        {Object.keys(showtimesByHall).length === 0 ? (
          <div className="showtimes-empty-box">
            <h3>No showtimes scheduled for this date</h3>
            <p>Please select another date above to view available screenings.</p>
          </div>
        ) : (
          <div className="hall-showtimes-list">
            {Object.keys(showtimesByHall).map((hallName) => (
              <div key={hallName} className="hall-experience-card">
                {/* Left: Hall Branding */}
                <div className="hall-branding-col">
                  <div className="hall-icon-wrap">
                    <FaTv size={16} />
                  </div>
                  <div>
                    <h2 className="hall-name-text">{hallName}</h2>
                    <span className="hall-experience-sub">DIGITAL CINEMA EXPERIENCE</span>
                  </div>
                </div>

                {/* Right: Showtime Buttons */}
                <div className="hall-times-col">
                  <div className="showtime-buttons-grid">
                    {showtimesByHall[hallName].map((st) => {
                      const showDate = new Date(st.date);
                      if (st.startTime) {
                        const [time, modifier] = st.startTime.split(' ');
                        if (time) {
                          let [hours, minutes] = time.split(':');
                          hours = parseInt(hours, 10);
                          minutes = parseInt(minutes || 0, 10);
                          if (modifier === 'PM' && hours !== 12) hours += 12;
                          if (modifier === 'AM' && hours === 12) hours = 0;
                          showDate.setHours(hours, minutes, 0, 0);
                        }
                      }
                      const now = new Date();
                      const isPast = showDate < now;

                      return (
                        <button
                          key={st._id}
                          className={`showtime-slot-btn ${isPast ? 'showtime-slot-btn--past' : ''}`}
                          onClick={() => handleTimeClick(st._id)}
                          disabled={isPast}
                          title={isPast ? "This showtime has passed" : `Select ${st.startTime}`}
                        >
                          <span className="slot-time-text">{st.startTime}</span>
                          <span className="slot-price-text">Rs. {st.price}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ShowtimeSelection;