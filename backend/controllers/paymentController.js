const db = require("../config/db");

// ==========================================
// MAKE PAYMENT
// ==========================================
const makePayment = async (req, res) => {

    try {

        const userId = req.user.id;

        const {
            order_id,
            payment_method
        } = req.body;

        // Validation
        if (!order_id || !payment_method) {

            return res.status(400).json({
                message: "Order ID and Payment Method are required"
            });

        }

        // Payment Method Validation
        if (
            payment_method !== "COD" &&
            payment_method !== "ONLINE"
        ) {

            return res.status(400).json({
                message: "Invalid Payment Method"
            });

        }

        // Check Order Exists
        const [orders] = await db.query(

            `SELECT *
             FROM orders
             WHERE id=? AND user_id=?`,

            [
                order_id,
                userId
            ]

        );

        if (orders.length === 0) {

            return res.status(404).json({
                message: "Order Not Found"
            });

        }

        const order = orders[0];

        // Cancelled Order
        if (order.status === "cancelled") {

            return res.status(400).json({
                message: "Cancelled orders cannot be paid"
            });

        }

        // Already Paid
        const [payments] = await db.query(

            `SELECT *
             FROM payments
             WHERE order_id=?`,

            [order_id]

        );

        if (payments.length > 0) {

            return res.status(400).json({
                message: "Payment already exists"
            });

        }

        let paymentStatus = "pending";
        let transactionId = null;
        let paidAt = null;

        if (payment_method === "ONLINE") {

            // Later this will come from Razorpay/Stripe
            paymentStatus = "paid";

            transactionId =
                "TXN" + Date.now();

            paidAt = new Date();

        }

        await db.query(

            `INSERT INTO payments
            (
                order_id,
                transaction_id,
                payment_method,
                payment_status,
                amount,
                paid_at
            )
            VALUES(?,?,?,?,?,?)`,

            [

                order_id,
                transactionId,
                payment_method,
                paymentStatus,
                order.total_amount,
                paidAt

            ]

        );

        // Update Order Status
        if (payment_method === "ONLINE") {

            await db.query(

                `UPDATE orders
                 SET status='confirmed'
                 WHERE id=?`,

                [order_id]

            );

        }

        res.status(201).json({

            message: "Payment Created Successfully",

            payment_status: paymentStatus,

            transaction_id: transactionId

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};


// ==========================================
// GET PAYMENTS
// ==========================================
const getPayments = async (req, res) => {

    try {

        let sql = `
            SELECT
                payments.*,
                orders.user_id
            FROM payments
            JOIN orders
            ON payments.order_id = orders.id
        `;

        let values = [];

        // If customer → only their payments
        if (req.user.role === "customer") {

            sql += " WHERE orders.user_id = ?";
            values.push(req.user.id);
        }

        sql += " ORDER BY payments.created_at DESC";

        const [payments] = await db.query(sql, values);

        res.json({
            total: payments.length,
            payments
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// ==========================================
// GET PAYMENT BY ID
// ==========================================
const getPaymentById = async (req, res) => {

    try {

        const paymentId = req.params.id;

        const [payments] = await db.query(

            `
            SELECT
                payments.*,
                orders.user_id,
                orders.status AS order_status
            FROM payments
            JOIN orders
            ON payments.order_id = orders.id
            WHERE payments.id=?
            `,

            [paymentId]

        );

        if (payments.length === 0) {

            return res.status(404).json({
                message: "Payment Not Found"
            });

        }

        const payment = payments[0];

        // Only owner of order or admin can view
        if (
            req.user.role === "customer" &&
            payment.user_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        res.json(payment);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// ==========================================
// UPDATE PAYMENT STATUS (ADMIN)
// ==========================================
const updatePaymentStatus = async (req, res) => {

    try {

        const paymentId = req.params.id;

        const { payment_status } = req.body;

        const allowed = ["pending", "paid", "failed", "refunded"];

        if (!allowed.includes(payment_status)) {

            return res.status(400).json({
                message: "Invalid Payment Status"
            });

        }

        const [payments] = await db.query(
            "SELECT * FROM payments WHERE id=?",
            [paymentId]
        );

        if (payments.length === 0) {

            return res.status(404).json({
                message: "Payment Not Found"
            });

        }

        await db.query(

            `UPDATE payments
             SET payment_status=?
             WHERE id=?`,

            [
                payment_status,
                paymentId
            ]

        );

        // If payment marked as paid → update order
        if (payment_status === "paid") {

            await db.query(
                `UPDATE orders
                 SET status='confirmed'
                 WHERE id=?`,
                [payments[0].order_id]
            );

        }

        res.json({
            message: "Payment Status Updated"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    makePayment,
    getPayments,
    getPaymentById,
    updatePaymentStatus
};