const db = require("../db");

// CREAR SOLICITUD
exports.crearSolicitud = (req, res) => {
  const { nombre, correo, servicio, mensaje } = req.body;

  if (!nombre || !correo || !servicio || !mensaje) {
    return res.status(400).json({ mensaje: "Faltan datos" });
  }

  // 🔥 IMPORTANTE: buscar ID del servicio
  const buscarServicio = "SELECT id FROM servicios WHERE nombre = ?";

  db.query(buscarServicio, [servicio], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error buscando servicio" });
    }

    if (result.length === 0) {
      return res.status(404).json({ mensaje: "Servicio no existe" });
    }

    const servicio_id = result[0].id;

    const sql = `
      INSERT INTO solicitudes_servicio 
      (servicio_id, nombre_contacto, correo_contacto, descripcion)
      VALUES (?, ?, ?, ?)
    `;

    db.query(sql, [servicio_id, nombre, correo, mensaje], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ mensaje: "Error al guardar solicitud" });
      }

      res.json({ mensaje: "Solicitud guardada correctamente" });
    });
  });
};

// OBTENER TODAS
exports.obtenerSolicitudes = (req, res) => {
  const sql = `
    SELECT s.id, sv.nombre AS servicio, s.nombre_contacto, s.estado_id, s.fecha_solicitud
    FROM solicitudes_servicio s
    JOIN servicios sv ON s.servicio_id = sv.id
    ORDER BY s.fecha_solicitud DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ mensaje: "Error al obtener solicitudes" });
    }

    res.json(results);
  });
};