const db = require("../config/db");

// ==========================================
// ADD ADDRESS
// ==========================================
const addAddress = async (req, res) => {
    try {

        const userId = req.user.id;

        const {
            full_name,
            phone,
            address_line1,
            address_line2,
            landmark,
            city,
            state,
            pincode,
            address_type,
            is_default
        } = req.body;

        // Validation
        if (
            !full_name ||
            !phone ||
            !address_line1 ||
            !city ||
            !state ||
            !pincode
        ) {
            return res.status(400).json({
                message: "Required fields are missing"
            });
        }

        // If new address is default,
        // remove default from old addresses
        if (is_default) {

            await db.query(
                "UPDATE addresses SET is_default = FALSE WHERE user_id=?",
                [userId]
            );

        }

        await db.query(
            `INSERT INTO addresses
            (
                user_id,
                full_name,
                phone,
                address_line1,
                address_line2,
                landmark,
                city,
                state,
                pincode,
                address_type,
                is_default
            )
            VALUES(?,?,?,?,?,?,?,?,?,?,?)`,
            [
                userId,
                full_name,
                phone,
                address_line1,
                address_line2 || null,
                landmark || null,
                city,
                state,
                pincode,
                address_type || "home",
                is_default || false
            ]
        );

        res.status(201).json({
            message: "Address Added Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// ==========================================
// GET MY ADDRESSES
// ==========================================
const getAddresses = async (req, res) => {

    try {

        const [addresses] = await db.query(
            `SELECT *
             FROM addresses
             WHERE user_id=?
             ORDER BY is_default DESC, created_at DESC`,
            [req.user.id]
        );

        res.json({
            total: addresses.length,
            addresses
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

// ==========================================
// GET ADDRESS BY ID
// ==========================================
const getAddressById = async (req, res) => {

    try {

        const addressId = req.params.id;

        const [addresses] = await db.query(

            `SELECT *
             FROM addresses
             WHERE id=? AND user_id=?`,

            [

                addressId,
                req.user.id

            ]

        );

        if (addresses.length === 0) {

            return res.status(404).json({

                message: "Address Not Found"

            });

        }

        res.json(addresses[0]);

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
// ==========================================
// UPDATE ADDRESS
// ==========================================
const updateAddress = async (req, res) => {

    try {

        const addressId = req.params.id;

        const {

            full_name,
            phone,
            address_line1,
            address_line2,
            landmark,
            city,
            state,
            pincode,
            address_type,
            is_default

        } = req.body;

        const [addresses] = await db.query(

            `SELECT *
             FROM addresses
             WHERE id=? AND user_id=?`,

            [

                addressId,
                req.user.id

            ]

        );

        if (addresses.length === 0) {

            return res.status(404).json({

                message: "Address Not Found"

            });

        }

        if (is_default) {

            await db.query(

                "UPDATE addresses SET is_default = FALSE WHERE user_id=?",

                [

                    req.user.id

                ]

            );

        }

        await db.query(

            `UPDATE addresses
             SET

                full_name=?,
                phone=?,
                address_line1=?,
                address_line2=?,
                landmark=?,
                city=?,
                state=?,
                pincode=?,
                address_type=?,
                is_default=?

             WHERE id=?`,

            [

                full_name,
                phone,
                address_line1,
                address_line2,
                landmark,
                city,
                state,
                pincode,
                address_type,
                is_default,

                addressId

            ]

        );

        res.json({

            message: "Address Updated Successfully"

        });

    } catch (error) {

        res.status(500).json({

            message: error.message

        });

    }

};
// ==========================================
// DELETE ADDRESS
// ==========================================
const deleteAddress = async (req, res) => {

    try {

        const addressId = req.params.id;

        const [addresses] = await db.query(
            `SELECT *
             FROM addresses
             WHERE id=? AND user_id=?`,
            [addressId, req.user.id]
        );

        if (addresses.length === 0) {

            return res.status(404).json({
                message: "Address Not Found"
            });

        }

        await db.query(
            "DELETE FROM addresses WHERE id=?",
            [addressId]
        );

        res.json({
            message: "Address Deleted Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
// ==========================================
// SET DEFAULT ADDRESS
// ==========================================
const setDefaultAddress = async (req, res) => {

    try {

        const addressId = req.params.id;

        const userId = req.user.id;

        const [addresses] = await db.query(
            `SELECT *
             FROM addresses
             WHERE id=? AND user_id=?`,
            [addressId, userId]
        );

        if (addresses.length === 0) {

            return res.status(404).json({
                message: "Address Not Found"
            });

        }

        // Remove previous default
        await db.query(
            "UPDATE addresses SET is_default=FALSE WHERE user_id=?",
            [userId]
        );

        // Set new default
        await db.query(
            "UPDATE addresses SET is_default=TRUE WHERE id=?",
            [addressId]
        );

        res.json({
            message: "Default Address Updated Successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {

    addAddress,

    getAddresses,

    getAddressById,

    updateAddress,

    deleteAddress,

    setDefaultAddress

};