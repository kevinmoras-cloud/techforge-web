const API_BASE = "http://localhost:3000";

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  verificarAcceso();
  mostrarNombreAdmin();
  inicializarNav();

  cargarSolicitudes();
  cargarProductos();
  cargarCategorias();

  document.getElementById("btnCerrarSesion")?.addEventListener("click", () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    window.location.href = "index.html";
  });

  // Modal producto
  document.getElementById("btnNuevoProducto")?.addEventListener("click", abrirModalNuevo);
  document.getElementById("cerrarModal")?.addEventListener("click",    cerrarModal);
  document.getElementById("cancelarModal")?.addEventListener("click",  cerrarModal);
  document.getElementById("guardarProducto")?.addEventListener("click", guardarProducto);
});

// ══════════════════════════════════════════
//  NAVEGACIÓN SIDEBAR
// ══════════════════════════════════════════
function inicializarNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach((n) => n.classList.remove("active"));
      document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(`page-${item.dataset.page}`)?.classList.add("active");
    });
  });
}

// ══════════════════════════════════════════
//  ACCESO / SESIÓN
// ══════════════════════════════════════════
function verificarAcceso() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario || usuario.rol_id !== 3) {
    alert("Acceso denegado. Debes iniciar sesión como administrador.");
    window.location.href = "index.html";
  }
}

function mostrarNombreAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const el = document.getElementById("adminNombre");
  if (el && usuario) el.textContent = usuario.nombre;
}

