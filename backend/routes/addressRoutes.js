const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {

    addAddress,

    getAddresses,

    getAddressById,

    updateAddress,

    deleteAddress,

    setDefaultAddress

} = require("../controllers/addressController");

// Add Address
router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    addAddress
);

// Get All Addresses
router.get(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    getAddresses
);

// Get Address By ID
router.get(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    getAddressById
);

// Update Address
router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    updateAddress
);

// Delete Address
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    deleteAddress
);

// Set Default Address
router.patch(
    "/:id/default",
    authenticateUser,
    authorizeRoles("customer"),
    setDefaultAddress
);

module.exports = router;