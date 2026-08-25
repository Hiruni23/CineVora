import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import PromoCodeInput from '../components/PromoCodeInput';
import axios from 'axios';
import { CONCESSION_CATALOG, CONCESSION_CATEGORIES, createEmptyConcessionSelection, buildConcessions, getConcessionsTotal } from '../utils/concessions';
import './Booking.css'; 

const CreateBookingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const bookingData = location.state || {}; 
  const { seats, showtimeId, totalPrice, ticketTypes = [], selectedSeatCount = seats?.length || 0 } = bookingData;

  const [movieDetails, setMovieDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [concessionSelection, setConcessionSelection] = useState(createEmptyConcessionSelection());

  const concessions = buildConcessions(concessionSelection);
  const concessionsTotal = getConcessionsTotal(concessionSelection);
  const ticketSubtotal = Number(totalPrice || 0);
  const finalPrice = Math.max(0, ticketSubtotal - discountAmount) + concessionsTotal;
  const selectedSeatsLabel = seats ? seats.map(s => `${s.row}${s.number}`).join(', ') : 'None';
  const selectedConcessionsLabel = concessions.length > 0
    ? concessions.map((item) => `${item.quantity}x ${item.name}`).join(', ')
    : 'None selected';
  const ticketTypesLabel = Array.isArray(ticketTypes) && ticketTypes.length > 0
    ? ticketTypes.map((item) => `${item.quantity}x ${item.label}`).join(', ')
    : 'ODC Adult';

  const addConcessionRow = (categoryKey, defaultItemKey) => {
    setConcessionSelection((current) => ({
      ...current,
      [categoryKey]: [
        ...(Array.isArray(current[categoryKey]) ? current[categoryKey] : []),
        {
          itemKey: defaultItemKey,
          quantity: 1
        }
      ]
    }));
  };

  const updateConcessionRow = (categoryKey, rowIndex, field, value) => {
    setConcessionSelection((current) => {
      const categoryRows = Array.isArray(current[categoryKey]) ? current[categoryKey] : [];

      return {
        ...current,
        [categoryKey]: categoryRows.map((row, index) => (
          index === rowIndex
            ? {
                ...row,
                [field]: value
              }
            : row
        ))
      };
    });
  };

  const removeConcessionRow = (categoryKey, rowIndex) => {
    setConcessionSelection((current) => {
      const categoryRows = Array.isArray(current[categoryKey]) ? current[categoryKey] : [];

      return {
        ...current,
        [categoryKey]: categoryRows.filter((_, index) => index !== rowIndex)
      };
    });
  };

  useEffect(() => {
    const fetchMovieInfo = async () => {
        if (!showtimeId) return;

        try {
            const showtimeRes = await axios.get(`${process.env.REACT_APP_API_URL}/showtimes/${showtimeId}`);
            const data = showtimeRes.data;
            
            let rawMovie = data.movie || (data.data && data.data.movie) || (data.showtime && data.showtime.movie);

            let movieId = null;

            if (!rawMovie) {
                console.error("Could not find 'movie' field in response");
            } else if (typeof rawMovie === 'object' && rawMovie.title) {
                setMovieDetails(rawMovie);
                return;
            } else if (typeof rawMovie === 'object' && rawMovie._id) {
                movieId = rawMovie._id;
            } else {
                movieId = rawMovie;
            }

            if (movieId) {
                const movieRes = await axios.get(`${process.env.REACT_APP_API_URL}/movies/${movieId}`);
                const mData = movieRes.data;
                
                const movieTitle = mData.title || (mData.movie && mData.movie.title) || (mData.data && mData.data.title);
                
                if (movieTitle) {
                    setMovieDetails({ title: movieTitle });
                } else {
                    setMovieDetails({ title: "Title Not Found" });
                }
            } else {
                setMovieDetails({ title: "Movie ID Missing" });
            }

        } catch (err) {
            console.error("Error fetching movie:", err);
            setMovieDetails({ title: "Network Error" });
        }
    };

    fetchMovieInfo();
  }, [showtimeId]);

  const handlePromoApplied = (code, discount) => {
    setPromoCode(code);
    setDiscountAmount(discount);
  };

  const handlePromoRemoved = () => {
    setPromoCode(null);
    setDiscountAmount(0);
  };

  const updateConcessionQuantity = (categoryKey, rowIndex, delta) => {
    setConcessionSelection((current) => {
      const categoryRows = Array.isArray(current[categoryKey]) ? current[categoryKey] : [];
      const nextRows = categoryRows.map((row, index) => (
        index === rowIndex
          ? {
              ...row,
              quantity: Math.max(0, Number(row.quantity || 0) + delta)
            }
          : row
      ));

      return {
        ...current,
        [categoryKey]: nextRows
      };
    });
  };

  const handleConfirmBooking = async () => {
    if (isProcessing) return;

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Please login to complete booking!");
        navigate('/login');
        return;
    }

    setIsProcessing(true);
    
    try {
        const formattedSeats = seats ? seats.map(s => `${s.row}${s.number}`) : [];

        navigate(`/payment/checkout`, { 
            state: { 
                showtimeId: showtimeId,
                selectedSeats: formattedSeats,
                totalPrice: finalPrice,
                originalPrice: totalPrice,
                ticketSubtotal,
                promoCode: promoCode,
                discountAmount: discountAmount,
                concessions,
                concessionsTotal,
                ticketTypes,
                selectedSeatCount,
                movieTitle: movieDetails?.title || "Movie Ticket"
            } 
        });

    } catch (error) {
        console.error("Navigation Error:", error);
        alert("Something went wrong. Please try again.");
        setIsProcessing(false);
    }
  };

  return (
    <div className="booking-container booking-checkout-shell">
      <button 
        onClick={() => navigate(-1)} 
        className="booking-back-btn"
      >
        <FaArrowLeft />
        <span>Back</span>
      </button>

      <div className="booking-card booking-card--wide booking-checkout-card">
        <div className="booking-hero">
          <div className="booking-hero-copy">
            <span className="booking-eyebrow">Secure checkout</span>
            <h1>Confirm Booking</h1>
            <p>Review your seats, choose a flavor for each concession category, apply a promo code, and complete payment.</p>
          </div>
          <div className="booking-hero-pill">
            <span className="booking-hero-pill-label">Movie</span>
            <strong>{movieDetails ? movieDetails.title : 'Loading...'}</strong>
          </div>
        </div>

        <div className="booking-layout">
          <div className="booking-main-column">
            <section className="booking-section-card">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Booking details</span>
                  <h2>Your Selection</h2>
                </div>
              </div>

              <div className="detail-grid">
                <div className="detail-row detail-row--stacked">
                  <span className="label">Movie Name</span>
                  <span className="value">{movieDetails ? movieDetails.title : 'Loading...'}</span>
                </div>

                <div className="detail-row detail-row--stacked">
                  <span className="label">Selected Seats</span>
                  <span className="value">{selectedSeatsLabel}</span>
                </div>

                <div className="detail-row detail-row--stacked">
                  <span className="label">Ticket Types</span>
                  <span className="value">{ticketTypesLabel}</span>
                </div>
              </div>
            </section>

            <section className="booking-section-card">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Concessions</span>
                  <h2>Snacks &amp; Drinks <span className="concession-optional">(Optional)</span></h2>
                </div>
                <span className="concession-total-badge">
                  Rs. {concessionsTotal.toFixed(2)}
                </span>
              </div>

              <div className="concession-clean-list">
                {CONCESSION_CATEGORIES.map((group) => {
                  const categorySelections = Array.isArray(concessionSelection[group.key]) ? concessionSelection[group.key] : [];

                  return (
                    <div key={group.key} className="concession-category-block">
                      {/* Category Label Row */}
                      <div className="concession-category-label">
                        <span>{group.title}</span>
                        {categorySelections.length > 0 && (
                          <span className="concession-category-count">{categorySelections.length} added</span>
                        )}
                      </div>

                      {/* Item Rows */}
                      {categorySelections.length === 0 && (
                        <p className="concession-empty-hint">None selected</p>
                      )}

                      {categorySelections.map((categorySelection, rowIndex) => {
                        const itemKey = categorySelection.itemKey || group.defaultItemKey;
                        const selectedItem = CONCESSION_CATALOG[itemKey];
                        const qty = categorySelection.quantity || 1;

                        return (
                          <div key={`${group.key}-${rowIndex}`} className="concession-item-row">
                            {/* Flavor Select */}
                            <select
                              className="concession-select"
                              value={itemKey}
                              onChange={(e) => updateConcessionRow(group.key, rowIndex, 'itemKey', e.target.value)}
                            >
                              {group.options.map((optionKey) => (
                                <option key={optionKey} value={optionKey}>
                                  {CONCESSION_CATALOG[optionKey].name}
                                </option>
                              ))}
                            </select>

                            {/* Unit Price */}
                            <span className="concession-unit-price">Rs. {selectedItem.unitPrice}</span>

                            {/* Qty Stepper */}
                            <div className="concession-inline-stepper">
                              <button type="button" onClick={() => updateConcessionQuantity(group.key, rowIndex, -1)} disabled={qty <= 1}>−</button>
                              <span>{qty}</span>
                              <button type="button" onClick={() => updateConcessionQuantity(group.key, rowIndex, 1)}>+</button>
                            </div>

                            {/* Row Total */}
                            <span className="concession-row-total">Rs. {(selectedItem.unitPrice * qty).toFixed(2)}</span>

                            {/* Remove */}
                            <button
                              type="button"
                              className="concession-remove-btn"
                              onClick={() => removeConcessionRow(group.key, rowIndex)}
                              title="Remove"
                            >×</button>
                          </div>
                        );
                      })}

                      {/* Add Row Button */}
                      <button
                        type="button"
                        className="concession-add-row-btn"
                        onClick={() => addConcessionRow(group.key, group.defaultItemKey)}
                      >
                        + Add {group.addLabel || group.title.toLowerCase()}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>

          </div>

          <aside className="booking-sidebar">
            <section className="booking-section-card booking-summary-card">
              <div className="section-header">
                <div>
                  <span className="section-kicker">Order summary</span>
                  <h2>Review before payment</h2>
                </div>
              </div>

              <PromoCodeInput 
                totalPrice={totalPrice || 0}
                onPromoApplied={handlePromoApplied}
                onPromoRemoved={handlePromoRemoved}
              />

              <div className="summary-breakdown">
                <div className="summary-row">
                  <span>Ticket subtotal</span>
                  <strong>Rs. {ticketSubtotal.toFixed(2)}</strong>
                </div>
                {concessionsTotal > 0 && (
                  <div className="summary-row">
                    <span>Concessions</span>
                    <strong>Rs. {concessionsTotal.toFixed(2)}</strong>
                  </div>
                )}
                {discountAmount > 0 && (
                  <div className="summary-row summary-row--discount">
                    <span>Discount</span>
                    <strong>- Rs. {discountAmount.toFixed(2)}</strong>
                  </div>
                )}
                <div className="summary-total">
                  <span>Total Amount</span>
                  <strong>Rs. {finalPrice.toFixed(2)}</strong>
                </div>
              </div>

              <div className="summary-recipient">
                <div>
                  <span className="label">Seats</span>
                  <p>{selectedSeatsLabel}</p>
                </div>
                <div>
                  <span className="label">Concessions</span>
                  <p>{selectedConcessionsLabel}</p>
                </div>
              </div>

              <button 
                onClick={handleConfirmBooking} 
                className="booking-submit-btn"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm & Pay Now'}
              </button>
            </section>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default CreateBookingPage;