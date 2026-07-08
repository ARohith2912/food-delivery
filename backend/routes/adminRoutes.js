const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");

const authorizeRoles = require("../middleware/roleMiddleware");

router.get(
    "/dashboard",

    authenticateUser,

    authorizeRoles("admin"),

    (req, res) => {

        res.json({

            message: "Welcome Admin",

            user: req.user

        });

    }

);

// router.post(

// "/restaurant",

// authenticateUser,

// authorizeRoles("owner"),

// createRestaurant

// );
// router.post(

// "/orders",

// authenticateUser,

// authorizeRoles("customer"),

// placeOrder

// );

module.exports = router;