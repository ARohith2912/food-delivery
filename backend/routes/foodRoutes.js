const express = require("express");

const router = express.Router();

const authenticateUser = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../middleware/upload");

const {
  createFood,
  getFoods,
  getFoodById,
  updateFood,
  deleteFood,
} = require("../controllers/foodController");

// Create Food
router.post(
    "/",
    authenticateUser,
    authorizeRoles("owner"),
    upload.single("image"),
    createFood
);
// Get All Foods
router.get("/", getFoods);

// Get Food By Id
router.get("/:id", getFoodById);

// Update Food
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  upload.single("image"),
  updateFood
);

// Delete Food
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("owner", "admin"),
  deleteFood
);

module.exports = router;
