const API_BASE = "http://localhost:3000";

document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  mostrarNombreAdmin();
  cargarSolicitudes();

  document.getElementById("btnCerrarSesion")?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });
});

// ── Bloquear acceso si no es admin ──
function verificarAcceso() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");

  if (!usuario || usuario.rol_id !== 3) {
    alert("Acceso denegado. Debes iniciar sesión como administrador.");
    window.location.href = "index.html";
  }
}

// ── Mostrar nombre en el header ──
function mostrarNombreAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const titulo = document.getElementById("adminNombre");
  if (titulo && usuario) {
    titulo.textContent = `Bienvenido, ${usuario.nombre}`;
  }
}

// ── Cargar solicitudes desde el backend ──
async function cargarSolicitudes() {
  const tbody = document.getElementById("tablaSolicitudes");
  const badge = document.getElementById("totalSolicitudes");

  try {
    const response = await fetch(`${API_BASE}/api/solicitudes`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Actualizar badge
    if (badge) badge.textContent = `${data.length} solicitud${data.length !== 1 ? "es" : ""}`;

    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-msg">No hay solicitudes registradas aún.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = data.map((s) => `
      <tr>
        <td>${s.id}</td>
        <td>${s.nombre_contacto}</td>
        <td>${s.correo_contacto}</td>
        <td><span class="servicio-badge">${s.servicio}</span></td>
        <td>${s.descripcion}</td>
      </tr>
    `).join("");

  } catch (error) {
    console.error("Error cargando solicitudes:", error);
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="empty-msg">Error al cargar solicitudes. Verifica que el servidor esté corriendo.</td>
        </tr>`;
    }
  }
}