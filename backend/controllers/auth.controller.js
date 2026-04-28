const db = require("../db");
const bcrypt = require("bcrypt");

// ================= REGISTRO =================
exports.register = async (req, res) => {
  const { nombre, telefono, correo, direccion, password } = req.body;

  if (!nombre || !telefono || !correo || !direccion || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO usuarios (nombre, telefono, correo, direccion, password)
      VALUES (?, ?, ?, ?, ?)
    `;

    await db.query(sql, [nombre, telefono, correo, direccion, hash]);

    res.json({ mensaje: "Usuario registrado" });

  } catch (error) {
    console.error(error);
    res.status(400).json({ mensaje: "Correo ya existe o error en BD" });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  const { correo, password } = req.body;

  if (!correo || !password) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  try {
    const [rows] = await db.query(
      "SELECT * FROM usuarios WHERE correo = ?",
      [correo]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        rol_id: usuario.rol_id,
      },
      token: "fake-token",
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
};