const mysql = require("mysql2/promise");
require("dotenv").config();

async function createDatabase() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || "mysql-32c01c83-rohithambati5-578a.g.aivencloud.com",
            user: process.env.DB_USER || "avnadmin",
            password: process.env.DB_PASSWORD
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