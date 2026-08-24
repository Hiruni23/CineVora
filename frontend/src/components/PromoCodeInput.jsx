import React, { useState } from 'react';
import API from '../services/api';
import './PromoCodeInput.css';

const PromoCodeInput = ({ totalPrice, onPromoApplied, onPromoRemoved }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(null); // { code, discountAmount, discountType, discountValue }
  const [error, setError] = useState('');

  const handleApply = async () => {
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const { data } = await API.post('/promo/validate', { 
        code: code.trim(), 
        totalPrice 
      });
      
      setApplied({
        code: data.code,
        discountAmount: data.discountAmount,
        discountType: data.discountType,
        discountValue: data.discountValue
      });
      
      if (onPromoApplied) {
        onPromoApplied(data.code, data.discountAmount);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid promo code');
      setApplied(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setApplied(null);
    setCode('');
    setError('');
    if (onPromoRemoved) onPromoRemoved();
  };

  return (
    <div className="promo-input-wrapper" id="promo-code-input">
      {!applied ? (
        <>
          <div className="promo-input-row">
            <input
              type="text"
              value={code}
              onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
              placeholder="Enter promo code"
              className="promo-input"
              maxLength={20}
              disabled={loading}
            />
            <button 
              className="promo-apply-btn" 
              onClick={handleApply}
              disabled={loading || !code.trim()}
            >
              {loading ? '...' : 'Apply'}
            </button>
          </div>
          {error && <p className="promo-error">{error}</p>}
        </>
      ) : (
        <div className="promo-applied">
          <div className="promo-applied-info">
            <span className="promo-badge">🎟️ {applied.code}</span>
            <span className="promo-discount">
              {applied.discountType === 'percentage' 
                ? `${applied.discountValue}% off` 
                : `$${applied.discountValue} off`}
              {' '}— You save <strong>${applied.discountAmount.toFixed(2)}</strong>
            </span>
          </div>
          <button className="promo-remove-btn" onClick={handleRemove}>Remove</button>
        </div>
      )}
    </div>
  );
};

export default PromoCodeInput;
