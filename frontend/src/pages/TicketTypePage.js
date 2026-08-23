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
  const areaLabel = state.areaLabel || 'Selected Area';
  const baseTotal = Number(state.totalPrice || 0);
  const selectedSeatCount = seats.length || Number(state.selectedSeatCount) || 0;

  const [counts, setCounts] = useState(() => createEmptyTicketTypeCounts(selectedSeatCount || 1));

  const summary = useMemo(
    () => buildTicketTypeSummary(counts, baseTotal, selectedSeatCount || 1),
    [counts, baseTotal, selectedSeatCount]
  );

  const totalSelected = summary.items.reduce((sum, item) => sum + item.quantity, 0);
  const canProceed = selectedSeatCount > 0 && totalSelected === selectedSeatCount;

  const updateCount = (key, delta) => {
    setCounts((current) => {
      const next = { ...current };
      const currentTotal = Object.values(current).reduce((sum, value) => sum + value, 0);
      const currentValue = Number(current[key] || 0);
      const nextValue = Math.max(0, currentValue + delta);

      if (delta > 0 && currentTotal >= selectedSeatCount) {
        return current;
      }

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
        ticketTypes: summary.items,
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
    <div className="ticket-type-page">
      <div className="ticket-type-shell">
        <button className="ticket-type-back" onClick={() => navigate(-1)}>
          <FaArrowLeft />
          <span>Back</span>
        </button>

        <div className="ticket-type-card">
          <div className="ticket-type-hero">
            <div>
              <span className="ticket-type-kicker">Select ticket type</span>
              <h1>Choose your mix</h1>
              <p>Assign adult and child tickets before continuing to concessions and payment.</p>
            </div>

            <div className="ticket-type-info-pill">
              <span className="pill-label">Now selecting</span>
              <strong>{selectedSeatCount} ticket{selectedSeatCount === 1 ? '' : 's'}</strong>
              <span className="pill-sub">Area: {areaLabel}</span>
            </div>
          </div>

          <div className="ticket-type-content">
            <div className="ticket-type-list">
              {TICKET_TYPE_OPTIONS.map((option) => {
                const quantity = counts[option.key] || 0;
                const currentItem = summary.items.find((item) => item.key === option.key);

                return (
                  <article className="ticket-type-option" key={option.key}>
                    <div className="ticket-type-option__meta">
                      <span className="ticket-type-badge">{option.accent}</span>
                      <h2>{option.label}</h2>
                      <p>{option.description}</p>
                      <div className="ticket-type-price">
                        Rs. {currentItem ? currentItem.unitPrice.toFixed(2) : '0.00'}
                        <span>per ticket</span>
                      </div>
                    </div>

                    <div className="ticket-type-stepper">
                      <button type="button" onClick={() => updateCount(option.key, -1)} disabled={quantity === 0}>-</button>
                      <div className="ticket-type-count">{quantity}</div>
                      <button type="button" onClick={() => updateCount(option.key, 1)} disabled={totalSelected >= selectedSeatCount}>+</button>
                    </div>
                  </article>
                );
              })}
            </div>

            <aside className="ticket-type-summary">
              <div className="summary-heading">
                <span>Booking summary</span>
                <strong>{totalSelected}/{selectedSeatCount}</strong>
              </div>

              <div className="summary-list">
                {summary.items.map((item) => (
                  <div className="summary-row" key={item.key}>
                    <span>{item.label}</span>
                    <strong>{item.quantity} x Rs. {item.unitPrice.toFixed(2)}</strong>
                  </div>
                ))}
              </div>

              <div className="summary-total">
                <span>Ticket total</span>
                <strong>Rs. {summary.total.toFixed(2)}</strong>
              </div>

              <button className="ticket-type-proceed" onClick={handleProceed} disabled={!canProceed}>
                Proceed to booking
              </button>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketTypePage;