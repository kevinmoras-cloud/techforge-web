// 🔹 SELECCIONAR SERVICIO
function seleccionarServicio(servicio) {
  localStorage.setItem("servicioSeleccionado", servicio);

  document.getElementById("contacto").scrollIntoView({
    behavior: "smooth"
  });
}

// 🔹 CUANDO CARGA LA PÁGINA
document.addEventListener("DOMContentLoaded", () => {

  const inputServicio = document.getElementById("servicio");
  const servicioGuardado = localStorage.getItem("servicioSeleccionado");

  if (inputServicio && servicioGuardado) {
    inputServicio.value = servicioGuardado;
  }

});

// 🔹 FORMULARIO
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formContacto");

  if (form) {
    form.addEventListener("submit", function(e) {
      e.preventDefault();

      const nombre = document.getElementById("nombre").value;
      const correo = document.getElementById("correo").value;
      const servicio = document.getElementById("servicio").value;
      const mensaje = document.getElementById("mensaje").value;

      let solicitudes = JSON.parse(localStorage.getItem("solicitudes")) || [];

      solicitudes.push({
        nombre,
        correo,
        servicio,
        mensaje,
        fecha: new Date()
      });

      localStorage.setItem("solicitudes", JSON.stringify(solicitudes));

      alert("Solicitud enviada correctamente");

      form.reset();
    });
  }
});

// 🔹 ANIMACIÓN SCROLL
const elementos = document.querySelectorAll('.animar');

function mostrarElementos() {
  const trigger = window.innerHeight * 0.8;

  elementos.forEach(el => {
    const top = el.getBoundingClientRect().top;

    if (top < trigger) {
      el.classList.add('visible');
    }
  });
}

window.addEventListener('scroll', mostrarElementos);

// 🔹 CONTADOR %
const numero = document.querySelector(".trust-big");

let animado = false;

function animarNumero() {
  let valor = 0;

  function subir() {
    if (valor <= 100) {
      numero.textContent = valor + "%";
      valor++;
      setTimeout(subir, 20);
    }
  }

  subir();
}

window.addEventListener("scroll", () => {
  if (!numero || animado) return;

  const top = numero.getBoundingClientRect().top;
  const trigger = window.innerHeight;

  if (top < trigger) {
    animarNumero();
    animado = true;
  }
});