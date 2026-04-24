const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= REGISTRO =================
exports.register = (req, res) => {
  const { nombre, telefono, correo, direccion, password } = req.body;

  if (!nombre || !telefono || !correo || !direccion || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) return res.status(500).json({ mensaje: "Error en hash" });

    const sql = `
      INSERT INTO usuarios (nombre, telefono, correo, direccion, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    db.query(sql, [nombre, telefono, correo, direccion, hash], (err) => {
      if (err) {
        console.log(err);
        return res.status(400).json({ mensaje: "Correo ya existe" });
      }

      res.json({ mensaje: "Usuario registrado" });
    });
  });
};

// ================= LOGIN =================
exports.login = (req, res) => {
  const { correo, password } = req.body;

  const sql = "SELECT * FROM usuarios WHERE correo = ?";

  db.query(sql, [correo], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error servidor" });
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = jwt.sign({ id: user.id }, "secreto", { expiresIn: "1h" });

    res.json({
      mensaje: "Login exitoso",
      token,
      usuario: {
        id: user.id,
        nombre: user.nombre,
        correo: user.correo,
        rol_id: user.rol_id
      }
    });
  });
};