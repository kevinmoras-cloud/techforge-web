const express = require("express");
const router = express.Router();

const solicitudesController = require("../controllers/solicitudes.controller");

router.post("/", solicitudesController.crearSolicitud);

router.get("/usuario/:id", solicitudesController.obtenerSolicitudesPorUsuario);

router.get("/", solicitudesController.obtenerSolicitudes);


router.patch("/:id/estado", solicitudesController.actualizarEstado);

module.exports = router;