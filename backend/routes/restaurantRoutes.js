const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
} = require("../controllers/restaurantController");

router.post(
    "/",
    authenticateUser,
    authorizeRoles("owner"),
    upload.single("image"),
    createRestaurant
);

router.get("/", getRestaurants);

router.get("/:id", getRestaurantById);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("owner", "admin"),
    upload.single("image"),
    updateRestaurant
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("owner", "admin"),
    deleteRestaurant
);

module.exports = router;