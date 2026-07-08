const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    addToCart,
    getCart,
    updateQuantity,
    removeCartItem,
    clearCart
} = require("../controllers/cartController");

router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    addToCart
);

router.get(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    getCart
);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    updateQuantity
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    removeCartItem
);
router.delete(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    clearCart
);

module.exports = router;