const db = require("../db");

// ================= CREAR SOLICITUD =================
exports.crearSolicitud = async (req, res) => {
  const { nombre, correo, servicio, mensaje } = req.body;

  console.log("BODY RECIBIDO:", req.body);

  if (!nombre || !correo || !servicio || !mensaje) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  const servicio_id = parseInt(servicio, 10);

  if (isNaN(servicio_id) || servicio_id < 1) {
    return res.status(400).json({ mensaje: "ID de servicio inválido" });
  }

  try {
    const [servicioRows] = await db.query(
      "SELECT id FROM servicios WHERE id = ?",
      [servicio_id]
    );

    if (servicioRows.length === 0) {
      return res.status(404).json({ mensaje: "Servicio no existe" });
    }

    const [result] = await db.query(
      `INSERT INTO solicitudes_servicio 
        (servicio_id, nombre_contacto, correo_contacto, descripcion)
       VALUES (?, ?, ?, ?)`,
      [servicio_id, nombre, correo, mensaje]
    );

    console.log("✅ Solicitud guardada, ID:", result.insertId);
    return res.status(201).json({ mensaje: "Solicitud guardada correctamente" });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error);
    return res.status(500).json({ mensaje: "Error al guardar solicitud" });
  }
};

// ================= OBTENER SOLICITUDES =================
exports.obtenerSolicitudes = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        ss.id,
        ss.nombre_contacto,
        ss.correo_contacto,
        s.nombre  AS servicio,
        ss.descripcion
      FROM solicitudes_servicio ss
      JOIN servicios s ON ss.servicio_id = s.id
      ORDER BY ss.id DESC
    `);

    console.log("✅ Solicitudes encontradas:", results.length);
    return res.json(results);

  } catch (error) {
    console.error("❌ Error en obtenerSolicitudes:", error);
    return res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
};