// ══════════════════════════════════════════
//  SOLICITUDES
// ══════════════════════════════════════════
async function cargarSolicitudes() {
  const tbody = document.getElementById("tablaSolicitudes");
  const badge = document.getElementById("totalSolicitudes");

  try {
    const res  = await fetch(`${API_BASE}/api/solicitudes`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (badge) badge.textContent = `${data.length} solicitud${data.length !== 1 ? "es" : ""}`;

    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">No hay solicitudes registradas aún.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((s) => `
      <tr>
        <td>${s.id}</td>
        <td>${s.nombre_contacto}</td>
        <td>${s.correo_contacto}</td>
        <td><span class="badge badge-blue">${s.servicio_nombre || s.servicio || "—"}</span></td>
        <td>${s.descripcion}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("Error cargando solicitudes:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-msg">Error al cargar solicitudes. Verifica que el servidor esté corriendo.</td></tr>`;
    }
  }
}

// ══════════════════════════════════════════
//  CATEGORÍAS (para el <select> del modal)
// ══════════════════════════════════════════
async function cargarCategorias() {
  try {
    const res  = await fetch(`${API_BASE}/api/productos/categorias`);
    if (!res.ok) return;
    const data = await res.json();

    const select = document.getElementById("pCategoria");
    if (!select) return;

    select.innerHTML = data.map((c) => `<option value="${c.id}">${c.nombre}</option>`).join("");
  } catch (err) {
    console.error("Error cargando categorías:", err);
  }
}

// ══════════════════════════════════════════
//  PRODUCTOS — LISTAR
// ══════════════════════════════════════════
async function cargarProductos() {
  const tbody = document.getElementById("tablaProductos");
  const badge = document.getElementById("totalProductos");

  try {
    const res  = await fetch(`${API_BASE}/api/productos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const activos = data.filter((p) => p.estado === "activo");
    if (badge) badge.textContent = `${activos.length} producto${activos.length !== 1 ? "s" : ""}`;

    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-msg">No hay productos registrados aún.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map((p) => {
      const stockBadge = p.stock === 0
        ? `<span class="stock-num stock-zero">0 — Agotado</span>`
        : `<span class="stock-num stock-ok">${p.stock}</span>`;

      const estadoBadge = p.estado === "activo"
        ? `<span class="badge badge-green">Activo</span>`
        : `<span class="badge badge-gray">Inactivo</span>`;

      return `
        <tr data-id="${p.id}">
          <td>${p.id}</td>
          <td style="font-weight:700;color:var(--text);">${p.nombre}</td>
          <td><span class="badge badge-blue">${p.categoria || "—"}</span></td>
          <td style="font-family:'Space Mono',monospace;">$${Number(p.precio).toLocaleString("es-CO")}</td>
          <td>${stockBadge}</td>
          <td>${estadoBadge}</td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-edit btn-sm" onclick="abrirModalEditar(${p.id})">✏ Editar</button>
              <button class="btn btn-del  btn-sm" onclick="confirmarEliminar(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')">🗑 Eliminar</button>
            </div>
          </td>
        </tr>`;
    }).join("");

  } catch (err) {
    console.error("Error cargando productos:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-msg">Error al cargar productos. Verifica que el servidor esté corriendo.</td></tr>`;
    }
  }
}

// ══════════════════════════════════════════
//  MODAL — ABRIR / CERRAR
// ══════════════════════════════════════════
function abrirModalNuevo() {
  limpiarFormulario();
  document.getElementById("modalTitulo").textContent  = "Nuevo producto";
  document.getElementById("estadoGroup").style.display = "none";
  document.getElementById("modalProducto").classList.add("open");
}

function abrirModalEditar(id) {
  // Obtener datos frescos del endpoint individual
  fetch(`${API_BASE}/api/productos/${id}`)
    .then((r) => {
      if (!r.ok) throw new Error("Producto no encontrado");
      return r.json();
    })
    .then((p) => {
      document.getElementById("productoId").value   = p.id;
      document.getElementById("pNombre").value       = p.nombre;
      document.getElementById("pDescripcion").value  = p.descripcion || "";
      document.getElementById("pPrecio").value        = p.precio;
      document.getElementById("pPrecioAnterior").value = p.precio_anterior || "";
      document.getElementById("pStock").value         = p.stock;
      document.getElementById("pImagen").value        = p.imagen || "";
      document.getElementById("pEstado").value        = p.estado;

      // Seleccionar categoría por nombre (la API retorna nombre, no id al listar)
      // Si usamos el endpoint /:id recibimos categoria_id directamente
      const selectCat = document.getElementById("pCategoria");
      if (p.categoria_id) {
        selectCat.value = p.categoria_id;
      } else {
        // Fallback: buscar por nombre en las opciones
        for (const opt of selectCat.options) {
          if (opt.text === p.categoria) { opt.selected = true; break; }
        }
      }

      document.getElementById("modalTitulo").textContent   = "Editar producto";
      document.getElementById("estadoGroup").style.display = "flex";
      document.getElementById("modalProducto").classList.add("open");
    })
    .catch(() => toast("Error al cargar datos del producto", "err"));
}

function cerrarModal() {
  document.getElementById("modalProducto").classList.remove("open");
  limpiarFormulario();
}

function limpiarFormulario() {
  ["productoId","pNombre","pDescripcion","pPrecio","pPrecioAnterior","pStock","pImagen"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

// ══════════════════════════════════════════
//  PRODUCTOS — GUARDAR (crear o actualizar)
// ══════════════════════════════════════════
async function guardarProducto() {
  const id             = document.getElementById("productoId").value;
  const nombre         = document.getElementById("pNombre").value.trim();
  const descripcion    = document.getElementById("pDescripcion").value.trim();
  const precio         = document.getElementById("pPrecio").value;
  const precioAnterior = document.getElementById("pPrecioAnterior").value || null;
  const stock          = document.getElementById("pStock").value || "0";
  const imagen         = document.getElementById("pImagen").value.trim();
  const categoria_id   = document.getElementById("pCategoria").value;
  const estado         = document.getElementById("pEstado")?.value || "activo";

  if (!nombre || !precio || !categoria_id) {
    toast("Completa los campos obligatorios (nombre, precio, categoría)", "err");
    return;
  }

  const body = { nombre, descripcion, precio, precio_anterior: precioAnterior, stock, imagen, categoria_id, estado };

  const url    = id ? `${API_BASE}/api/productos/${id}` : `${API_BASE}/api/productos`;
  const method = id ? "PUT" : "POST";

  try {
    const res  = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();

    if (!res.ok) {
      toast(data.mensaje || "Error al guardar", "err");
      return;
    }

    toast(id ? "Producto actualizado ✓" : "Producto creado ✓", "ok");
    cerrarModal();
    cargarProductos();

  } catch (err) {
    console.error("Error guardando producto:", err);
    toast("No se pudo conectar con el servidor", "err");
  }
}

// ══════════════════════════════════════════
//  PRODUCTOS — ELIMINAR
// ══════════════════════════════════════════
function confirmarEliminar(id, nombre) {
  if (!confirm(`¿Eliminar el producto "${nombre}"? Quedará marcado como inactivo.`)) return;
  eliminarProducto(id);
}

async function eliminarProducto(id) {
  try {
    const res  = await fetch(`${API_BASE}/api/productos/${id}`, { method: "DELETE" });
    const data = await res.json();

    if (!res.ok) {
      toast(data.mensaje || "Error al eliminar", "err");
      return;
    }

    toast("Producto eliminado ✓", "ok");
    cargarProductos();

  } catch (err) {
    console.error("Error eliminando producto:", err);
    toast("No se pudo conectar con el servidor", "err");
  }
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
let toastTimer = null;

function toast(msg, type = "ok") {
  const el = document.getElementById("toast");
  if (!el) return;

  el.textContent = msg;
  el.className   = `show ${type}`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ""; }, 3200);
}