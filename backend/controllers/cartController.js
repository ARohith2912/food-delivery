const db = require("../config/db");


// ===============================
// Add Food To Cart
// ===============================
const addToCart = async (req, res) => {
  try {
    const { food_id, quantity } = req.body;

    const userId = req.user.id;

    if (!food_id) {
      return res.status(400).json({
        message: "Food ID is required",
      });
    }

    // Check Food Exists
    const [foods] = await db.query(
      "SELECT * FROM foods WHERE id = ?",
      [food_id]
    );

    if (foods.length === 0) {
      return res.status(404).json({
        message: "Food Not Found",
      });
    }

    // Find User Cart
    const [carts] = await db.query(
      "SELECT * FROM carts WHERE user_id = ?",
      [userId]
    );

    let cartId;

    // Create Cart If Not Exists
    if (carts.length === 0) {
      const [result] = await db.query(
        "INSERT INTO carts(user_id) VALUES(?)",
        [userId]
      );

      cartId = result.insertId;
    } else {
      cartId = carts[0].id;
    }

    // Check Item Already Exists
    const [items] = await db.query(
      `SELECT *
       FROM cart_items
       WHERE cart_id = ? AND food_id = ?`,
      [cartId, food_id]
    );

    if (items.length > 0) {
      // Increase Quantity
      await db.query(
        `UPDATE cart_items
         SET quantity = quantity + ?
         WHERE id = ?`,
        [quantity || 1, items[0].id]
      );
    } else {
      // Insert New Item
      await db.query(
        `INSERT INTO cart_items
        (
            cart_id,
            food_id,
            quantity
        )
        VALUES(?,?,?)`,
        [cartId, food_id, quantity || 1]
      );
    }

    res.status(201).json({
      message: "Food Added To Cart",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Get Cart
// ===============================
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find Cart
    const [carts] = await db.query(
      "SELECT * FROM carts WHERE user_id = ?",
      [userId]
    );

    if (carts.length === 0) {
      return res.json({
        cart: [],
        total: 0,
      });
    }

    const cartId = carts[0].id;

    // Get Cart Items
    const [items] = await db.query(
      `SELECT
          cart_items.id,
          foods.id AS food_id,
          foods.food_name,
          foods.price,
          foods.image,
          cart_items.quantity
      FROM cart_items
      JOIN foods
      ON cart_items.food_id = foods.id
      WHERE cart_items.cart_id = ?`,
      [cartId]
    );

    let total = 0;

    const cart = items.map((item) => {
      const subtotal = Number(item.price) * Number(item.quantity);

      total += subtotal;

      return {
        ...item,
        subtotal,
      };
    });

    res.status(200).json({
      cart,
      total,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const updateQuantity = async (req, res) => {
    try {

        const cartItemId = req.params.id;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                message: "Quantity must be greater than zero"
            });
        }

        const [items] = await db.query(
            "SELECT * FROM cart_items WHERE id=?",
            [cartItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                message: "Cart Item Not Found"
            });
        }

        const [carts] = await db.query(
            "SELECT * FROM carts WHERE user_id=?",
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.status(404).json({
                message: "Cart Not Found"
            });
        }

        if (items[0].cart_id !== carts[0].id) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        await db.query(
            "UPDATE cart_items SET quantity=? WHERE id=?",
            [quantity, cartItemId]
        );

        res.json({
            message: "Quantity Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const removeCartItem = async (req, res) => {
    try {

        const cartItemId = req.params.id;

        const [items] = await db.query(
            "SELECT * FROM cart_items WHERE id=?",
            [cartItemId]
        );

        if (items.length === 0) {
            return res.status(404).json({
                message: "Cart Item Not Found"
            });
        }

        const [carts] = await db.query(
            "SELECT * FROM carts WHERE user_id=?",
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.status(404).json({
                message: "Cart Not Found"
            });
        }

        if (items[0].cart_id !== carts[0].id) {
            return res.status(403).json({
                message: "Unauthorized"
            });
        }

        await db.query(
            "DELETE FROM cart_items WHERE id=?",
            [cartItemId]
        );

        res.json({
            message: "Cart Item Removed Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const clearCart = async (req, res) => {
    try {

        const [carts] = await db.query(
            "SELECT * FROM carts WHERE user_id=?",
            [req.user.id]
        );

        if (carts.length === 0) {
            return res.status(404).json({
                message: "Cart Not Found"
            });
        }

        const cartId = carts[0].id;

        await db.query(
            "DELETE FROM cart_items WHERE cart_id=?",
            [cartId]
        );

        res.json({
            message: "Cart Cleared Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
// ===============================
// Exports
// ===============================
module.exports = {
  addToCart,
  getCart,
  updateQuantity,
  removeCartItem,
  clearCart
};
