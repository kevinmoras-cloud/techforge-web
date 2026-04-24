const express = require("express");
const router = express.Router();
const controller = require("../controllers/solicitudes.controller");

router.post("/", controller.crearSolicitud);
router.get("/", controller.obtenerSolicitudes);

module.exports = router;