const API_BASE = "http://localhost:3000";

let todasLasSolicitudes = [];
let filtroActual = "todas";
let toastTimer = null;

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  mostrarNombreTecnico();
  cargarSolicitudes();

  document.getElementById("btnSalir")?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // Filtros
  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filtro-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filtroActual = btn.dataset.filtro;
      renderSolicitudes();
    });
  });
});

// ══════════════════════════════════════════
//  ACCESO
// ══════════════════════════════════════════
function verificarAcceso() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario || usuario.rol_id !== 2) {
    alert("Acceso denegado. Debes iniciar sesión como técnico.");
    window.location.href = "index.html";
  }
}

function mostrarNombreTecnico() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const el = document.getElementById("techNombre");
  if (el && usuario) el.textContent = `🔧 ${usuario.nombre}`;
}

// ══════════════════════════════════════════
//  CARGAR SOLICITUDES
// ══════════════════════════════════════════
async function cargarSolicitudes() {
  const grid = document.getElementById("solicitudesGrid");

  try {
    const res = await fetch(`${API_BASE}/api/solicitudes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    todasLasSolicitudes = await res.json();

    actualizarStats();
    renderSolicitudes();
  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <p class="empty-title">Error al cargar solicitudes</p>
        <p class="empty-sub">Verifica que el servidor esté corriendo</p>
      </div>`;
  }
}

// ══════════════════════════════════════════
//  ESTADÍSTICAS
// ══════════════════════════════════════════
function actualizarStats() {
  const contar = (estado) =>
    todasLasSolicitudes.filter((s) => s.estado === estado).length;

  document.getElementById("statPendiente").textContent  = contar("pendiente");
  document.getElementById("statEnProceso").textContent  = contar("en_proceso");
  document.getElementById("statFinalizada").textContent = contar("finalizada");
  document.getElementById("statCancelada").textContent  = contar("cancelada");
}

// ══════════════════════════════════════════
//  RENDER CARDS
// ══════════════════════════════════════════
function renderSolicitudes() {
  const grid = document.getElementById("solicitudesGrid");

  const lista = filtroActual === "todas"
    ? todasLasSolicitudes
    : todasLasSolicitudes.filter((s) => s.estado === filtroActual);

  if (lista.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <p class="empty-title">No hay solicitudes</p>
        <p class="empty-sub">${filtroActual === "todas" ? "Aún no se han registrado solicitudes." : `No hay solicitudes con estado "${filtroActual}".`}</p>
      </div>`;
    return;
  }

  grid.innerHTML = lista.map((s) => crearCardHTML(s)).join("");
}

function crearCardHTML(s) {
  const estadoLabel = {
    pendiente:  "⏳ Pendiente",
    en_proceso: "🔧 En proceso",
    finalizada: "✅ Finalizada",
    cancelada:  "🚫 Cancelada",
  };

  return `
    <div class="solicitud-card ${s.estado}" id="card-${s.id}">

      <div class="card-top">
        <span class="solicitud-id">#${s.id}</span>
        <span class="estado-badge badge-${s.estado}">${estadoLabel[s.estado] || s.estado}</span>
      </div>

      <div class="card-body">
        <p class="cliente-nombre">${s.nombre_contacto || "Sin nombre"}</p>
        <p class="cliente-correo">✉ ${s.correo_contacto || "—"}</p>
        <span class="servicio-tag">🛠 ${s.servicio_nombre || "Servicio #" + s.servicio_id}</span>
        <div class="descripcion">${s.descripcion || "Sin descripción"}</div>
      </div>

      <div class="estado-select-wrap">
        <span class="estado-select-label">Actualizar estado</span>
        <select class="estado-select" id="select-${s.id}">
          <option value="pendiente"  ${s.estado === "pendiente"  ? "selected" : ""}>⏳ Pendiente</option>
          <option value="en_proceso" ${s.estado === "en_proceso" ? "selected" : ""}>🔧 En proceso</option>
          <option value="finalizada" ${s.estado === "finalizada" ? "selected" : ""}>✅ Finalizada</option>
          <option value="cancelada"  ${s.estado === "cancelada"  ? "selected" : ""}>🚫 Cancelada</option>
        </select>
      </div>

      <button class="btn-actualizar" onclick="actualizarEstado(${s.id})">
        Guardar cambio
      </button>

    </div>`;
}

// ══════════════════════════════════════════
//  ACTUALIZAR ESTADO
// ══════════════════════════════════════════
async function actualizarEstado(id) {
  const select = document.getElementById(`select-${id}`);
  const btn    = document.querySelector(`#card-${id} .btn-actualizar`);
  const nuevoEstado = select?.value;

  if (!nuevoEstado) return;

  btn.disabled = true;
  btn.textContent = "Guardando...";

  try {
    const res = await fetch(`${API_BASE}/api/solicitudes/${id}/estado`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });

    const data = await res.json();

    if (!res.ok) {
      toast(data.mensaje || "Error al actualizar", "err");
      btn.disabled = false;
      btn.textContent = "Guardar cambio";
      return;
    }

    // Actualizar localmente sin recargar todo
    const idx = todasLasSolicitudes.findIndex((s) => s.id === id);
    if (idx !== -1) todasLasSolicitudes[idx].estado = nuevoEstado;

    actualizarStats();
    renderSolicitudes();
    toast("Estado actualizado ✓", "ok");

  } catch (err) {
    console.error("Error actualizando estado:", err);
    toast("No se pudo conectar con el servidor", "err");
    btn.disabled = false;
    btn.textContent = "Guardar cambio";
  }
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
function toast(msg, type = "ok") {
  const el = document.getElementById("toast");
  if (!el) return;
  el.textContent = msg;
  el.className = `show ${type}`;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ""; }, 3000);
}