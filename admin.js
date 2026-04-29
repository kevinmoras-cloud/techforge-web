const API_BASE = "http://localhost:3000";

// ══════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ Admin panel iniciado");
  verificarAcceso();
  mostrarNombreAdmin();
  inicializarNav();
  cargarSolicitudes();
  cargarProductos();
  cargarCategorias();

  document.getElementById("btnCerrarSesion")?.addEventListener("click", cerrarSesion);
  document.getElementById("btnNuevoProducto")?.addEventListener("click", abrirModalNuevo);
  document.getElementById("cerrarModal")?.addEventListener("click", cerrarModal);
  document.getElementById("cancelarModal")?.addEventListener("click", cerrarModal);
  document.getElementById("guardarProducto")?.addEventListener("click", guardarProducto);
});

// ══════════════════════════════════════════
//  FUNCIONES DE SESIÓN
// ══════════════════════════════════════════
function verificarAcceso() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  if (!usuario || usuario.rol_id !== 3) {
    alert("Acceso denegado. Inicia sesión como administrador.");
    window.location.href = "index.html";
  }
}

function mostrarNombreAdmin() {
  const usuario = JSON.parse(localStorage.getItem("usuario") || "null");
  const el = document.getElementById("adminNombre");
  if (el && usuario) el.textContent = usuario.nombre;
}

function cerrarSesion() {
  localStorage.removeItem("usuario");
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// ══════════════════════════════════════════
//  NAVEGACIÓN
// ══════════════════════════════════════════
function inicializarNav() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
      document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
      item.classList.add("active");
      document.getElementById(`page-${item.dataset.page}`)?.classList.add("active");
    });
  });
}

// ══════════════════════════════════════════
//  SOLICITUDES ✅ CONFLICTO RESUELTO
// ══════════════════════════════════════════
async function cargarSolicitudes() {
  const tbody = document.getElementById("tablaSolicitudes");
  const badge = document.getElementById("totalSolicitudes");

  try {
    console.log("📥 Cargando solicitudes desde:", `${API_BASE}/api/solicitudes`);
    
    const res = await fetch(`${API_BASE}/api/solicitudes`);
    console.log("📡 Respuesta status:", res.status);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log("✅ Solicitudes recibidas:", data.length);

    if (badge) badge.textContent = `${data.length} solicitud${data.length !== 1 ? "es" : ""}`;
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--text-secondary)">No hay solicitudes registradas</td></tr>`;
      return;
    }

    // ✅ Versión segura con fallbacks para campos opcionales
    tbody.innerHTML = data.map(s => `
      <tr>
        <td>${s.id}</td>
        <td>${s.nombre_contacto || "—"}</td>
        <td>${s.correo_contacto || "—"}</td>
        <td><span class="badge badge-blue">${s.servicio_nombre || s.servicio || "—"}</span></td>
        <td class="text-truncate" title="${s.descripcion || ""}">${s.descripcion || "—"}</td>
      </tr>
    `).join("");

  } catch (err) {
    console.error("❌ Error cargando solicitudes:", err);
    if (tbody) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:2rem;color:var(--danger)">Error al cargar. Verifica que el backend esté corriendo en ${API_BASE}</td></tr>`;
    }
  }
}

// ══════════════════════════════════════════
//  CATEGORÍAS
// ══════════════════════════════════════════
async function cargarCategorias() {
  try {
    const res = await fetch(`${API_BASE}/api/productos/categorias`);
    if (!res.ok) return;
    const data = await res.json();

    const select = document.getElementById("pCategoria");
    if (!select) return;

    select.innerHTML = '<option value="">Seleccionar categoría...</option>' + 
      data.map(c => `<option value="${c.id}">${c.nombre}</option>`).join("");
  } catch (err) {
    console.error("❌ Error categorías:", err);
  }
}

// ══════════════════════════════════════════
//  PRODUCTOS - LISTAR
// ══════════════════════════════════════════
async function cargarProductos() {
  const tbody = document.getElementById("tablaProductos");
  const badge = document.getElementById("totalProductos");

  try {
    const res = await fetch(`${API_BASE}/api/productos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    const activos = data.filter(p => p.estado === "activo");
    if (badge) badge.textContent = `${activos.length} producto${activos.length !== 1 ? "s" : ""}`;
    if (!tbody) return;

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-secondary)">No hay productos</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(p => {
      const stockClass = p.stock <= 0 ? "status-inactive" : p.stock <= 5 ? "stock-low" : "status-active";
      const stockText = p.stock <= 0 ? "Agotado" : p.stock <= 5 ? `Bajo: ${p.stock}` : `${p.stock} disp.`;
      
      return `
        <tr data-id="${p.id}">
          <td>#${p.id}</td>
          <td style="font-weight:600">${p.nombre}</td>
          <td><span class="badge badge-blue">${p.categoria_nombre || p.categoria || "—"}</span></td>
          <td style="font-family:var(--font-mono)">$${Number(p.precio).toLocaleString("es-CO")}</td>
          <td><span class="stock-badge ${stockClass}">${stockText}</span></td>
          <td><span class="badge ${p.estado === "activo" ? "badge-green" : "badge-gray"}">${p.estado}</span></td>
          <td>
            <div class="actions-cell">
              <button class="btn btn-edit btn-sm" onclick="window.abrirModalEditar(${p.id})">✏</button>
              <button class="btn btn-delete btn-sm" onclick="window.confirmarEliminar(${p.id}, '${p.nombre.replace(/'/g, "\\'")}')">🗑</button>
            </div>
          </td>
        </tr>`;
    }).join("");

  } catch (err) {
    console.error("❌ Error productos:", err);
    if (tbody) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--danger)">Error de conexión. Backend en ${API_BASE}</td></tr>`;
  }
}

