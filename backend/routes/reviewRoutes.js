const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    addReview,updateReview,deleteReview,getReviews,getReviewById
} = require("../controllers/reviewController");

// Add Review
router.post(
    "/",
    authenticateUser,
    authorizeRoles("customer"),
    addReview
);
router.get("/", getReviews);

router.get("/:id", getReviewById);

router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("customer"),
    updateReview
);

router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("customer", "admin"),
    deleteReview
);

module.exports = router;