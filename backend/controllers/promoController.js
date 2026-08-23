const PromoCode = require('../models/PromoCode');

// POST /api/promo/validate — Validate a promo code
exports.validatePromo = async (req, res) => {
  try {
    const { code, totalPrice } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Promo code is required' });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });

    if (!promo) {
      return res.status(404).json({ message: 'Invalid promo code' });
    }

    // Check expiry
    if (new Date() > new Date(promo.expiryDate)) {
      return res.status(400).json({ message: 'This promo code has expired' });
    }

    // Check usage limit
    if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
      return res.status(400).json({ message: 'This promo code has reached its usage limit' });
    }

    // Check minimum purchase
    if (totalPrice && totalPrice < promo.minPurchase) {
      return res.status(400).json({ 
        message: `Minimum purchase of $${promo.minPurchase} required for this promo code` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (promo.discountType === 'percentage') {
      discountAmount = totalPrice ? Math.round((totalPrice * promo.discountValue / 100) * 100) / 100 : 0;
    } else {
      discountAmount = promo.discountValue;
    }

    // Don't let discount exceed total
    if (totalPrice && discountAmount > totalPrice) {
      discountAmount = totalPrice;
    }

    res.json({
      valid: true,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount,
      message: `Promo code applied! You save $${discountAmount.toFixed(2)}`
    });
  } catch (error) {
    console.error('Validate promo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/promo — Create a promo code (admin)
exports.createPromo = async (req, res) => {
  try {
    const { code, discountType, discountValue, expiryDate, usageLimit, minPurchase } = req.body;

    const existingPromo = await PromoCode.findOne({ code: code.toUpperCase() });
    if (existingPromo) {
      return res.status(400).json({ message: 'A promo code with this code already exists' });
    }

    const promo = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      expiryDate,
      usageLimit: usageLimit || null,
      minPurchase: minPurchase || 0
    });

    res.status(201).json(promo);
  } catch (error) {
    console.error('Create promo error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/promo — List all promo codes (admin)
exports.getPromos = async (req, res) => {
  try {
    const promos = await PromoCode.find().sort({ createdAt: -1 });
    res.json(promos);
  } catch (error) {
    console.error('Get promos error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/promo/:id — Deactivate a promo code (admin)
exports.deletePromo = async (req, res) => {
  try {
    const promo = await PromoCode.findById(req.params.id);
    if (!promo) {
      return res.status(404).json({ message: 'Promo code not found' });
    }

    promo.isActive = false;
    await promo.save();

    res.json({ message: 'Promo code deactivated successfully' });
  } catch (error) {
    console.error('Delete promo error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
