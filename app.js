const API_BASE = "http://localhost:3000";

// ══════════════════════════════════════════
//  UTILIDADES
// ══════════════════════════════════════════
function getServiceInput() {
  return document.getElementById("servicio");
}

const SERVICE_MAP = {
  Ensamble: 1,
  "Ensamble de PC": 1,
  Reparación: 2,
  "Reparación de Computadores": 2,
  Mantenimiento: 3,
  "Mantenimiento Preventivo": 3,
};

function setSelectedService(servicio) {
  const input = getServiceInput();
  const id = SERVICE_MAP[servicio] || null;
  if (!id) return;

  localStorage.setItem("servicioSeleccionado", String(id));
  if (input) input.value = String(id);
}

// ══════════════════════════════════════════
//  RENDER PRODUCTOS (landing dinámica)
// ══════════════════════════════════════════
function renderTarjetaProducto(p) {
  const agotado = p.stock === 0;

  return `
    <article class="product-card">

      <div class="pc-img-wrap">
        <img src="imagenes/${p.imagen}" 
             alt="${p.nombre}" 
             onerror="this.src='https://placehold.co/400x400?text=Sin+imagen'">
      </div>

      <div class="pc-body">

        <span class="pc-category">Producto</span>

        <h3 class="pc-name">${p.nombre}</h3>

        <p class="pc-desc">${p.descripcion || ""}</p>

        <div class="pc-price-row">
          <span class="pc-price">$${Number(p.precio).toLocaleString("es-CO")}</span>
        </div>

        <div class="pc-stock-row">
          <span class="pc-stock-dot 
            ${agotado ? "pc-stock-dot--out" : p.stock <= 5 ? "pc-stock-dot--low" : ""}">
          </span>

          <span class="pc-stock-label">
            ${agotado ? "Agotado" : `${p.stock} disponibles`}
          </span>
        </div>

        <button class="pc-btn" 
           ${agotado ? "disabled" : ""}
           onclick="window.location.href='https://wa.me/573176065800'">
          ${agotado ? "No disponible" : "Cotizar"}
        </button>

      </div>

    </article>
  `;
}

