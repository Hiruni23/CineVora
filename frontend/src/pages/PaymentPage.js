import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; 
import axios from 'axios';
import { calculateSplitBreakdown } from '../utils/splitPayment';
import './Payment.css';

const PaymentPage = () => {
    const navigate = useNavigate();
    const location = useLocation(); 
    
    // Get data passed from previous page
    const { 
        showtimeId, 
        selectedSeats, // This might be objects OR just strings like ["J1", "J2"]
        totalPrice, 
        movieTitle,
        ticketTypes = [],
        concessions = [],
        concessionsTotal = 0,
        ticketSubtotal = totalPrice || 0
    } = location.state || {}; 

    const displayPrice = totalPrice || 0;
    const displayTitle = movieTitle || "Movie Ticket";
    const seatLabels = Array.isArray(selectedSeats)
        ? selectedSeats.map((seat) => (typeof seat === 'string' ? seat : `${seat.row}${seat.number}`))
        : [];
    const splitSummary = calculateSplitBreakdown(displayPrice, seatLabels.length || 1, seatLabels);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // We use this state to ensure we always have Real Objects with IDs
    const [finalSeats, setFinalSeats] = useState([]);

    const [cardDetails, setCardDetails] = useState({
        cardName: '', cardNumber: '', expiry: '', cvv: '', upiId: '', bank: '', wallet: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('Credit Card');

    // 1. SAFETY CHECK & AUTO-FIX SEAT IDs
    useEffect(() => {
        if (!showtimeId || !selectedSeats) {
             setError("Missing booking details. Please go back.");
             return;
        }

        const fixSeatIds = async () => {
            // Check if selectedSeats are just Strings (like "J1") instead of Objects
            const isStringArray = selectedSeats.length > 0 && typeof selectedSeats[0] === 'string';

            if (isStringArray) {
                console.log("Detected Seat Names (J1). Fetching real IDs...");
                try {
                    // Fetch all seats for this showtime to find the matching IDs
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/seats/${showtimeId}`);
                    const allSeats = res.data;

                    // Match "J1" to the real seat object from DB
                    const realSeatObjects = selectedSeats.map(seatName => {
                        // Split "J1" into Row "J" and Number "1"
                        const match = seatName.match(/([A-Z]+)(\d+)/); 
                        if (!match) return null;
                        
                        const [, row, num] = match;
                        return allSeats.find(s => s.row === row && String(s.number) === num);
                    }).filter(Boolean); // Remove any nulls

                    setFinalSeats(realSeatObjects);
                    console.log("Fixed Seats with IDs:", realSeatObjects);
                } catch (err) {
                    console.error("Could not fetch seat IDs", err);
                    setError("System error: Could not verify seat IDs.");
                }
            } else {
                // Already objects? Good to go.
                setFinalSeats(selectedSeats);
            }
        };

        fixSeatIds();
    }, [showtimeId, selectedSeats]);

    const handlePayment = async (e) => {
        e.preventDefault();
        
        // Wait if seat data is not ready yet
        if (finalSeats.length === 0) {
            console.log("Waiting for seat data...");
            return;
        }
        
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // --- PAYLOAD CREATION ---
            const payload = {
                showtimeId: showtimeId,
                seats: finalSeats.map(s => s._id), // Send only IDs to satisfy Backend
                amount: displayPrice,
                ticketSubtotal,
                ticketTypes,
                concessions,
                concessionsTotal,
                splitCount: splitSummary.participants,
                splitBreakdown: splitSummary.breakdown,
                splitLabels: seatLabels,
                paymentMethod,
                cardLast4: paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card'
                    ? cardDetails.cardNumber.replace(/\s/g, '').slice(-4)
                    : 'N/A',
                paymentIdentifier: paymentMethod === 'UPI'
                    ? cardDetails.upiId
                    : paymentMethod === 'Wallet'
                        ? cardDetails.wallet
                        : cardDetails.bank
            };

            console.log("Sending Payment Payload:", payload);

            // 1. Process Payment
            const res = await axios.post(`${process.env.REACT_APP_API_URL}/payments`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // --- 2. MARK SEATS AS BOOKED ---
            const seatIdsToBook = finalSeats.map(s => s._id); 
            await axios.post(`${process.env.REACT_APP_API_URL}/seats/book-seats`, {
                seatIds: seatIdsToBook
            });
            console.log("Seats successfully marked as booked.");
            
            // --- SUCCESS: Navigate Immediately (No Alert) ---
            navigate('/booking-success', { 
                state: { bookingRef: res.data.payment._id } 
            });
            
        } catch (err) {
            console.error("Payment Failed:", err);
            // We keep the error alert so the user knows if something failed
            if (err.response) {
                console.error("Server Response:", err.response.data);
                alert(`Payment Failed: ${err.response.data.message || err.response.data.error || 'Server Error'}`);
            } else {
                alert('Payment Failed. Check console for details.');
            }
            setLoading(false);
        }
    };

    if (loading) return <div className="payment-container"><h2 style={{color:'white'}}>Processing Payment...</h2></div>;

    return (
        <div className="payment-container">
            <div className="payment-card">
                <div className="payment-header">
                    <h2>Secure Checkout</h2>
                    {error && <div className="error-msg" style={{color: 'red'}}>{error}</div>}
                    <p style={{color: '#9ca3af'}}>For: {displayTitle}</p>
                </div>

                <div className="amount-box">
                    <span className="label">Total Payable</span>
                    <span className="value">Rs. {displayPrice}</span>
                </div>
                
                <div style={{color: '#9ca3af', marginBottom: '15px', fontSize: '0.9rem'}}>
                    {/* Display logic handles both Strings and Objects safely */}
                    Seats: {selectedSeats ? (typeof selectedSeats[0] === 'string' ? selectedSeats.join(', ') : selectedSeats.map(s=>s.number).join(', ')) : ''}
                </div>

                {concessions.length > 0 && (
                    <div style={{color: '#9ca3af', marginBottom: '15px', fontSize: '0.9rem'}}>
                        Concessions: {concessions.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                )}

                {ticketTypes.length > 0 && (
                    <div style={{color: '#9ca3af', marginBottom: '15px', fontSize: '0.9rem'}}>
                        Ticket Types: {ticketTypes.map(item => `${item.quantity}x ${item.label}`).join(', ')}
                    </div>
                )}

                <div style={{
                    marginTop: '18px',
                    marginBottom: '18px',
                    padding: '16px',
                    borderRadius: '14px',
                    background: 'rgba(13, 27, 45, 0.8)',
                    border: '1px solid rgba(255,255,255,0.08)'
                }}>
                    <div style={{color: '#fff', fontWeight: 700, marginBottom: '10px'}}>Split payment</div>
                    <div style={{color: '#9ca3af', fontSize: '0.9rem', marginBottom: '12px'}}>
                        Split across {splitSummary.participants} seat{splitSummary.participants > 1 ? 's' : ''}. Rounding is handled automatically.
                    </div>
                    <div style={{display: 'grid', gap: '8px'}}>
                        {splitSummary.breakdown.map((item, index) => (
                            <div key={`${item.label}-${index}`} style={{display: 'flex', justifyContent: 'space-between', gap: '12px', color: '#e5e7eb'}}>
                                <span>{item.label}</span>
                                <span>Rs. {item.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <form onSubmit={handlePayment}>
                    <div className="form-group payment-method-group">
                        <label>Payment Method</label>
                        <div className="payment-methods">
                            {['Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet'].map((method) => (
                                <label className={`payment-method ${paymentMethod === method ? 'selected' : ''}`} key={method}>
                                    <input
                                        type="radio"
                                        name="paymentMethod"
                                        value={method}
                                        checked={paymentMethod === method}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>{method}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {(paymentMethod === 'Credit Card' || paymentMethod === 'Debit Card') && (
                        <>
                            <div className="form-group">
                                <label>Cardholder Name</label>
                                <input type="text" required className="form-input" placeholder="Name"
                                    value={cardDetails.cardName}
                                    onChange={e => setCardDetails({...cardDetails, cardName: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Card Number</label>
                                <input type="text" required inputMode="numeric" maxLength="19" className="form-input" placeholder="0000 0000 0000 0000"
                                    value={cardDetails.cardNumber}
                                    onChange={e => setCardDetails({...cardDetails, cardNumber: e.target.value.replace(/[^\d\s]/g, '')})} />
                            </div>
                            <div className="row">
                                <div className="col form-group">
                                    <label>Expiry</label>
                                    <input type="text" required pattern="(0[1-9]|1[0-2])\/([0-9]{2})" placeholder="MM/YY" className="form-input"
                                        value={cardDetails.expiry}
                                        onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})} />
                                </div>
                                <div className="col form-group">
                                    <label>CVV</label>
                                    <input type="password" required inputMode="numeric" pattern="[0-9]{3}" maxLength="3" placeholder="123" className="form-input"
                                        value={cardDetails.cvv}
                                        onChange={e => setCardDetails({...cardDetails, cvv: e.target.value.replace(/\D/g, '')})} />
                                </div>
                            </div>
                        </>
                    )}

                    {paymentMethod === 'UPI' && (
                        <div className="form-group">
                            <label>UPI ID</label>
                            <input type="text" required pattern="[^\s@]+@[^\s@]+" className="form-input" placeholder="yourname@upi"
                                value={cardDetails.upiId}
                                onChange={e => setCardDetails({...cardDetails, upiId: e.target.value})} />
                        </div>
                    )}

                    {paymentMethod === 'Net Banking' && (
                        <div className="form-group">
                            <label>Select Bank</label>
                            <select required className="form-input" value={cardDetails.bank}
                                onChange={e => setCardDetails({...cardDetails, bank: e.target.value})}>
                                <option value="">Choose your bank</option>
                                <option value="Commercial Bank">Commercial Bank</option>
                                <option value="Sampath Bank">Sampath Bank</option>
                                <option value="BOC">Bank of Ceylon</option>
                                <option value="People's Bank">People's Bank</option>
                            </select>
                        </div>
                    )}

                    {paymentMethod === 'Wallet' && (
                        <div className="form-group">
                            <label>Wallet</label>
                            <select required className="form-input" value={cardDetails.wallet}
                                onChange={e => setCardDetails({...cardDetails, wallet: e.target.value})}>
                                <option value="">Choose a wallet</option>
                                <option value="Dialog Genie">Dialog Genie</option>
                                <option value="FriMi">FriMi</option>
                                <option value="eZ Cash">eZ Cash</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="pay-btn" disabled={loading || error}>
                        {loading ? 'PROCESSING...' : 'PAY NOW'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;