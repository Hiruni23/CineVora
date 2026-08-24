import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import './VerifyTicketPage.css';

const VerifyTicketPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        setError('');
        
        let res;
        try {
          res = await API.get(`/tickets/${id}`);
        } catch (err1) {
          try {
            res = await API.get(`/bookings/${id}/ticket`);
          } catch (err2) {
            try {
              res = await API.get(`/bookings/ticket/${id}`);
            } catch (err3) {
              throw err1;
            }
          }
        }
        setTicket(res.data);
      } catch (err) {
        console.error("Error loading scanned ticket pass:", err);
        setError(err.response?.data?.message || 'Could not verify ticket or ticket not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTicketData();
    }
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="verify-page-container">
        <div className="verify-card-loading">
          <div className="spinner"></div>
          <h2>Verifying E-Ticket...</h2>
          <p>Loading official digital pass details</p>
        </div>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="verify-page-container">
        <div className="verify-card-error">
          <div className="error-icon">⚠️</div>
          <h2>Verification Notice</h2>
          <p>{error || 'Invalid or Expired Ticket Pass'}</p>
          <button className="verify-home-btn" onClick={() => navigate('/home')}>
            GO TO HOMEPAGE
          </button>
        </div>
      </div>
    );
  }

  const seatList = Array.isArray(ticket.seats) && ticket.seats.length > 0
    ? ticket.seats.map(s => typeof s === 'object' && s.row ? `${s.row}${s.number}` : String(s)).join(', ')
    : 'N/A';

  const showDate = ticket.date 
    ? new Date(ticket.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  const genreText = Array.isArray(ticket.genre) 
    ? ticket.genre.join(', ') 
    : (ticket.genre || 'Cinema');

  return (
    <div className="verify-page-container">
      <div className="verify-card-wrapper" id="printable-e-ticket">
        
        {/* Top Header */}
        <div className="verify-header">
          <div className="verify-brand">
            <span className="brand-logo">🎬</span>
            <div>
              <h3 className="brand-name">CINEBOOK PREMIERE</h3>
              <span className="brand-sub">OFFICIAL DIGITAL E-TICKET</span>
            </div>
          </div>
          <div className="verify-badge-valid">
            ✓ VALID TICKET
          </div>
        </div>

        {/* Hero Section */}
        <div className="verify-movie-hero">
          {ticket.posterUrl && (
            <img src={ticket.posterUrl} alt={ticket.movie} className="verify-poster" />
          )}
          <div className="verify-movie-meta">
            <h1 className="verify-movie-title">{ticket.movie}</h1>
            <p className="verify-genre">{genreText}</p>
            {ticket.duration > 0 && <span className="verify-duration">⏱️ {ticket.duration} Minutes</span>}
            <p className="verify-guest">Guest: <strong>{ticket.customerName || 'Valued Guest'}</strong></p>
          </div>
        </div>

        {/* Ticket Tear Notches */}
        <div className="verify-tear-notch-row">
          <div className="notch-left"></div>
          <div className="tear-line"></div>
          <div className="notch-right"></div>
        </div>

        {/* Show Details Grid */}
        <div className="verify-grid">
          <div className="verify-grid-item">
            <span className="grid-label">DATE</span>
            <span className="grid-val">{showDate}</span>
          </div>
          <div className="verify-grid-item">
            <span className="grid-label">SHOWTIME</span>
            <span className="grid-val">{ticket.startTime || 'N/A'}</span>
          </div>
          <div className="verify-grid-item">
            <span className="grid-label">CINEMA HALL</span>
            <span className="grid-val">{ticket.hall}</span>
          </div>
          <div className="verify-grid-item">
            <span className="grid-label">SEATS</span>
            <span className="grid-val highlight-seat">{seatList}</span>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="verify-finance">
          <div className="finance-row">
            <span>Total Paid</span>
            <span className="finance-price">Rs. {Number(ticket.totalPrice || 0).toLocaleString()}</span>
          </div>
          {ticket.discountAmount > 0 && (
            <div className="finance-row discount">
              <span>Promo Discount Applied</span>
              <span className="finance-saved">-Rs. {Number(ticket.discountAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* QR & Reference Section */}
        <div className="verify-qr-footer">
          {ticket.qrCode && (
            <img src={ticket.qrCode} alt="Ticket QR Code" className="verify-qr-img" />
          )}
          <div className="verify-ref-tag">
            REF: #{ticket.bookingReference}
          </div>
          <p className="verify-security-note">
            🔒 Signed & Authenticated by CineBook Entry System
          </p>
        </div>

        {/* Action Controls */}
        <div className="verify-actions no-print">
          <button className="verify-btn print-btn" onClick={handlePrint}>
            🖨️ SAVE AS PDF / PRINT
          </button>
          <button className="verify-btn home-btn" onClick={() => navigate('/home')}>
            HOME
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyTicketPage;
