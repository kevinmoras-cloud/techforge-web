const API_BASE = "http://localhost:3000";

function getServiceInput() {
  return document.getElementById("servicio");
}

function setSelectedService(servicio) {
  const input = getServiceInput();
  const value = String(servicio).trim();

  if (!value) return;

  localStorage.setItem("servicioSeleccionado", value);

  if (input) {
    input.value = value;
  }
}

document.addEventListener("DOMContentLoaded", () => {
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
  if (overlay) overlay.addEventListener("click", closeModal);

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

      if (loginForm) {
        loginForm.style.display = tab.dataset.tab === "login" ? "flex" : "none";
      }
      if (registerForm) {
        registerForm.style.display = tab.dataset.tab === "register" ? "flex" : "none";
      }
    });
  });

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      const correo = document.getElementById("login-email")?.value.trim() || "";
      const password = document.getElementById("login-password")?.value || "";

      if (!correo || !password) {
        alert("Completa el correo y la contraseña.");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.mensaje || "Error al iniciar sesión");
          return;
        }

        localStorage.setItem("token", data.token || "");
        if (data.usuario) {
          localStorage.setItem("usuario", JSON.stringify(data.usuario));
        }

        alert(`Bienvenido, ${data.usuario?.nombre || "usuario"}`);
        loginForm.reset();
        closeModal();
      } catch (error) {
        console.error("Error login:", error);
        alert("No se pudo conectar con el servidor");
      }
    });
  }

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

    if (!nombre)                          { showErr("err-name",    "Escribe tu nombre.");       isValid = false; }
    if (!telefono)                        { showErr("err-phone",   "Escribe tu teléfono.");     isValid = false; }
    if (!correo)                          { showErr("err-email",   "Escribe tu correo.");       isValid = false; }
    if (!direccion)                       { showErr("err-address", "Escribe tu dirección.");    isValid = false; }
    if (!password || password.length < 6) { showErr("err-pass",   "Mínimo 6 caracteres.");     isValid = false; }
    if (confirm !== password)             { showErr("err-confirm", "Las contraseñas no coinciden."); isValid = false; }

    if (!isValid) return;

    try {
      // ✅ FIX: llama al endpoint de registro, no al de solicitudes
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, correo, direccion, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.mensaje || "Error al registrar");
        return;
      }

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

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const nombre = document.getElementById("nombre")?.value.trim() || "";
      const correo = document.getElementById("correo")?.value.trim() || "";
      const servicio_id = document.getElementById("servicio")?.value || "";
      const mensaje = document.getElementById("mensaje")?.value.trim() || "";

      if (!nombre || !correo || !servicio_id || !mensaje) {
        alert("Por favor completa todos los campos");
        return;
      }

      try {
        const response = await fetch(`${API_BASE}/api/solicitudes`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nombre,
            correo,
            servicio: Number(servicio_id),
            mensaje,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          alert(data.mensaje || "Error al enviar la solicitud");
          return;
        }

        alert("Solicitud enviada correctamente");
        form.reset();
        localStorage.removeItem("servicioSeleccionado");
      } catch (error) {
        console.error("Error solicitud:", error);
        alert("No se pudo conectar con el servidor");
      }
    });
  }

  const elementos = document.querySelectorAll(".animar");

  function mostrarElementos() {
    const trigger = window.innerHeight * 0.85;

    elementos.forEach((el) => {
      if (el.getBoundingClientRect().top < trigger) {
        el.classList.add("visible");
      }
    });
  }

  window.addEventListener("scroll", mostrarElementos);
  mostrarElementos();

  const numero = document.querySelector(".trust-big");
  let animado = false;

  function animarNumero() {
    if (!numero) return;

    let valor = 0;
    const intervalo = setInterval(() => {
      numero.textContent = valor + "%";
      valor++;

      if (valor > 100) {
        clearInterval(intervalo);
      }
    }, 20);
  }

  window.addEventListener("scroll", () => {
    if (!numero || animado) return;

    if (numero.getBoundingClientRect().top < window.innerHeight) {
      animarNumero();
      animado = true;
    }
  });
});

function seleccionarServicio(servicio) {
  setSelectedService(servicio);
  document.getElementById("contacto")?.scrollIntoView({
    behavior: "smooth",
  });
}

function showErr(id, msg) {
  const err = document.getElementById(id);
  if (!err) return;

  err.textContent = msg;
  err.classList.add("visible");

  const input = err.previousElementSibling;
  if (input && input.tagName === "INPUT") {
    input.classList.add("error");
  }
}

function clearErrors(form) {
  if (!form) return;

  form.querySelectorAll(".form-error").forEach((e) => {
    e.textContent = "";
    e.classList.remove("visible");
  });

  form.querySelectorAll("input").forEach((i) => i.classList.remove("error"));
}