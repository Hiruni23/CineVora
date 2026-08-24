const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const promoController = require('../controllers/promoController');

// POST   /api/promo/validate  — Validate a promo code (auth required)
router.post('/validate', protect, promoController.validatePromo);

// POST   /api/promo           — Create a promo code (admin only)
router.post('/', protect, isAdmin, promoController.createPromo);

// GET    /api/promo           — List all promo codes (admin only)
router.get('/', protect, isAdmin, promoController.getPromos);

// DELETE /api/promo/:id       — Deactivate a promo code (admin only)
router.delete('/:id', protect, isAdmin, promoController.deletePromo);

module.exports = router;
