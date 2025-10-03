const mysql2 = require("mysql2");
const env = require("dotenv").config();

const connection = mysql2
  .createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    decimalNumbers: true,
  })
  .promise();

module.exports = connection;