import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { TICKET_TYPE_OPTIONS, createEmptyTicketTypeCounts, buildTicketTypeSummary } from '../utils/ticketTypes';
import './TicketTypePage.css';

const TicketTypePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const state = location.state || {};
  const showtimeId = state.showtimeId || params.showtimeId;
  const seats = Array.isArray(state.seats) ? state.seats : [];
  const movieTitle = state.movieTitle || 'Selected Movie';
  const areaLabel = state.areaLabel || 'Standard Auditorium';
  const baseTotal = Number(state.totalPrice || 0);
  const selectedSeatCount = seats.length || Number(state.selectedSeatCount) || 1;

  const [counts, setCounts] = useState(() => createEmptyTicketTypeCounts(selectedSeatCount || 1));

  const summary = useMemo(
    () => buildTicketTypeSummary(counts, baseTotal, selectedSeatCount || 1),
    [counts, baseTotal, selectedSeatCount]
  );

  const totalAssigned = summary.items.reduce((sum, item) => sum + item.quantity, 0);
  const remaining = selectedSeatCount - totalAssigned;
  const canProceed = selectedSeatCount > 0 && totalAssigned === selectedSeatCount;

  const updateCount = (key, delta) => {
    setCounts((current) => {
      const next = { ...current };
      const currentTotal = Object.values(current).reduce((sum, value) => sum + value, 0);
      const currentValue = Number(current[key] || 0);
      const nextValue = Math.max(0, currentValue + delta);
      if (delta > 0 && currentTotal >= selectedSeatCount) return current;
      next[key] = nextValue;
      return next;
    });
  };

  const handleProceed = () => {
    if (!canProceed) return;
    navigate('/create-booking', {
      state: {
        ...state,
        showtimeId,
        ticketTypes: summary.items.filter(item => item.quantity > 0),
        ticketTypeTotal: summary.total,
        ticketTypeBasePerSeat: summary.basePerSeat,
        totalPrice: summary.total,
        selectedSeatCount,
        areaLabel,
        movieTitle
      }
    });
  };

  return (
    <div className="ttp-page">
      <div className="ttp-shell">

        {/* Back Button */}
        <button className="ttp-back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft size={12} />
          <span>Back to Seats</span>
        </button>

        {/* Page Header */}
        <div className="ttp-header">
          <div>
            <p className="ttp-step-label">Step 2 of 3 — Ticket Categories</p>
            <h1 className="ttp-title">Select Ticket Types</h1>
            <p className="ttp-subtitle">
              {selectedSeatCount} {selectedSeatCount === 1 ? 'seat' : 'seats'} selected in <strong>{areaLabel}</strong>
            </p>
          </div>
          <div className={`ttp-assign-badge ${canProceed ? 'ttp-assign-badge--done' : ''}`}>
            <span className="ttp-assign-nums">{totalAssigned} / {selectedSeatCount}</span>
            <span className="ttp-assign-label">
              {canProceed ? 'All assigned ✓' : `${remaining} remaining`}
            </span>
          </div>
        </div>

        {/* Main Content */}
        <div className="ttp-content">

          {/* Ticket Type List */}
          <div className="ttp-list">
            {TICKET_TYPE_OPTIONS.map((option) => {
              const quantity = counts[option.key] || 0;
              const currentItem = summary.items.find((item) => item.key === option.key);
              const unitPrice = currentItem ? currentItem.unitPrice : 0;

              return (
                <div
                  key={option.key}
                  className={`ttp-row ${quantity > 0 ? 'ttp-row--selected' : ''}`}
                >
                  <div className="ttp-row-info">
                    <div className="ttp-row-name-line">
                      <span className="ttp-row-name">{option.label}</span>
                      {option.tag && <span className="ttp-row-discount">{option.tag}</span>}
                    </div>
                    <p className="ttp-row-desc">{option.description}</p>
                    <span className="ttp-row-price">Rs. {unitPrice.toFixed(2)} / ticket</span>
                  </div>

                  <div className="ttp-stepper">
                    <button
                      className="ttp-stepper-btn"
                      onClick={() => updateCount(option.key, -1)}
                      disabled={quantity === 0}
                      aria-label="Decrease"
                    >−</button>
                    <span className="ttp-stepper-count">{quantity}</span>
                    <button
                      className="ttp-stepper-btn"
                      onClick={() => updateCount(option.key, 1)}
                      disabled={totalAssigned >= selectedSeatCount}
                      aria-label="Increase"
                    >+</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className="ttp-summary">
            <div className="ttp-summary-header">
              <span className="ttp-summary-title">Order Summary</span>
              <span className="ttp-summary-seats">{totalAssigned} of {selectedSeatCount} seats</span>
            </div>

            <div className="ttp-summary-movie">
              <span className="ttp-summary-movie-name">{movieTitle}</span>
              <span className="ttp-summary-hall">{areaLabel}</span>
            </div>

            <div className="ttp-summary-items">
              {summary.items.filter(i => i.quantity > 0).length === 0 ? (
                <p className="ttp-summary-empty">Assign tickets to see pricing</p>
              ) : (
                summary.items.filter(i => i.quantity > 0).map((item) => (
                  <div className="ttp-summary-row" key={item.key}>
                    <span>{item.quantity}× {item.label}</span>
                    <span>Rs. {item.totalPrice.toFixed(2)}</span>
                  </div>
                ))
              )}
            </div>

            <div className="ttp-summary-total">
              <span>Total</span>
              <strong>Rs. {summary.total.toFixed(2)}</strong>
            </div>

            <button
              className="ttp-proceed-btn"
              onClick={handleProceed}
              disabled={!canProceed}
            >
              {canProceed
                ? 'Proceed to Payment →'
                : `Assign ${remaining} more ${remaining === 1 ? 'ticket' : 'tickets'}`}
            </button>
          </aside>
        </div>

      </div>
    </div>
  );
};

export default TicketTypePage;