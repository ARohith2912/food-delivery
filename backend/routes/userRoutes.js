const express = require("express");

const router = express.Router();
const {
    registerUser,
    loginUser,
    refreshToken,
    logout
} = require("../controllers/authController");

const authenticateUser = require("../middleware/authMiddleware");

router.get("/profile",authenticateUser,(req, res) => {
        res.json({message: "Protected Route",user: req.user});});
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh-token", refreshToken);
router.post("/logout", logout);

module.exports = router;