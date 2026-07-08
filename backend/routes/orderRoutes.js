const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    placeOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
} = require("../controllers/orderController");

router.post(
    "/place",
    authenticateUser,
    authorizeRoles("customer"),
    placeOrder
);

router.get(
    "/",
    authenticateUser,
    getOrders
);

router.get(
    "/:id",
    authenticateUser,
    getOrderById
);

router.put(
    "/:id/status",
    authenticateUser,
    authorizeRoles("owner", "admin"),
    updateOrderStatus
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    cancelOrder
);

module.exports = router;