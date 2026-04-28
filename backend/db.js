const mysql = require("mysql2/promise"); // ← /promise al final
require("dotenv").config();

const db = mysql.createPool({
  host:     process.env.DB_HOST     || "localhost",
  user:     process.env.DB_USER     || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME     || "techforge",
  waitForConnections: true,
  connectionLimit: 10,
});

db.getConnection()
  .then(conn => {
    console.log("✅ Pool MySQL conectado →", process.env.DB_NAME);
    conn.release();
  })
  .catch(err => console.error("❌ Error MySQL:", err.message));

module.exports = db;