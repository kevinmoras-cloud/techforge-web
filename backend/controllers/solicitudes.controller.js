const db = require("../db");

// CREAR SOLICITUD
exports.crearSolicitud = (req, res) => {
  // El frontend envía: { nombre, correo, servicio (número), mensaje }
  const { nombre, correo, servicio, mensaje } = req.body;

  if (!nombre || !correo || !servicio || !mensaje) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  // ✅ FIX: el frontend manda el ID numérico directamente,
  //         así que validamos por ID, no por nombre
  const servicio_id = parseInt(servicio, 10);

  if (isNaN(servicio_id) || servicio_id < 1) {
    return res.status(400).json({ mensaje: "ID de servicio inválido" });
  }

  // Verificar que el servicio exista en la tabla
 const buscarServicio = "SELECT id FROM servicios WHERE id = ?";

  db.query(buscarServicio, [servicio_id], (err, result) => {
    if (err) {
      console.error("Error buscando servicio:", err);
      return res.status(500).json({ mensaje: "Error buscando servicio" });
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Servicio no existe" });
    }

    const sql = `
      INSERT INTO solicitudes_servicio 
        (servicio_id, nombre_contacto, correo_contacto, descripcion)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [servicio_id, nombre, correo, mensaje], (err) => {
      if (err) {
        console.error("Error al guardar solicitud:", err);
        return res.status(500).json({ mensaje: "Error al guardar solicitud" });
      }

      res.status(201).json({ mensaje: "Solicitud guardada correctamente" });
    });
  });
};

// OBTENER TODAS
exports.obtenerSolicitudes = (req, res) => {
  // ✅ FIX: quitado s.fecha_solicitud porque no existe en tu schema
  const sql = `
    SELECT 
      s.id,
      sv.nombre   AS servicio,
      s.nombre_contacto,
      s.correo_contacto,
      s.descripcion,
      s.estado_id
    FROM solicitudes_servicio s
    JOIN servicios sv ON s.servicio_id = sv.id
    ORDER BY s.id DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error al obtener solicitudes:", err);
      return res.status(500).json({ mensaje: "Error al obtener solicitudes" });
    }

    res.json(results);
  });
};