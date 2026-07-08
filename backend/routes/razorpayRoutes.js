const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const {
    createRazorpayOrder,
    verifyPayment
} = require("../controllers/razorpayController");

// Create Razorpay Order
router.post(
    "/create-order",
    authenticateUser,
    createRazorpayOrder
);

// Verify Payment
router.post(
    "/verify",
    authenticateUser,
    verifyPayment
);

module.exports = router;