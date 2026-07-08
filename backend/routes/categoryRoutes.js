const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

// Create Category
router.post(
    "/",
    authenticateUser,
    authorizeRoles("owner"),
    createCategory
);

// Get All Categories (optionally ?restaurant=<id>)
router.get("/", getCategories);

// Get Category By Id
router.get("/:id", getCategoryById);

// Update Category
router.put(
    "/:id",
    authenticateUser,
    authorizeRoles("owner", "admin"),
    updateCategory
);

// Delete Category
router.delete(
    "/:id",
    authenticateUser,
    authorizeRoles("owner", "admin"),
    deleteCategory
);

module.exports = router;
