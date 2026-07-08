const db = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const generateAccessToken = require("../utils/generateAccessToken");
const generateRefreshToken = require("../utils/generateRefreshToken");

const registerUser = async (req, res) => {

    try {
const {name,email,password,phone,role} = req.body;
 //Validate Input
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
       //Check Email
        const [users] = await db.query(
            "SELECT * FROM users WHERE email=?",
            [email]
        );
        //Check email result
        if (users.length > 0) {
            return res.status(400).json({
                message: "Email already exists"
            });
        }
         //Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);
        //This inserts the user into the users table with the hashed password.
        await db.query(
            `INSERT INTO users
            (name,email,password,phone,role)
            VALUES(?,?,?,?,?)`,
            [name,email,hashedPassword,phone,role || "customer"]
        );
        res.status(201).json({
            message: "User Registered Successfully"
        });
    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};
const loginUser = async (req, res) => {
    try {

        const { email, password } = req.body;
         //input validation
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and Password are required"
            });
        }
       //Find User
        const [users] = await db.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
     //Check User Exists
        if (users.length === 0) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }
         //Get the User
        const user = users[0];
        //Compare Password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );
       //Wrong Password
        if (!isMatch) {
            return res.status(401).json({
                message: "Invalid Email or Password"
            });
        }
        //Generate JWT Token
        // const token = jwt.sign(
        //     {
        //         id: user.id,
        //         role: user.role
        //     },
        //     process.env.JWT_SECRET,
        //     {
        //         expiresIn: "1d"
        //     }
        // ); 
        //previous versioson
        // Generate Tokens
const accessToken = generateAccessToken(user);
const refreshToken = generateRefreshToken(user);

// Store refresh token in DB
await db.query(
    `INSERT INTO refresh_tokens
    (user_id, token, expires_at)
    VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 7 DAY))`,
    [user.id, refreshToken]
);

        // res.status(200).json({
        //     message: "Login Successful",
        //     token,
        //     user: {
        //         id: user.id,
        //         name: user.name,
        //         email: user.email,
        //         role: user.role
        //     }
        // });

        res.status(200).json({
    message: "Login Successful",
    accessToken,
    refreshToken,
    user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }
});

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const refreshToken = async (req, res) => {

    try {

        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                message: "Refresh token required"
            });
        }

        // Check DB
        const [tokens] = await db.query(
            "SELECT * FROM refresh_tokens WHERE token=?",
            [refreshToken]
        );

        if (tokens.length === 0) {
            return res.status(403).json({
                message: "Invalid refresh token"
            });
        }

        // Verify token
        jwt.verify(
            refreshToken,
            process.env.REFRESH_SECRET,
            async (err, decoded) => {

                if (err) {
                    return res.status(403).json({
                        message: "Expired refresh token"
                    });
                }

                const [users] = await db.query(
                    "SELECT * FROM users WHERE id=?",
                    [decoded.id]
                );

                if (users.length === 0) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }

                const newAccessToken = generateAccessToken(users[0]);

                res.json({
                    accessToken: newAccessToken
                });

            }
        );

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

const logout = async (req, res) => {

    try {

        const { refreshToken } = req.body;

        await db.query(
            "DELETE FROM refresh_tokens WHERE token=?",
            [refreshToken]
        );

        res.json({
            message: "Logged out successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};
module.exports = {
    registerUser,
    loginUser,
    refreshToken,
    logout
};