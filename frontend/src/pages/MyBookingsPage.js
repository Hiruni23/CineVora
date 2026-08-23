import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import TicketView from '../components/TicketView';
import './Booking.css';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingTicket, setViewingTicket] = useState(null); // bookingId for TicketView

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user._id || user.id;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!userId) {
            setLoading(false);
            return;
      }
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/bookings/user/${userId}`);
        const data = Array.isArray(res.data) ? res.data : res.data.bookings || [];
        const sortedData = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setHistory(sortedData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [userId]);

  // Check if cancellation is allowed (>2 hours before showtime)
  const canCancel = (booking) => {
    if (booking.status !== 'Confirmed') return false;
    if (!booking.showtimeId) return true; // If no showtime data, allow cancel

    const showtimeDate = new Date(booking.showtimeId.date);
    if (booking.showtimeId.startTime) {
      const [hours, minutes] = booking.showtimeId.startTime.split(':').map(Number);
      showtimeDate.setHours(hours, minutes, 0, 0);
    }

    const hoursUntilShow = (showtimeDate - new Date()) / (1000 * 60 * 60);
    return hoursUntilShow >= 2;
  };

  const getHoursUntilShow = (booking) => {
    if (!booking.showtimeId) return null;
    const showtimeDate = new Date(booking.showtimeId.date);
    if (booking.showtimeId.startTime) {
      const [hours, minutes] = booking.showtimeId.startTime.split(':').map(Number);
      showtimeDate.setHours(hours, minutes, 0, 0);
    }
    return Math.max(0, Math.round(((showtimeDate - new Date()) / (1000 * 60 * 60)) * 10) / 10);
  };

  const handleCancel = async (id) => {
    const booking = history.find(b => b._id === id);
    const hoursLeft = getHoursUntilShow(booking);
    
    const confirmMsg = hoursLeft !== null 
      ? `Cancel this booking? Show starts in ${hoursLeft} hours.`
      : "Are you sure you want to cancel this booking?";

    if(!window.confirm(confirmMsg)) return;
    
    try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/bookings/${id}`);
        setHistory(history.map(b => 
            b._id === id ? { ...b, status: 'Cancelled', cancelledAt: new Date() } : b
        ));
        alert("Booking cancelled successfully.");
    } catch (err) {
        console.error("Cancel failed:", err);
        const errorMsg = err.response?.data?.message || "Could not cancel booking.";
        alert(errorMsg);
    }
  };

  const renderSeats = (booking) => {
    // Prefer seatDetails (permanent record)
    if (booking.seatDetails && booking.seatDetails.length > 0) {
      return booking.seatDetails.map(s => `${s.row}${s.number}`).join(", ");
    }
    // Fallback to populated seatIds
    if (booking.seatIds && booking.seatIds.length > 0) {
      if (typeof booking.seatIds[0] === 'object') {
        return booking.seatIds.map(s => `${s.row}${s.number}`).join(", ");
      }
      return booking.seatIds.join(", ");
    }
    return "None";
  };

  const renderConcessions = (booking) => {
    if (!booking.concessions || booking.concessions.length === 0) {
      return 'None';
    }

    return booking.concessions.map((item) => `${item.quantity}x ${item.name}`).join(', ');
  };

  const renderTicketTypes = (booking) => {
    if (!booking.ticketTypes || booking.ticketTypes.length === 0) {
      return 'ODC Adult';
    }

    return booking.ticketTypes.map((item) => `${item.quantity}x ${item.label}`).join(', ');
  };

  const renderSplitSummary = (booking) => {
    if (!booking.splitBreakdown || booking.splitBreakdown.length === 0) {
      return null;
    }

    return booking.splitBreakdown.map((item) => `${item.label}: Rs. ${Number(item.amount || 0).toFixed(2)}`).join(' | ');
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return 'var(--success, #2ecc71)';
      case 'Cancelled': return 'var(--danger, #e74c3c)';
      case 'Refunded': return 'var(--accent-gold, #d4af37)';
      default: return 'var(--success, #2ecc71)';
    }
  };

  if (loading) return <PageLayout><div style={{padding:'50px', color:'white', textAlign:'center'}}>Loading History...</div></PageLayout>;

  return (
    <PageLayout>
    <div className="history-page-container">
      <div className="history-page-wrapper">
        
        {/* Left Side: Title Box */}
        <div className="history-title-box">
          <h1 className="history-title">MY<br/>BOOKING<br/>HISTORY</h1>
          <p style={{color: '#94a3b8', marginTop: '15px'}}>
            You have {history.filter(b => b.status === 'Confirmed').length} active bookings.
          </p>
          
          <button 
            className="confirm-btn" 
            style={{marginTop: '30px', minWidth: '100%', fontSize: '0.9rem'}} 
            onClick={() => navigate('/')}
          >
            BOOK NEW MOVIE
          </button>
          
          <button 
            className="clear-history-btn" 
            style={{marginTop: '15px'}} 
            onClick={async () => {
              if (window.confirm("Clear cancelled bookings from your history?")) {
                try {
                  await axios.post(`${process.env.REACT_APP_API_URL}/bookings/clear-history`, { 
                    userId: userId
                  });
                  window.location.reload(); 
                } catch (err) {
                  alert(err.response?.data?.message || "Could not clear history");
                }
              }
            }}
          >
            CLEAR HISTORY
          </button>
            
        </div>

        {/* Right Side: Grid of Cards */}
        <div className="history-list">
          {history.length === 0 ? (
             <h3 style={{color:'white'}}>No bookings found.</h3>
          ) : (
             history.map(b => (
                <div key={b._id} className="history-item">
                  <div className="item-info">
                    <h3>REF: {b.bookingReference || `#${b._id.slice(-6).toUpperCase()}`}</h3>
                    
                    <p>
                        <span style={{color:'#94a3b8'}}>Movie:</span> 
                        <span>{b.showtimeId?.movie?.title || "Movie Name Loading..."}</span>
                    </p>

                    <p>
                        <span style={{color:'#94a3b8'}}>Seats:</span> 
                        <span>{renderSeats(b)}</span>
                    </p>

                    <p>
                        <span style={{color:'#94a3b8'}}>Date:</span> 
                        <span>{b.showtimeId ? new Date(b.showtimeId.date).toLocaleDateString() : "Date N/A"}</span>
                    </p>
                    
                    <p>
                        <span style={{color:'#94a3b8'}}>Time:</span> 
                        <span>{b.showtimeId ? b.showtimeId.startTime : "Time N/A"}</span>
                    </p>

                    <p>
                        <span style={{color:'#94a3b8'}}>Paid:</span> 
                        <span style={{color: 'var(--accent-gold)'}}>Rs. {b.totalPrice}</span>
                    </p>

                    <p>
                      <span style={{color:'#94a3b8'}}>Ticket Type:</span>
                      <span>{renderTicketTypes(b)}</span>
                    </p>

                    {b.concessionsTotal > 0 && (
                      <p>
                        <span style={{color:'#94a3b8'}}>Concessions:</span> 
                        <span>{renderConcessions(b)} (Rs. {b.concessionsTotal})</span>
                      </p>
                    )}

                    {b.discountAmount > 0 && (
                      <p>
                        <span style={{color:'#94a3b8'}}>Saved:</span> 
                        <span style={{color: 'var(--success, #2ecc71)'}}>Rs. {b.discountAmount} ({b.promoCode})</span>
                      </p>
                    )}

                    {b.splitBreakdown && b.splitBreakdown.length > 0 && (
                      <p>
                        <span style={{color:'#94a3b8'}}>Split:</span>
                        <span>{renderSplitSummary(b)}</span>
                      </p>
                    )}

                    <p>
                        <span style={{color:'#94a3b8'}}>Status:</span> 
                        <span style={{
                            color: getStatusColor(b.status),
                            fontWeight: 'bold'
                        }}>
                            {b.status || 'Confirmed'}
                        </span>
                    </p>
                  </div>
                  
                  <div className="booking-actions">
                    {b.status === 'Confirmed' && (
                      <>
                        <button 
                          className="view-ticket-btn" 
                          onClick={() => setViewingTicket(b)}
                        >
                          🎟️ VIEW TICKET
                        </button>
                        
                        {canCancel(b) ? (
                          <button className="cancel-btn-outline" onClick={() => handleCancel(b._id)}>
                              CANCEL TICKET
                          </button>
                        ) : (
                          <span className="cancel-disabled-msg">
                            Cannot cancel — Show starts in {getHoursUntilShow(b)}h
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
             ))
          )}
        </div>

      </div>
    </div>

    {/* E-Ticket Modal */}
    {viewingTicket && (
      <TicketView 
        bookingData={viewingTicket}
        bookingId={viewingTicket._id || viewingTicket} 
        onClose={() => setViewingTicket(null)} 
      />
    )}
    </PageLayout>
  );
};

export default MyBookingsPage;