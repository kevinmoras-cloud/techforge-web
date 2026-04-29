const db = require("../db");

// ================= CREAR SOLICITUD =================
exports.crearSolicitud = async (req, res) => {
  const { nombre, correo, servicio, mensaje } = req.body;

  console.log("BODY RECIBIDO:", req.body);

  if (!nombre || !correo || !servicio || !mensaje) {
    return res.status(400).json({ mensaje: "Faltan datos en el formulario" });
  }

  const servicio_id = parseInt(servicio, 10);

  if (isNaN(servicio_id) || servicio_id < 1) {
    return res.status(400).json({ mensaje: "ID de servicio inválido" });
  }

  try {
    // Insertamos usando los nombres de columna correctos de tu Base de Datos:
    // nombre_contacto, correo_contacto, descripcion y estado_id (1 = Pendiente)
    const [result] = await db.query(
      `INSERT INTO solicitudes_servicio 
        (servicio_id, nombre_contacto, correo_contacto, descripcion, estado_id)
       VALUES (?, ?, ?, ?, 1)`,
      [servicio_id, nombre, correo, mensaje]
    );

    console.log("✅ Solicitud guardada, ID:", result.insertId);
    return res.status(201).json({ mensaje: "Solicitud guardada correctamente" });

  } catch (error) {
    console.error("❌ Error en crearSolicitud:", error);
    return res.status(500).json({ mensaje: "Error al guardar solicitud" });
  }
};

// ================= OBTENER SOLICITUDES (Corregido para tu Panel Admin) =================
exports.obtenerSolicitudes = async (req, res) => {
  try {
    const [results] = await db.query(`
      SELECT 
        ss.id,
        ss.nombre_contacto,
        ss.correo_contacto,
        ss.estado_id,
        est.nombre AS estado_nombre,
        ss.servicio_id,
        s.nombre AS servicio_nombre,
        ss.descripcion
      FROM solicitudes_servicio ss
      LEFT JOIN servicios s ON ss.servicio_id = s.id
      LEFT JOIN estados_servicio est ON ss.estado_id = est.id
      ORDER BY ss.id DESC
    `);

    return res.json(results);
  } catch (error) {
    console.error("❌ Error en obtenerSolicitudes:", error);
    return res.status(500).json({ mensaje: "Error al obtener solicitudes" });
  }
};

// ================= ACTUALIZAR ESTADO DE SOLICITUD =================
exports.actualizarEstado = async (req, res) => {
  const { id } = req.params;
  const { estado_id } = req.body; // Ahora usamos estado_id (numérico)

  if (!estado_id) {
    return res.status(400).json({ mensaje: "Falta el estado_id" });
  }

  try {
    const [rows] = await db.query(
      "SELECT id FROM solicitudes_servicio WHERE id = ?", [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Solicitud no encontrada" });
    }

    await db.query(
      "UPDATE solicitudes_servicio SET estado_id = ? WHERE id = ?", [estado_id, id]
    );
    return res.json({ mensaje: "Estado actualizado con éxito" });
  } catch (error) {
    console.error("❌ Error en actualizarEstado:", error);
    return res.status(500).json({ mensaje: "Error al actualizar estado" });
  }
};