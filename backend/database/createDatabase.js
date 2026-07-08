const mysql = require("mysql2/promise");
require("dotenv").config();

async function createDatabase() {
    try {
       const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: {
        rejectUnauthorized: false
    }
});

        await connection.query(
            `CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`
        );

        console.log("✅ Database Created");

        await connection.end();

    } catch (error) {
        console.log(error);
    }
}

module.exports = createDatabase;