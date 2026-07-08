const db = require("../config/db");

// ==========================================
// CREATE CATEGORY
// ==========================================
const createCategory = async (req, res) => {

    try {

        const { restaurant_id, category_name } = req.body;

        if (!restaurant_id || !category_name) {

            return res.status(400).json({
                message: "Restaurant ID and Category Name are required"
            });

        }

        // Check Restaurant Exists
        const [restaurants] = await db.query(
            "SELECT * FROM restaurants WHERE id=?",
            [restaurant_id]
        );

        if (restaurants.length === 0) {

            return res.status(404).json({
                message: "Restaurant Not Found"
            });

        }

        const restaurant = restaurants[0];

        // Ownership Check
        if (
            req.user.role === "owner" &&
            restaurant.owner_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "You can add categories only to your restaurant"
            });

        }

        await db.query(
            `INSERT INTO categories
            (restaurant_id, category_name)
            VALUES (?, ?)`,
            [restaurant_id, category_name]
        );

        res.status(201).json({
            message: "Category Created Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================================
// GET CATEGORIES (optionally filtered by restaurant)
// ==========================================
const getCategories = async (req, res) => {

    try {

        const { restaurant } = req.query;

        let sql = "SELECT * FROM categories WHERE 1=1";
        const values = [];

        if (restaurant) {
            sql += " AND restaurant_id=?";
            values.push(restaurant);
        }

        sql += " ORDER BY category_name ASC";

        const [categories] = await db.query(sql, values);

        res.json(categories);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================================
// GET CATEGORY BY ID
// ==========================================
const getCategoryById = async (req, res) => {

    try {

        const categoryId = req.params.id;

        const [categories] = await db.query(
            "SELECT * FROM categories WHERE id=?",
            [categoryId]
        );

        if (categories.length === 0) {

            return res.status(404).json({
                message: "Category Not Found"
            });

        }

        res.json(categories[0]);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================================
// UPDATE CATEGORY
// ==========================================
const updateCategory = async (req, res) => {

    try {

        const categoryId = req.params.id;
        const { category_name } = req.body;

        const [categories] = await db.query(
            "SELECT * FROM categories WHERE id=?",
            [categoryId]
        );

        if (categories.length === 0) {

            return res.status(404).json({
                message: "Category Not Found"
            });

        }

        const category = categories[0];

        const [restaurants] = await db.query(
            "SELECT * FROM restaurants WHERE id=?",
            [category.restaurant_id]
        );

        const restaurant = restaurants[0];

        if (
            req.user.role === "owner" &&
            restaurant.owner_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "You can update only your restaurant's categories"
            });

        }

        await db.query(
            `UPDATE categories
             SET category_name=?
             WHERE id=?`,
            [category_name, categoryId]
        );

        res.json({
            message: "Category Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================================
// DELETE CATEGORY
// ==========================================
const deleteCategory = async (req, res) => {

    try {

        const categoryId = req.params.id;

        const [categories] = await db.query(
            "SELECT * FROM categories WHERE id=?",
            [categoryId]
        );

        if (categories.length === 0) {

            return res.status(404).json({
                message: "Category Not Found"
            });

        }

        const category = categories[0];

        const [restaurants] = await db.query(
            "SELECT * FROM restaurants WHERE id=?",
            [category.restaurant_id]
        );

        const restaurant = restaurants[0];

        if (
            req.user.role === "owner" &&
            restaurant.owner_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "You can delete only your restaurant's categories"
            });

        }

        await db.query(
            "DELETE FROM categories WHERE id=?",
            [categoryId]
        );

        res.json({
            message: "Category Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};
