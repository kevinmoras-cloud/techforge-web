const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const authRoutes = require("./routes/auth.routes");
const solicitudesRoutes = require("./routes/solicitudes.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend funcionando 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/solicitudes", solicitudesRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});