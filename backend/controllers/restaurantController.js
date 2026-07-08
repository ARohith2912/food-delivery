const db = require("../config/db");

const createRestaurant = async (req, res) => {

    try {

        const {
            restaurant_name,
            description,
            address
        } = req.body;

        if (!restaurant_name || !address) {

            return res.status(400).json({
                message: "Restaurant name and address are required"
            });

        }

        const image = req.file ? req.file.filename : null;

        await db.query(

            `INSERT INTO restaurants
            (owner_id, restaurant_name, description, address, image)
            VALUES (?, ?, ?, ?, ?)`,

            [
                req.user.id,
                restaurant_name,
                description,
                address,
                image
            ]

        );

        res.status(201).json({
            message: "Restaurant Created Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const getRestaurants = async (req, res) => {

    try {

        const [restaurants] = await db.query(

            "SELECT * FROM restaurants WHERE status='active'"

        );

        res.json(restaurants);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const getRestaurantById = async (req, res) => {

    try {

        const [restaurant] = await db.query(

            "SELECT * FROM restaurants WHERE id=?",

            [req.params.id]

        );

        if (restaurant.length === 0) {

            return res.status(404).json({
                message: "Restaurant Not Found"
            });

        }

        res.json(restaurant[0]);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const updateRestaurant = async (req, res) => {

    try {
        //Read URL parameter
        const restaurantId = req.params.id;
        const {restaurant_name,description, address} = req.body;
        //Find restaurant
        const [restaurants] = await db.query("SELECT * FROM restaurants WHERE id=?",[restaurantId]);
        //Restaurant exists?
        if(restaurants.length===0){return res.status(404).json({message:"Restaurant Not Found"})}
        //Save restaurant
        const restaurant = restaurants[0];
        //Ownership Check
        if(req.user.role==="owner"&&restaurant.owner_id!==req.user.id){
            return res.status(403).json({message:"You can update only your restaurant"})
        }
        const image = req.file ? req.file.filename : restaurant.image;
        await db.query(`UPDATE restaurants SET 
            restaurant_name=?,description=?,address=?,image=? WHERE id=?`,
            [restaurant_name,description,address,image,restaurantId]);
        res.json({message:"Restaurant Updated"})

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const deleteRestaurant = async (req, res) => {

    try {
        //Read URL parameter
        const restaurantId = req.params.id;
        //Find restaurant
        const [restaurants] = await db.query("SELECT * FROM restaurants WHERE id=?",[restaurantId]);
        //Restaurant exists?
        if(restaurants.length===0){return res.status(404).json({message:"Restaurant Not Found"})}
        //Save restaurant
        const restaurant = restaurants[0];
        //Ownership Check
        if(req.user.role==="owner"&&restaurant.owner_id!==req.user.id){
            return res.status(403).json({message:"You can delete only your restaurant"})
        }
        await db.query("DELETE FROM restaurants WHERE id=?",[restaurantId]);
        res.json({message:"Restaurant Deleted Successfully"})

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {
    createRestaurant,
    getRestaurants,
    getRestaurantById,
    updateRestaurant,
    deleteRestaurant
};