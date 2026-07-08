const db = require("../config/db");

const createFood = async (req, res) => {
  try {
    const {
      restaurant_id,
      category_id,
      food_name,
      description,
      price,
    } = req.body;

    const image = req.file ? req.file.filename : null;

    if (!restaurant_id || !food_name || !price) {
      return res.status(400).json({
        message: "Restaurant, Food Name and Price are required",
      });
    }

    // Check Restaurant Exists
    const [restaurants] = await db.query(
      "SELECT * FROM restaurants WHERE id = ?",
      [restaurant_id]
    );

    if (restaurants.length === 0) {
      return res.status(404).json({
        message: "Restaurant Not Found",
      });
    }

    const restaurant = restaurants[0];

    // Owner Check
    if (
      req.user.role === "owner" &&
      restaurant.owner_id !== req.user.id
    ) {
      return res.status(403).json({
        message: "You can add food only to your restaurant",
      });
    }

await db.query(
  `INSERT INTO foods(
    restaurant_id,
    category_id,
    food_name,
    description,
    price,
    image
  )
  VALUES(?,?,?,?,?,?)`,
  [
    restaurant_id,
    category_id,
    food_name,
    description,
    price,
    image
  ]
);

    res.status(201).json({
      message: "Food Added Successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getFoods = async (req, res) => {

    try {

        const { search = "",page = 1,limit = 10,category,restaurant,available,sort} = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        let sql = `
            SELECT *
            FROM foods
            WHERE 1=1
        `;

        const values = [];

        if (search) {sql += " AND food_name LIKE ?";values.push(`%${search}%`);}

        if (category) {sql += " AND category_id=?";values.push(category);}

        if (restaurant) {sql += " AND restaurant_id=?";values.push(restaurant);
        }

        if (available !== undefined) {

            sql += " AND available=?";

            values.push(available);

        }

        if (sort === "price_asc") {

            sql += " ORDER BY price ASC";

        }

        else if (sort === "price_desc") {

            sql += " ORDER BY price DESC";

        }

        else {

            sql += " ORDER BY created_at DESC";

        }

        sql += " LIMIT ? OFFSET ?";

        values.push(Number(limit));

        values.push(offset);

        const [foods] = await db.query(sql, values);

        res.status(200).json(foods);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const getFoodById = async (req, res) => {

    try {

        const foodId = req.params.id;

        const [foods] = await db.query(

            "SELECT * FROM foods WHERE id=?",

            [foodId]

        );

        if (foods.length === 0) {

            return res.status(404).json({

                message: "Food Not Found"

            });

        }

        res.json(foods[0]);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
const updateFood = async (req, res) => {
    try {

        const foodId = req.params.id;

        const {
            food_name,
            description,
            price,
            available
        } = req.body;

        const [foods] = await db.query(
            "SELECT * FROM foods WHERE id=?",
            [foodId]
        );

        if (foods.length === 0) {
            return res.status(404).json({
                message: "Food Not Found"
            });
        }

        const food = foods[0];

        const [restaurants] = await db.query(
            "SELECT * FROM restaurants WHERE id=?",
            [food.restaurant_id]
        );

        const restaurant = restaurants[0];

        if (
            req.user.role === "owner" &&
            restaurant.owner_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can update only your food items"
            });
        }

        const image = req.file ? req.file.filename : food.image;

        await db.query(
            `UPDATE foods
             SET
                food_name=?,
                description=?,
                price=?,
                available=?,
                image=?
             WHERE id=?`,
            [
                food_name,
                description,
                price,
                available,
                image,
                foodId
            ]
        );

        res.json({
            message: "Food Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
const deleteFood = async (req, res) => {
    try {

        const foodId = req.params.id;

        const [foods] = await db.query(
            "SELECT * FROM foods WHERE id=?",
            [foodId]
        );

        if (foods.length === 0) {
            return res.status(404).json({
                message: "Food Not Found"
            });
        }

        const food = foods[0];

        const [restaurants] = await db.query(
            "SELECT * FROM restaurants WHERE id=?",
            [food.restaurant_id]
        );

        const restaurant = restaurants[0];

        if (
            req.user.role === "owner" &&
            restaurant.owner_id !== req.user.id
        ) {
            return res.status(403).json({
                message: "You can delete only your food items"
            });
        }

        await db.query(
            "DELETE FROM foods WHERE id=?",
            [foodId]
        );

        res.json({
            message: "Food Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    createFood,
    getFoods,
    getFoodById,
    updateFood,
    deleteFood
};