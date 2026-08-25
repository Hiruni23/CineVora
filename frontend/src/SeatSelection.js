import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTicketAlt, FaTv } from 'react-icons/fa';
import { MdEventSeat, MdAccessTime, MdCalendarToday, MdLocalMovies } from 'react-icons/md';
import { getShowtimeById } from './services/showtimeService';
import { getMovieById } from './services/movieService';
import { getHalls } from './services/hallService';
import './SeatMap.css';

const SeatSelection = () => {
  const params = useParams();
  const navigate = useNavigate();
  const showtimeId = params.showtimeId || params.id;

  const [seats, setSeats] = useState([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState([]);
  const [showtime, setShowtime] = useState(null);
  const [movie, setMovie] = useState(null);
  const [hallName, setHallName] = useState('Standard Auditorium');
  const [loading, setLoading] = useState(true);

  // 1. Fetch Seats and Showtime Info
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch Seats
        const seatRes = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
        setSeats(seatRes.data || []);

        // Fetch Showtime Details
        const stRes = await getShowtimeById(showtimeId);
        const stData = stRes.data || stRes;
        setShowtime(stData);

        // Fetch Movie Details if ID available
        if (stData && stData.movie) {
          const movieId = typeof stData.movie === 'object' ? stData.movie._id : stData.movie;
          try {
            const movieData = await getMovieById(movieId);
            setMovie(movieData);
          } catch (err) {
            console.error("Error fetching movie:", err);
          }
        }

        // Fetch Hall Name
        if (stData && stData.hall) {
          if (typeof stData.hall === 'object' && stData.hall.name) {
            setHallName(stData.hall.name);
          } else {
            try {
              const hallsRes = await getHalls();
              const found = (hallsRes.data || []).find(h => h._id === stData.hall);
              if (found) setHallName(found.name);
            } catch (err) {
              console.error("Error fetching hall:", err);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching seat map data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) {
      fetchData();
    }
  }, [showtimeId]);

  // 2. Seat Click Logic
  const handleSeatClick = (seat) => {
    const isBooked = 
      (seat.status && seat.status.toLowerCase() === 'booked') || 
      seat.isBooked === true || 
      seat.booked === true ||
      seat.status === 'locked';

    if (isBooked) return;

    if (selectedSeatIds.includes(seat._id)) {
      setSelectedSeatIds(selectedSeatIds.filter(id => id !== seat._id));
    } else {
      setSelectedSeatIds([...selectedSeatIds, seat._id]);
    }
  };

  const selectedSeats = seats.filter(seat => selectedSeatIds.includes(seat._id));
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  // 3. Proceed to Ticket Types
  const handleProceed = () => {
    if (selectedSeatIds.length === 0) {
      alert("Please select at least one seat to continue.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please sign in to proceed with your booking.");
      navigate('/login');
      return;
    }

    navigate(`/ticket-types/${showtimeId}`, { 
      state: { 
        seats: selectedSeats, 
        showtimeId: showtimeId, 
        totalPrice: totalPrice,
        selectedSeatCount: selectedSeatIds.length,
        areaLabel: hallName,
        movieTitle: movie?.title || showtime?.movie?.title || 'Selected Movie',
        posterUrl: movie?.posterUrl || ''
      } 
    });
  };

  if (loading) {
    return (
      <div className="seat-booking-page">
        <div className="seat-loading-box">
          <div className="seat-loading-spinner" />
          <p>Loading theater seat map…</p>
        </div>
      </div>
    );
  }

  const rows = [...new Set(seats.map(s => s.row))].sort();
  const seatUnitPrice = seats.length > 0 ? (seats[0].price || showtime?.price || 1000) : 1000;

  return (
    <div className="seat-booking-page">
      {/* ── Top Bar / Movie Meta Banner ── */}
      <header className="seat-header">
        <div className="seat-header-inner">
          <button className="seat-back-btn" onClick={() => navigate(-1)} aria-label="Go Back">
            <FaArrowLeft /> <span>Back</span>
          </button>

          <div className="seat-movie-info">
            <h1 className="seat-movie-title">
              {movie?.title || showtime?.movie?.title || 'Movie Experience'}
            </h1>
            <div className="seat-meta-chips">
              <span className="seat-chip">
                <FaTv size={11} /> {hallName}
              </span>
              {showtime?.date && (
                <span className="seat-chip">
                  <MdCalendarToday size={12} /> {new Date(showtime.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              )}
              {showtime?.startTime && (
                <span className="seat-chip">
                  <MdAccessTime size={12} /> {showtime.startTime}
                </span>
              )}
              <span className="seat-chip seat-chip--gold">
                Rs. {seatUnitPrice} / seat
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Theater Area ── */}
      <main className="seat-main-stage">
        {/* ── Screen with Ambient Projection Glow ── */}
        <div className="cinema-screen-wrap">
          <div className="cinema-screen-arch" />
          <div className="cinema-screen-glow" />
          <div className="cinema-screen-label">
            <MdLocalMovies size={14} /> SCREEN / AUDITORIUM FRONT
          </div>
        </div>

        {/* ── Legend ── */}
        <div className="seat-legend-bar">
          <div className="legend-entry">
            <div className="legend-swatch legend-swatch--available" />
            <span>Standard Seat</span>
          </div>
          <div className="legend-entry">
            <div className="legend-swatch legend-swatch--vip" />
            <span>VIP Recliner</span>
          </div>
          <div className="legend-entry">
            <div className="legend-swatch legend-swatch--selected" />
            <span>Selected</span>
          </div>
          <div className="legend-entry">
            <div className="legend-swatch legend-swatch--booked" />
            <span>Occupied</span>
          </div>
        </div>

        {/* ── Scrollable Seat Map Container ── */}
        <div className="seat-grid-scroller">
          <div className="seat-grid-board">
            {rows.map((row, rIdx) => {
              const isVipRow = rIdx >= Math.max(0, rows.length - 2) && rows.length > 2;
              const rowSeats = seats.filter(s => s.row === row);
              const maxSeatNr = rowSeats.length > 0 ? Math.max(...rowSeats.map(s => s.number)) : 0;
              const renderSlots = Array.from({ length: maxSeatNr }, (_, i) => i + 1);

              return (
                <div key={row} className={`seat-row-line ${isVipRow ? 'seat-row-line--vip' : ''}`}>
                  <span className="row-letter-badge row-letter-badge--left">
                    {row}
                    {isVipRow && <span className="row-vip-badge">VIP</span>}
                  </span>

                  <div className="seat-row-seats">
                    {renderSlots.map(seatNum => {
                      const seat = rowSeats.find(s => s.number === seatNum);
                      if (!seat) {
                        return <div key={`gap-${row}-${seatNum}`} className="seat-node seat-node--gap" />;
                      }

                      const isSelected = selectedSeatIds.includes(seat._id);
                      const isBooked = 
                        (seat.status && seat.status.toLowerCase() === 'booked') || 
                        seat.isBooked === true || 
                        seat.booked === true ||
                        seat.status === 'locked';

                      return (
                        <button
                          key={seat._id}
                          type="button"
                          className={`seat-node ${
                            isBooked 
                              ? 'seat-node--booked' 
                              : isSelected 
                              ? 'seat-node--selected' 
                              : isVipRow
                              ? 'seat-node--vip'
                              : 'seat-node--available'
                          }`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked}
                          title={`${row}${seat.number} (${isVipRow ? 'VIP Recliner' : 'Standard'}) • Rs. ${seat.price || seatUnitPrice}`}
                          aria-label={`Seat ${row}${seat.number}`}
                        >
                          <span className="seat-node-num">{seat.number}</span>
                        </button>
                      );
                    })}
                  </div>

                  <span className="row-letter-badge row-letter-badge--right">
                    {row}
                    {isVipRow && <span className="row-vip-badge">VIP</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Floating Sticky Checkout Bar ── */}
      <footer className="seat-checkout-bar">
        <div className="seat-checkout-inner">
          <div className="seat-summary-left">
            <div className="seat-count-tag">
              <MdEventSeat size={18} />
              <span>
                <strong>{selectedSeatIds.length}</strong> {selectedSeatIds.length === 1 ? 'Seat' : 'Seats'} Selected
              </span>
            </div>

            {selectedSeats.length > 0 && (
              <div className="seat-badges-pills">
                {selectedSeats.map(s => (
                  <span key={s._id} className="seat-badge-pill">
                    {s.row}{s.number}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="seat-summary-right">
            <div className="seat-price-block">
              <span className="seat-price-sub">Total Amount</span>
              <strong className="seat-price-val">Rs. {totalPrice.toFixed(2)}</strong>
            </div>

            <button 
              className="seat-continue-btn"
              onClick={handleProceed}
              disabled={selectedSeatIds.length === 0}
            >
              <FaTicketAlt />
              <span>Select Ticket Types</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default SeatSelection;