// ══════════════════════════════════════════
//  MODAL - ABRIR/CERRAR
// ══════════════════════════════════════════
function abrirModalNuevo() {
  limpiarFormulario();
  document.getElementById("modalTitulo").textContent = "Nuevo producto";
  document.getElementById("estadoGroup").style.display = "none";
  document.getElementById("modalProducto").classList.add("open");
  document.getElementById("pNombre")?.focus();
}

async function abrirModalEditar(id) {
  console.log("🔍 Editando producto ID:", id);
  
  try {
    const res = await fetch(`${API_BASE}/api/productos/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const p = await res.json();

    console.log("📦 Datos recibidos:", p);

    document.getElementById("productoId").value = p.id || "";
    document.getElementById("pNombre").value = p.nombre || "";
    document.getElementById("pDescripcion").value = p.descripcion || "";
    document.getElementById("pPrecio").value = p.precio || "";
    document.getElementById("pStock").value = p.stock ?? 0;
    document.getElementById("pImagen").value = p.imagen || "";
    document.getElementById("pEstado").value = p.estado || "activo";

    const selectCat = document.getElementById("pCategoria");
    if (selectCat && p.categoria_id) {
      selectCat.value = p.categoria_id;
    }

    document.getElementById("modalTitulo").textContent = "Editar producto";
    document.getElementById("estadoGroup").style.display = "flex";
    document.getElementById("modalProducto").classList.add("open");

  } catch (err) {
    console.error("❌ Error al cargar producto:", err);
    toast(`Error: ${err.message}`, "error");
  }
}

function cerrarModal() {
  document.getElementById("modalProducto").classList.remove("open");
  limpiarFormulario();
}

function limpiarFormulario() {
  ["productoId","pNombre","pDescripcion","pPrecio","pStock","pImagen"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = id === "pStock" ? "0" : "";
  });
  const select = document.getElementById("pCategoria");
  if (select) select.selectedIndex = 0;
}

// ══════════════════════════════════════════
//  GUARDAR PRODUCTO ✅ SIN precio_anterior
// ══════════════════════════════════════════
async function guardarProducto() {
  const id = document.getElementById("productoId")?.value;
  const nombre = document.getElementById("pNombre")?.value.trim();
  const descripcion = document.getElementById("pDescripcion")?.value.trim();
  const precio = document.getElementById("pPrecio")?.value;
  const stock = document.getElementById("pStock")?.value || "0";
  const imagen = document.getElementById("pImagen")?.value.trim();
  const categoria_id = document.getElementById("pCategoria")?.value;
  const estado = document.getElementById("pEstado")?.value || "activo";

  console.log("💾 Guardando producto:", { id, nombre, precio, categoria_id });

  // Validaciones
  if (!nombre) return toast("El nombre es obligatorio", "error");
  if (!precio || isNaN(precio) || Number(precio) < 0) return toast("Precio inválido", "error");
  if (!categoria_id) return toast("Selecciona una categoría", "error");

  const body = {
    nombre,
    descripcion: descripcion || null,
    precio: Number(precio),
    stock: Number(stock),
    imagen: imagen || null,
    categoria_id: Number(categoria_id),
    estado
  };

  const url = id ? `${API_BASE}/api/productos/${id}` : `${API_BASE}/api/productos`;
  const method = id ? "PUT" : "POST";

  try {
    console.log(`📤 ${method} ${url}`, body);
    
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    console.log(`📥 Respuesta ${res.status}:`, data);

    if (!res.ok) {
      throw new Error(data.mensaje || data.error || `HTTP ${res.status}`);
    }

    toast(id ? "✓ Producto actualizado" : "✓ Producto creado", "success");
    cerrarModal();
    await cargarProductos();

  } catch (err) {
    console.error("❌ Error guardando:", err);
    toast(err.message || "Error al guardar", "error");
  }
}

// ══════════════════════════════════════════
//  ELIMINAR PRODUCTO
// ══════════════════════════════════════════
function confirmarEliminar(id, nombre) {
  if (!confirm(`¿Eliminar "${nombre}"?`)) return;
  eliminarProducto(id);
}

async function eliminarProducto(id) {
  try {
    const res = await fetch(`${API_BASE}/api/productos/${id}`, { method: "DELETE" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) throw new Error(data.mensaje || `HTTP ${res.status}`);

    toast("✓ Producto eliminado", "success");
    await cargarProductos();

  } catch (err) {
    console.error("❌ Error eliminando:", err);
    toast(err.message || "Error al eliminar", "error");
  }
}

// ══════════════════════════════════════════
//  TOAST
// ══════════════════════════════════════════
let toastTimer = null;

function toast(msg, type = "success") {
  const el = document.getElementById("toast");
  if (!el) {
    console.log(`[TOAST] ${type}: ${msg}`);
    alert(msg);
    return;
  }

  const classMap = { ok: "success", err: "error", success: "success", error: "error" };
  el.textContent = msg;
  el.className = `show ${classMap[type] || type}`;

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { el.className = ""; }, 3000);
}

// ══════════════════════════════════════════
//  EXPORTAR FUNCIONES GLOBALES
// ══════════════════════════════════════════
window.abrirModalEditar = abrirModalEditar;
window.confirmarEliminar = confirmarEliminar;