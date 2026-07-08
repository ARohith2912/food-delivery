const jwt = require("jsonwebtoken");

const authenticateUser = (req, res, next) => {

    try {
        //Read Authorization Header
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({
                message: "Access denied. No token provided."
            });
        }

        const token = authHeader.split(" ")[1];
        //Verify Token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );
        //Store User Information
        req.user = decoded;
        //next() tells Express:"Authentication succeeded. Continue to the next function."
        next();

    } catch (error) {

        return res.status(401).json({
            message: "Invalid or Expired Token"
        });

    }

};

module.exports = authenticateUser;