async function cargarProductosLanding() {
  const container = document.getElementById("productosContainer");
  if (!container) return;

  container.innerHTML = `<div class="productos-loading">Cargando productos…</div>`;

  try {
    const res = await fetch(`${API_BASE}/api/productos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const productos = await res.json();

    const activos = productos.filter((p) => p.estado === "activo");

    if (activos.length === 0) {
      container.innerHTML = `<p class="productos-empty">No hay productos disponibles en este momento.</p>`;
      return;
    }

    container.innerHTML = activos.map(renderTarjetaProducto).join("");

  } catch (err) {
    console.error("Error cargando productos:", err);
    container.innerHTML = `<p class="productos-empty">No se pudo cargar el catálogo. Intenta más tarde.</p>`;
  }
}

// ══════════════════════════════════════════
//  DOM READY
// ══════════════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
// 👤 CAMBIAR BOTÓN SI HAY SESIÓN
const usuarioGuardado = localStorage.getItem("usuario");
const btnUsuario = document.getElementById("btnUsuario");

if (usuarioGuardado && btnUsuario) {
  const usuario = JSON.parse(usuarioGuardado);

  btnUsuario.innerHTML = `${usuario.nombre} ▼`;

  // 🚨 QUITAR evento de abrir login
  btnUsuario.removeEventListener("click", openModal);

  // 👇 NUEVO comportamiento
  btnUsuario.onclick = () => {
    const confirmar = confirm("¿Cerrar sesión?");
    if (confirmar) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("usuarioId");
      location.reload();
    }
  };
}
  // Cargar productos dinámicos
  cargarProductosLanding();

  // ─── Modal de autenticación ───
  const loginBtn = document.querySelector(".btn-login");
  const modal = document.getElementById("auth-modal");
  const closeBtn = document.querySelector(".auth-close");
  const overlay = document.querySelector(".auth-overlay");
  const tabs = document.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const form = document.getElementById("formContacto");
  const servicioInput = getServiceInput();

  const servicioGuardado = localStorage.getItem("servicioSeleccionado");
  if (servicioInput && servicioGuardado) {
    servicioInput.value = servicioGuardado;
  }

  function openModal() {
    if (!modal) return;
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (loginForm) loginForm.reset();
    if (registerForm) registerForm.reset();
    clearErrors(registerForm);
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  if (loginBtn) loginBtn.addEventListener("click", openModal);
  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (overlay)  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      if (loginForm) loginForm.reset();
      if (registerForm) registerForm.reset();
      clearErrors(registerForm);

      if (loginForm)    loginForm.style.display    = tab.dataset.tab === "login"    ? "flex" : "none";
      if (registerForm) registerForm.style.display = tab.dataset.tab === "register" ? "flex" : "none";
    });
  });

  // ─── Login ───
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const correo   = document.getElementById("login-email")?.value.trim() || "";
      const password = document.getElementById("login-password")?.value     || "";

      if (!correo || !password) { alert("Completa el correo y la contraseña."); return; }

      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, password }),
        });

        const data = await response.json();

        if (!response.ok) { alert(data.mensaje || "Error al iniciar sesión"); return; }

        localStorage.setItem("token", data.token || "");
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        localStorage.setItem("usuarioId", data.usuario.id);

        if (data.usuario?.rol_id === 3) {
        window.location.href = "admin.html";
        } else if (data.usuario?.rol_id === 2) {
        window.location.href = "tecnico.html";
        } else {
        location.reload(); // 👈 ESTA ES LA CLAVE
        }

        loginForm.reset();
        closeModal();
      } catch (error) {
        console.error("Error login:", error);
        alert("No se pudo conectar con el servidor");
      }
    });
  }

  // ─── Registro ───
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      clearErrors(registerForm);

      const nombre    = document.getElementById("reg-name")?.value.trim()    || "";
      const telefono  = document.getElementById("reg-phone")?.value.trim()   || "";
      const correo    = document.getElementById("reg-email")?.value.trim()   || "";
      const direccion = document.getElementById("reg-address")?.value.trim() || "";
      const password  = document.getElementById("reg-pass")?.value           || "";
      const confirm   = document.getElementById("reg-confirm")?.value        || "";

      let isValid = true;

      if (!nombre)                          { showErr("err-name",    "Escribe tu nombre.");            isValid = false; }
      if (!telefono)                        { showErr("err-phone",   "Escribe tu teléfono.");          isValid = false; }
      if (!correo)                          { showErr("err-email",   "Escribe tu correo.");            isValid = false; }
      if (!direccion)                       { showErr("err-address", "Escribe tu dirección.");         isValid = false; }
      if (!password || password.length < 6) { showErr("err-pass",   "Mínimo 6 caracteres.");          isValid = false; }
      if (confirm !== password)             { showErr("err-confirm", "Las contraseñas no coinciden."); isValid = false; }

      if (!isValid) return;

      try {
        const response = await fetch(`${API_BASE}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, telefono, correo, direccion, password }),
        });

        const data = await response.json();

        if (!response.ok) { alert(data.mensaje || "Error al registrar"); return; }

        alert("Registro exitoso. Ya puedes iniciar sesión.");
        registerForm.reset();
        clearErrors(registerForm);

        const loginTab = document.querySelector('.auth-tab[data-tab="login"]');
        if (loginTab) loginTab.click();

      } catch (error) {
        console.error("Error registro:", error);
        alert("No se pudo conectar con el servidor");
      }
    });
  }

  // ─── Formulario de solicitudes ───
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre       = document.getElementById("nombre")?.value.trim()  || "";
      const correo       = document.getElementById("correo")?.value.trim()  || "";
      const servicio_id  = Number(document.getElementById("servicio")?.value || 0);
      const mensaje      = document.getElementById("mensaje")?.value.trim() || "";

      if (!nombre || !correo || servicio_id === 0 || !mensaje) {
        alert("Por favor completa todos los campos");
        return;
      }
        const usuarioId = localStorage.getItem("usuarioId");
        console.log("USUARIO ID QUE SE ENVÍA:", usuarioId);
      try {
        const response = await fetch(`${API_BASE}/api/solicitudes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, servicio: servicio_id, mensaje, usuario_id: usuarioId }),
        });

        const data = await response.json();

        if (!response.ok) { alert(data.mensaje || "Error al enviar la solicitud"); return; }

        alert("Solicitud enviada correctamente");
        form.reset();
        localStorage.removeItem("servicioSeleccionado");
      } catch (error) {
        console.error("Error solicitud:", error);
        alert("No se pudo conectar con el servidor");
      }
    });
  }

  // ─── Animaciones de scroll ───
  const elementos = document.querySelectorAll(".animar");

  function mostrarElementos() {
    const trigger = window.innerHeight * 0.85;
    elementos.forEach((el) => {
      if (el.getBoundingClientRect().top < trigger) el.classList.add("visible");
    });
  }

  window.addEventListener("scroll", mostrarElementos);
  mostrarElementos();

  // ─── Animación número de confianza ───
  const numero = document.querySelector(".trust-big");
  let animado = false;

  window.addEventListener("scroll", () => {
    if (!numero || animado) return;
    if (numero.getBoundingClientRect().top < window.innerHeight) {
      let valor = 0;
      const intervalo = setInterval(() => {
        numero.textContent = valor + "%";
        if (++valor > 100) clearInterval(intervalo);
      }, 20);
      animado = true;
    }
  });
});

// ══════════════════════════════════════════
//  FUNCIONES GLOBALES (usadas en onclick de landing)
// ══════════════════════════════════════════
function seleccionarServicio(servicio) {
  setSelectedService(servicio);
  document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
}

function showErr(id, msg) {
  const err = document.getElementById(id);
  if (!err) return;
  err.textContent = msg;
  err.classList.add("visible");
  const input = err.previousElementSibling;
  if (input && input.tagName === "INPUT") input.classList.add("error");
}

function clearErrors(form) {
  if (!form) return;
  form.querySelectorAll(".form-error").forEach((e) => { e.textContent = ""; e.classList.remove("visible"); });
  form.querySelectorAll("input").forEach((i) => i.classList.remove("error"));
}