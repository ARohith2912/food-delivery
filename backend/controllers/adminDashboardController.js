const db = require("../config/db");

// ==========================================
// ADMIN DASHBOARD SUMMARY
// ==========================================
const getDashboardStats = async (req, res) => {

    try {

        // Total Users
        const [users] = await db.query(
            "SELECT COUNT(*) AS totalUsers FROM users"
        );

        // Total Foods
        const [foods] = await db.query(
            "SELECT COUNT(*) AS totalFoods FROM foods"
        );

        // Total Orders
        const [orders] = await db.query(
            "SELECT COUNT(*) AS totalOrders FROM orders"
        );

        // Total Revenue (ONLY paid orders)
        const [revenue] = await db.query(
            `SELECT SUM(amount) AS totalRevenue
             FROM payments
             WHERE payment_status='paid'`
        );

        // Order Status Breakdown
        const [status] = await db.query(
            `SELECT status, COUNT(*) AS count
             FROM orders
             GROUP BY status`
        );

        res.json({

            totalUsers: users[0].totalUsers,
            totalFoods: foods[0].totalFoods,
            totalOrders: orders[0].totalOrders,
            totalRevenue: revenue[0].totalRevenue || 0,
            orderStatus: status

        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    getDashboardStats
};