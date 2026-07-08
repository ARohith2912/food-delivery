const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    getDashboardStats
} = require("../controllers/adminDashboardController");

// Admin Dashboard
router.get(
    "/stats",
    authenticateUser,
    authorizeRoles("admin"),
    getDashboardStats
);

module.exports = router;