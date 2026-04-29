const API_BASE = "http://localhost:3000";
const contenedor = document.getElementById("lista-solicitudes");

const usuarioId = localStorage.getItem("usuarioId");

if (!usuarioId) {
  alert("Debes iniciar sesión");
  window.location.href = "landing.html";
}

fetch(`${API_BASE}/api/solicitudes/usuario/${usuarioId}`)
  .then(res => res.json())
  .then(data => {
    console.log("DATOS:", data);

    if (data.length === 0) {
      contenedor.innerHTML = "<p>No tienes solicitudes aún</p>";
      return;
    }

    data.forEach(sol => {
      const card = document.createElement("div");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${sol.servicio_nombre}</h3>
        <p>${sol.descripcion}</p>
        <span class="estado ${sol.estado}">${sol.estado}</span>
      `;

      contenedor.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Error:", error);
    contenedor.innerHTML = "<p>Error al cargar solicitudes</p>";
  });