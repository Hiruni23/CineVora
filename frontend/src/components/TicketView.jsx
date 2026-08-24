import React, { useState, useEffect } from 'react';
import API from '../services/api';
import './TicketView.css';

const TicketView = ({ bookingId, bookingData, onClose }) => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(!bookingData);
  const [error, setError] = useState('');

  useEffect(() => {
    // If full booking object was passed directly, format and display instantly!
    if (bookingData) {
      const refCode = bookingData.bookingReference || String(bookingData._id).slice(-8).toUpperCase();
      
      // Fallback seats extraction
      let seats = bookingData.seatDetails || [];
      if ((!seats || seats.length === 0) && bookingData.seatIds && bookingData.seatIds.length > 0) {
        seats = bookingData.seatIds.map(s => {
          if (typeof s === 'object' && s.row) return { row: s.row, number: s.number };
          const str = String(s);
          return { row: str.charAt(0) || '', number: str.slice(1) || str };
        });
      }

      const movieTitle = bookingData.showtimeId?.movie?.title || bookingData.movieTitle || 'Cinema Movie';
      const hallName = bookingData.showtimeId?.hall?.name || 'Main Cinema Hall';
      const seatListStr = seats.map(s => `${s.row}${s.number}`).join(', ') || 'N/A';
      const showDateStr = bookingData.showtimeId?.date 
        ? new Date(bookingData.showtimeId.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
        : 'N/A';
      const startTimeStr = bookingData.showtimeId?.startTime || 'TBD';
      const priceStr = Number(bookingData.totalPrice || 0).toLocaleString();
      const concessions = Array.isArray(bookingData.concessions) ? bookingData.concessions : [];
      const ticketTypes = Array.isArray(bookingData.ticketTypes) ? bookingData.ticketTypes : [];
      const splitBreakdown = Array.isArray(bookingData.splitBreakdown) ? bookingData.splitBreakdown : [];

      // Formatted receipt payload that displays directly in ANY phone QR scanner app!
      const qrTextPayload = 
`🎬 CINEBOOK E-TICKET RECEIPT
----------------------------------
Ticket Ref : #${refCode}
Movie      : ${movieTitle}
Date       : ${showDateStr}
Time       : ${startTimeStr}
Hall       : ${hallName}
Seat(s)    : ${seatListStr}
Paid       : Rs. ${priceStr}
Status     : VERIFIED & CONFIRMED
----------------------------------
Pass Link  : ${window.location.origin}/verify-ticket/${refCode}`;

      const qrUrl = bookingData.qrCode && bookingData.qrCode.startsWith('data:image') 
        ? bookingData.qrCode 
        : `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=10&data=${encodeURIComponent(qrTextPayload)}`;

      setTicket({
        bookingId: bookingData._id,
        bookingReference: refCode,
        customerName: bookingData.userId?.name || 'Valued Guest',
        customerEmail: bookingData.userId?.email || '',
        movie: movieTitle,
        posterUrl: bookingData.showtimeId?.movie?.posterUrl || bookingData.posterUrl || '',
        duration: bookingData.showtimeId?.movie?.duration || 120,
        genre: bookingData.showtimeId?.movie?.genre || [],
        hall: hallName,
        date: bookingData.showtimeId?.date || bookingData.createdAt,
        startTime: startTimeStr,
        seats: seats,
        totalPrice: bookingData.totalPrice || 0,
        discountAmount: bookingData.discountAmount || 0,
        promoCode: bookingData.promoCode || null,
        concessions,
        ticketTypes,
        concessionsTotal: bookingData.concessionsTotal || 0,
        splitBreakdown,
        splitCount: bookingData.splitCount || splitBreakdown.length || 1,
        status: bookingData.status || 'Confirmed',
        bookedAt: bookingData.createdAt,
        qrCode: qrUrl
      });
      setLoading(false);
      return;
    }

    // Otherwise, fetch from server API
    const fetchTicket = async () => {
      try {
        setLoading(true);
        setError('');
        
        let res;
        try {
          res = await API.get(`/tickets/${bookingId}`);
        } catch (err1) {
          try {
            res = await API.get(`/bookings/${bookingId}/ticket`);
          } catch (err2) {
            try {
              res = await API.get(`/bookings/ticket/${bookingId}`);
            } catch (err3) {
              throw err1;
            }
          }
        }
        setTicket(res.data);
      } catch (err) {
        console.error("Ticket fetch error:", err);
        const serverMsg = err.response?.data?.message || err.response?.data?.error || err.message;
        setError(serverMsg || 'Failed to load ticket receipt');
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchTicket();
    }
  }, [bookingId, bookingData]);

  if (loading) {
    return (
      <div className="ticket-overlay" onClick={onClose}>
        <div className="ticket-loading" onClick={e => e.stopPropagation()}>
          Loading Digital E-Ticket...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ticket-overlay" onClick={onClose}>
        <div className="ticket-error-card" onClick={e => e.stopPropagation()}>
          <h3 style={{ color: 'var(--danger, #e74c3c)', marginTop: 0 }}>Ticket Notice</h3>
          <p>{error}</p>
          <button onClick={onClose} className="ticket-close-btn">Close</button>
        </div>
      </div>
    );
  }

  if (!ticket) return null;

  // Format seat list safely
  const seatList = Array.isArray(ticket.seats) && ticket.seats.length > 0
    ? ticket.seats.map(s => typeof s === 'object' && s.row ? `${s.row}${s.number}` : String(s)).join(', ')
    : 'N/A';

  // Format date safely
  const showDate = ticket.date 
    ? new Date(ticket.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  // Format genre safely
  const genreText = Array.isArray(ticket.genre) 
    ? ticket.genre.join(', ') 
    : (ticket.genre || 'Cinema');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="ticket-overlay" onClick={onClose}>
      <div className="ticket-card" onClick={e => e.stopPropagation()} id="e-ticket-view">
        
        {/* Ticket Top Header */}
        <div className="ticket-header">
          <div className="ticket-brand">
            <span className="brand-icon">🎬</span>
            <span className="brand-text">CINEBOOK VIP PASS</span>
          </div>
          <button className="ticket-x-btn" onClick={onClose} title="Close Ticket">✕</button>
        </div>

        {/* Movie Info Section */}
        <div className="ticket-movie-section">
          {ticket.posterUrl && (
            <div className="ticket-poster-wrap">
              <img src={ticket.posterUrl} alt={ticket.movie} className="ticket-poster" />
            </div>
          )}
          <div className="ticket-movie-info">
            <span className="ticket-badge">✓ {ticket.status || 'CONFIRMED'}</span>
            <h2 className="ticket-movie-title">{ticket.movie}</h2>
            <p className="ticket-genre">{genreText}</p>
            {ticket.duration > 0 && (
              <p className="ticket-duration">⏱️ {ticket.duration} mins</p>
            )}
          </div>
        </div>

        {/* Authentic Stub Tear Notches & Cutout */}
        <div className="ticket-tear-wrapper">
          <div className="ticket-notch-left"></div>
          <div className="ticket-tear"></div>
          <div className="ticket-notch-right"></div>
        </div>

        {/* Booking Details Grid */}
        <div className="ticket-details-grid">
          <div className="ticket-detail">
            <span className="detail-label">DATE</span>
            <span className="detail-value">{showDate}</span>
          </div>
          <div className="ticket-detail">
            <span className="detail-label">SHOWTIME</span>
            <span className="detail-value">{ticket.startTime || 'N/A'}</span>
          </div>
          <div className="ticket-detail">
            <span className="detail-label">CINEMA HALL</span>
            <span className="detail-value">{ticket.hall}</span>
          </div>
          <div className="ticket-detail">
            <span className="detail-label">RESERVED SEATS</span>
            <span className="detail-value" style={{ color: '#D4AF37' }}>{seatList}</span>
          </div>
        </div>

        {/* Price & Savings */}
        <div className="ticket-pricing-box">
          <div className="ticket-price-row">
            <span>Total Paid</span>
            <span className="ticket-price">Rs. {Number(ticket.totalPrice || 0).toLocaleString()}</span>
          </div>
          {ticket.concessionsTotal > 0 && (
            <div className="ticket-price-row">
              <span>Concessions</span>
              <span className="ticket-price">Rs. {Number(ticket.concessionsTotal).toLocaleString()}</span>
            </div>
          )}
          {ticket.discountAmount > 0 && (
            <div className="ticket-discount-row">
              <span>Promo Savings ({ticket.promoCode || 'PROMO'})</span>
              <span className="ticket-saved">-Rs. {Number(ticket.discountAmount).toLocaleString()}</span>
            </div>
          )}
        </div>

        {ticket.concessions && ticket.concessions.length > 0 && (
          <div className="ticket-pricing-box" style={{ marginTop: '16px' }}>
            <div className="ticket-price-row" style={{ marginBottom: '8px' }}>
              <span>Items</span>
            </div>
            {ticket.concessions.map((item) => (
              <div className="ticket-price-row" key={item.item}>
                <span>{item.quantity}x {item.name}</span>
                <span className="ticket-price">Rs. {Number(item.totalPrice).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {ticket.ticketTypes && ticket.ticketTypes.length > 0 && (
          <div className="ticket-pricing-box" style={{ marginTop: '16px' }}>
            <div className="ticket-price-row" style={{ marginBottom: '8px' }}>
              <span>Ticket Types</span>
            </div>
            {ticket.ticketTypes.map((item) => (
              <div className="ticket-price-row" key={item.key}>
                <span>{item.quantity}x {item.label}</span>
                <span className="ticket-price">Rs. {Number(item.totalPrice || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}

        {ticket.splitBreakdown && ticket.splitBreakdown.length > 0 && (
          <div className="ticket-pricing-box" style={{ marginTop: '16px' }}>
            <div className="ticket-price-row" style={{ marginBottom: '8px' }}>
              <span>Split Payment</span>
            </div>
            {ticket.splitBreakdown.map((item, index) => (
              <div className="ticket-price-row" key={`${item.label}-${index}`}>
                <span>{item.label}</span>
                <span className="ticket-price">Rs. {Number(item.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        )}

        {/* Scannable Authentic QR Code Section */}
        <div className="ticket-qr-section">
          <div className="ticket-qr-wrapper">
            <img src={ticket.qrCode} alt="Scannable Verification QR Code" className="ticket-qr" />
          </div>
          <p className="ticket-scan-hint">SCAN WITH CAMERA OR SCANNER APP</p>
          <div className="ticket-ref-box">
            Ref: #{ticket.bookingReference}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="ticket-footer-actions">
          <button className="ticket-action-btn print" onClick={handlePrint}>
            🖨️ PRINT / SAVE PASS
          </button>
          <button className="ticket-action-btn close" onClick={onClose}>
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

export default TicketView;
