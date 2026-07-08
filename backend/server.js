//Loads the Express framework.
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const createDatabase = require("./database/createDatabase");
const createTables = require("./database/createTables");
const adminRoutes = require("./routes/adminRoutes");
const foodRoutes = require("./routes/foodRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const addressRoutes = require("./routes/addressRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const adminDashboardRoutes = require("./routes/adminDashboardRoutes");
const razorpayRoutes = require("./routes/razorpayRoutes");

const restaurantRoutes = require("./routes/restaurantRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const path = require("path");


dotenv.config();

//Creates your Express application.
const app = express();

// Middleware
//Reads values from the .env file.
app.use(cors());
//Converts incoming JSON request bodies into JavaScript objects.
app.use(express.json());


// Test Route
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/foods", foodRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);
app.use("/api/payment/razorpay", razorpayRoutes);
app.use("/uploads",express.static(path.join(__dirname, "uploads")));

async function startServer() {

    //await createDatabase();
// Create tables when server starts
    await createTables();

// Test Route
app.get("/", (req, res) => {
    res.json({
        message: "Food Delivery Backend Running 🚀"
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
}
startServer();