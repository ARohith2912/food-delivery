const db = require("../config/db");

// =========================================
// PLACE ORDER
// =========================================
// const placeOrder = async (req, res) => {

//     const connection = await db.getConnection();

//     try {

//         await connection.beginTransaction();

//         const userId = req.user.id;

//         const {
//             delivery_address,
//             payment_method
//         } = req.body;

//         if (!delivery_address || !payment_method) {

//             await connection.rollback();
//             connection.release();

//             return res.status(400).json({
//                 message: "Delivery address and payment method are required"
//             });

//         }

//         // -------------------------------------
//         // Find User Cart
//         // -------------------------------------

//         const [carts] = await connection.query(

//             "SELECT * FROM carts WHERE user_id=?",

//             [userId]

//         );

//         if (carts.length === 0) {

//             await connection.rollback();
//             connection.release();

//             return res.status(404).json({

//                 message: "Cart Not Found"

//             });

//         }

//         const cartId = carts[0].id;

//         // -------------------------------------
//         // Read Cart Items
//         // -------------------------------------

//         const [items] = await connection.query(

//             `SELECT

//                 cart_items.food_id,
//                 cart_items.quantity,
//                 foods.price

//             FROM cart_items

//             JOIN foods

//             ON foods.id = cart_items.food_id

//             WHERE cart_items.cart_id=?`,

//             [cartId]

//         );

//         if (items.length === 0) {

//             await connection.rollback();
//             connection.release();

//             return res.status(400).json({

//                 message: "Cart is Empty"

//             });

//         }

//         // -------------------------------------
//         // Calculate Total
//         // -------------------------------------

//         let totalAmount = 0;

//         for (const item of items) {

//             totalAmount += Number(item.price) * Number(item.quantity);

//         }

//         // -------------------------------------
//         // Create Order
//         // -------------------------------------

//         const [orderResult] = await connection.query(

//             `INSERT INTO orders
//             (
//                 user_id,
//                 total_amount,
//                 delivery_address,
//                 payment_method
//             )
//             VALUES(?,?,?,?)`,

//             [

//                 userId,
//                 totalAmount,
//                 delivery_address,
//                 payment_method

//             ]

//         );

//         const orderId = orderResult.insertId;

//         // -------------------------------------
//         // Copy Cart Items
//         // -------------------------------------

//         for (const item of items) {

//             await connection.query(

//                 `INSERT INTO order_items
//                 (
//                     order_id,
//                     food_id,
//                     quantity,
//                     price
//                 )
//                 VALUES(?,?,?,?)`,

//                 [

//                     orderId,
//                     item.food_id,
//                     item.quantity,
//                     item.price

//                 ]

//             );

//         }

//         // -------------------------------------
//         // Clear Cart
//         // -------------------------------------

//         await connection.query(

//             "DELETE FROM cart_items WHERE cart_id=?",

//             [cartId]

//         );

//         // -------------------------------------
//         // Commit Transaction
//         // -------------------------------------

//         await connection.commit();

//         connection.release();

//         res.status(201).json({

//             message: "Order Placed Successfully",

//             orderId

//         });

//     } catch (error) {

//         await connection.rollback();

//         connection.release();

//         res.status(500).json({

//             message: error.message

//         });

//     }

// };

