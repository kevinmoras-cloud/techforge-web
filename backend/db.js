const mysql = require("mysql2");
require("dotenv").config();

// Crear conexión
const conexion = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "techforge"
});

// Conectar
conexion.connect((err) => {
  if (err) {
    console.error("❌ Error de conexión a MySQL:", err.message);
    return;
  }
  console.log("✅ Conectado a MySQL → BD:", conexion.config.database);
});

module.exports = conexion;