const QRCode = require('qrcode');
const crypto = require('crypto');

const SECRET = process.env.JWT_SECRET || 'secretkey123';

/**
 * Generate a signed QR code payload for a booking
 * @param {string} bookingId - The booking's MongoDB _id
 * @param {string} bookingReference - The human-readable booking reference
 * @returns {Promise<{qrImage: string, payload: string}>} Base64 PNG image and the raw payload
 */
exports.generateTicketQR = async (bookingId, bookingReference) => {
  const payload = JSON.stringify({
    id: bookingId,
    ref: bookingReference,
    ts: Date.now()
  });

  // Sign the payload so it can't be forged
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(payload)
    .digest('hex');

  const signedPayload = JSON.stringify({ data: payload, sig: signature });

  // Generate QR code as base64 PNG
  const qrImage = await QRCode.toDataURL(signedPayload, {
    width: 300,
    margin: 2,
    color: {
      dark: '#0D0D0DFF',
      light: '#FFFFFFFF'
    }
  });

  return { qrImage, payload: signedPayload };
};

/**
 * Verify a QR code payload's signature
 * @param {string} signedPayload - The full signed payload string from the QR code
 * @returns {{valid: boolean, data: object|null}}
 */
exports.verifyTicketQR = (signedPayload) => {
  try {
    const { data, sig } = JSON.parse(signedPayload);
    
    const expectedSig = crypto
      .createHmac('sha256', SECRET)
      .update(data)
      .digest('hex');

    if (sig !== expectedSig) {
      return { valid: false, data: null };
    }

    return { valid: true, data: JSON.parse(data) };
  } catch (error) {
    return { valid: false, data: null };
  }
};
