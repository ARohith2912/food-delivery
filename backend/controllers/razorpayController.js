const razorpay = require("../config/razorpay");
const db = require("../config/db");

// ===============================
// CREATE PAYMENT ORDER
// ===============================
const createRazorpayOrder = async (req, res) => {

    try {

        const userId = req.user.id;
        const { order_id } = req.body;

        // Get Order
        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id=? AND user_id=?",
            [order_id, userId]
        );

        if (orders.length === 0) {
            return res.status(404).json({
                message: "Order not found"
            });
        }

        const order = orders[0];

        // Razorpay Order Create
        const options = {
            // Math.round is essential here: order.total_amount * 100 can
            // produce a non-integer like 1998.9999999999998 due to floating
            // point math, and Razorpay's API rejects non-integer amounts.
            amount: Math.round(Number(order.total_amount) * 100),
            currency: "INR",
            receipt: `receipt_${order.id}`
        };

        let razorpayOrder;

        try {
            razorpayOrder = await razorpay.orders.create(options);
        } catch (razorpayError) {
            // The Razorpay SDK throws { statusCode, error: { code, description } }
            // instead of a normal Error, so error.message is usually undefined.
            // Log the full object and surface the real description to the client.
            console.error("Razorpay order creation failed:", razorpayError);

            const description =
                razorpayError?.error?.description ||
                razorpayError?.message ||
                "Failed to create Razorpay order";

            return res.status(500).json({ message: description });
        }

        res.json({
            razorpay_order_id: razorpayOrder.id,
            amount: options.amount,
            currency: options.currency
        });

    } catch (error) {

        console.error("createRazorpayOrder error:", error);

        res.status(500).json({
            message: error.message || "Something went wrong"
        });

    }

};
const crypto = require("crypto");

// ===============================
// VERIFY PAYMENT
// ===============================
const verifyPayment = async (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            order_id
        } = req.body;

        // Create signature
        const generatedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        // Verify signature
        if (generatedSignature !== razorpay_signature) {

            return res.status(400).json({
                message: "Payment verification failed"
            });

        }

        // Update Payment in DB
        await db.query(
            `UPDATE payments
             SET payment_status='paid',
                 transaction_id=?
             WHERE order_id=?`,
            [razorpay_payment_id, order_id]
        );

        // Update Order Status
        await db.query(
            `UPDATE orders
             SET status='confirmed'
             WHERE id=?`,
            [order_id]
        );

        res.json({
            message: "Payment verified successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    createRazorpayOrder,
    verifyPayment
};