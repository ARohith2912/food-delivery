const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    makePayment,
    getPayments,
    getPaymentById,
    updatePaymentStatus
} = require("../controllers/paymentController");

// Make Payment
router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    makePayment
);

// Get Payments
router.get(
    "/",
    authenticateUser,
    getPayments
);

// Get Payment By ID
router.get(
    "/:id",
    authenticateUser,
    getPaymentById
);

// Update Payment Status (Admin)
router.patch(
    "/:id/status",
    authenticateUser,
    authorizeRoles("admin"),
    updatePaymentStatus
);

module.exports = router;