const placeOrder = async (req, res) => {
    try {

        const userId = req.user.id;
        const { delivery_address, payment_method } = req.body;

        if (!delivery_address || !payment_method) {
            return res.status(400).json({
                message: "Delivery address and payment method are required"
            });
        }

        if (payment_method !== "COD" && payment_method !== "ONLINE") {
            return res.status(400).json({
                message: "Invalid Payment Method"
            });
        }

        // GET CART
        const [carts] = await db.query(
            "SELECT * FROM carts WHERE user_id = ?",
            [userId]
        );

        if (carts.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        const cartId = carts[0].id;

        const [cart] = await db.query(
            `SELECT c.food_id, c.quantity, f.price
             FROM cart_items c
             JOIN foods f ON c.food_id = f.id
             WHERE c.cart_id = ?`,
            [cartId]
        );

        if (cart.length === 0) {
            return res.status(400).json({
                message: "Cart is empty"
            });
        }

        // TOTAL
        let total = 0;
        cart.forEach(item => {
            total += Number(item.price) * Number(item.quantity);
        });

        // CREATE ORDER
        const [order] = await db.query(
            `INSERT INTO orders (user_id, total_amount, delivery_address, payment_method, status)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, total, delivery_address, payment_method, "pending"]
        );

        const orderId = order.insertId;

        // ORDER ITEMS
        for (let item of cart) {
            await db.query(
                `INSERT INTO order_items (order_id, food_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [orderId, item.food_id, item.quantity, item.price]
            );
        }

        // CLEAR CART
        await db.query(
            `DELETE FROM cart_items WHERE cart_id = ?`,
            [cartId]
        );

        res.status(201).json({
            message: "Order placed successfully",
            orderId,
            total
        });

    } catch (err) {
        res.status(500).json({
            message: err.message
        });
    }
};



// =========================================
// GET MY ORDERS
// =========================================
const getOrders = async (req, res) => {
    try {

        const userId = req.user.id;

        let sql = "";

        let values = [];

        // Admin can view all orders
        if (req.user.role === "admin") {

            sql = `
                SELECT
                    orders.*,
                    users.name,
                    users.email
                FROM orders
                JOIN users
                ON orders.user_id = users.id
                ORDER BY orders.created_at DESC
            `;

        }

        // Owner can view orders containing items from their restaurant(s)
        else if (req.user.role === "owner") {

            sql = `
                SELECT DISTINCT
                    orders.*,
                    users.name,
                    users.email
                FROM orders
                JOIN order_items ON order_items.order_id = orders.id
                JOIN foods ON foods.id = order_items.food_id
                JOIN restaurants ON restaurants.id = foods.restaurant_id
                JOIN users ON users.id = orders.user_id
                WHERE restaurants.owner_id = ?
                ORDER BY orders.created_at DESC
            `;

            values.push(userId);

        }

        // Customer can view only their orders
        else {

            sql = `
                SELECT *
                FROM orders
                WHERE user_id = ?
                ORDER BY created_at DESC
            `;

            values.push(userId);

        }

        const [orders] = await db.query(sql, values);

        res.status(200).json({
            total: orders.length,
            orders
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// =========================================
// GET ORDER BY ID
// =========================================
const getOrderById = async (req, res) => {

    try {

        const orderId = req.params.id;

        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id=?",
            [orderId]
        );

        if (orders.length === 0) {

            return res.status(404).json({
                message: "Order Not Found"
            });

        }

        const order = orders[0];

        // Customer can only view their own order
        if (
            req.user.role === "customer" &&
            order.user_id !== req.user.id
        ) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        const [items] = await db.query(

            `SELECT

                order_items.id,
                foods.food_name,
                foods.image,
                foods.id AS food_id,
                foods.restaurant_id,
                order_items.quantity,
                order_items.price

            FROM order_items

            JOIN foods

            ON foods.id = order_items.food_id

            WHERE order_items.order_id=?`,

            [orderId]

        );

        res.json({

            order,
            items

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};

// =========================================
// UPDATE ORDER STATUS
// =========================================
const updateOrderStatus = async (req, res) => {

    try {

        const orderId = req.params.id;

        const { status } = req.body;

        const allowedStatus = [
            "pending",
            "confirmed",
            "preparing",
            "out_for_delivery",
            "delivered",
            "cancelled"
        ];

        if (!allowedStatus.includes(status)) {

            return res.status(400).json({
                message: "Invalid Status"
            });

        }

        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id=?",
            [orderId]
        );

        if (orders.length === 0) {

            return res.status(404).json({
                message: "Order Not Found"
            });

        }

        await db.query(
            "UPDATE orders SET status=? WHERE id=?",
            [status, orderId]
        );

        res.json({
            message: "Order Status Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

// =========================================
// CANCEL ORDER
// =========================================
const cancelOrder = async (req, res) => {

    try {

        const orderId = req.params.id;

        const [orders] = await db.query(
            "SELECT * FROM orders WHERE id=?",
            [orderId]
        );

        if (orders.length === 0) {

            return res.status(404).json({
                message: "Order Not Found"
            });

        }

        const order = orders[0];

        if (order.user_id !== req.user.id) {

            return res.status(403).json({
                message: "Unauthorized"
            });

        }

        if (order.status === "delivered") {

            return res.status(400).json({
                message: "Delivered Order Cannot Be Cancelled"
            });

        }

        await db.query(
            "UPDATE orders SET status='cancelled' WHERE id=?",
            [orderId]
        );

        res.json({
            message: "Order Cancelled Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
module.exports = {
    placeOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
    cancelOrder
};