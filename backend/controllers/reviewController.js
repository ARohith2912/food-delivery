const db = require("../config/db");

// ==========================================
// ADD REVIEW
// ==========================================
const addReview = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            order_id,
            restaurant_id,
            food_id,
            rating,
            review
        } = req.body;

        // Validation
        if (
            !order_id ||
            !restaurant_id ||
            !food_id ||
            !rating
        ) {
            return res.status(400).json({
                message: "All required fields are mandatory"
            });
        }

        // Rating Validation
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });
        }

        // Check Order Exists
        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id=? AND user_id=?",
            [order_id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order Not Found"
            });
        }

        // Check Food Exists In Order
        const [foods] = await db.query(
            `SELECT *
             FROM order_items
             WHERE order_id=? AND food_id=?`,
            [order_id, food_id]
        );

        if (foods.length === 0) {
            return res.status(400).json({
                message: "Food not found in this order"
            });
        }

        // Prevent Duplicate Review
        const [existing] = await db.query(
            `SELECT *
             FROM reviews
             WHERE user_id=? AND order_id=? AND food_id=?`,
            [userId, order_id, food_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                message: "Review already submitted"
            });
        }

        // Insert Review
        await db.query(
            `INSERT INTO reviews
            (
                user_id,
                restaurant_id,
                food_id,
                order_id,
                rating,
                review
            )
            VALUES(?,?,?,?,?,?)`,
            [
                userId,
                restaurant_id,
                food_id,
                order_id,
                rating,
                review || null
            ]
        );

        res.status(201).json({
            message: "Review Added Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// ==========================================
// GET ALL REVIEWS
// ==========================================
const getReviews = async (req, res) => {
    try {

        const [reviews] = await db.query(`
            SELECT
                reviews.id,
                reviews.rating,
                reviews.review,
                reviews.created_at,

                users.name,

                foods.food_name,

                restaurants.restaurant_name

            FROM reviews

            JOIN users
            ON reviews.user_id = users.id

            JOIN foods
            ON reviews.food_id = foods.id

            JOIN restaurants
            ON reviews.restaurant_id = restaurants.id

            ORDER BY reviews.created_at DESC
        `);

        res.json({
            total: reviews.length,
            reviews
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// ==========================================
// GET REVIEW BY ID
// ==========================================
const getReviewById = async (req, res) => {

    try {

        const reviewId = req.params.id;

        const [reviews] = await db.query(

            `SELECT
                reviews.*,
                users.name,
                foods.food_name,
                restaurants.restaurant_name

            FROM reviews

            JOIN users
            ON reviews.user_id = users.id

            JOIN foods
            ON reviews.food_id = foods.id

            JOIN restaurants
            ON reviews.restaurant_id = restaurants.id

            WHERE reviews.id=?`,

            [reviewId]

        );

        if (reviews.length === 0) {

            return res.status(404).json({
                message: "Review Not Found"
            });

        }

        res.json(reviews[0]);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// ==========================================
// UPDATE REVIEW
// ==========================================
const updateReview = async (req, res) => {

    try {

        const reviewId = req.params.id;

        const {
            rating,
            review
        } = req.body;

        if (rating < 1 || rating > 5) {

            return res.status(400).json({
                message: "Rating must be between 1 and 5"
            });

        }

        const [reviews] = await db.query(
            "SELECT * FROM reviews WHERE id=?",
            [reviewId]
        );

        if (reviews.length === 0) {

            return res.status(404).json({
                message: "Review Not Found"
            });

        }

        if (reviews[0].user_id !== req.user.id) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        await db.query(

            `UPDATE reviews
             SET
                rating=?,
                review=?
             WHERE id=?`,

            [
                rating,
                review,
                reviewId
            ]

        );

        res.json({
            message: "Review Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// ==========================================
// DELETE REVIEW
// ==========================================
const deleteReview = async (req, res) => {

    try {

        const reviewId = req.params.id;

        const [reviews] = await db.query(
            "SELECT * FROM reviews WHERE id=?",
            [reviewId]
        );

        if (reviews.length === 0) {

            return res.status(404).json({
                message: "Review Not Found"
            });

        }

        if (
            req.user.role === "customer" &&
            reviews[0].user_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        await db.query(
            "DELETE FROM reviews WHERE id=?",
            [reviewId]
        );

        res.json({
            message: "Review Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    addReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
};