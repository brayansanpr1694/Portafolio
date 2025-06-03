document.addEventListener("DOMContentLoaded", () => {
  const boton = document.getElementById("modoOscuroBtn");
  const body = document.body;
  const icono = boton.querySelector("i");

  // Carga estado guardado
  if (localStorage.getItem("modo-oscuro") === "true") {
    body.classList.add("dark-mode");
    icono.classList.remove("fa-moon");
    icono.classList.add("fa-sun");
    boton.title = "Modo claro";
  } else {
    boton.title = "Modo oscuro";
  }

  boton.addEventListener("click", () => {
    body.classList.toggle("dark-mode");
    const activado = body.classList.contains("dark-mode");

    localStorage.setItem("modo-oscuro", activado);

    if (activado) {
      icono.classList.remove("fa-moon");
      icono.classList.add("fa-sun");
      boton.title = "Modo claro";
    } else {
      icono.classList.remove("fa-sun");
      icono.classList.add("fa-moon");
      boton.title = "Modo oscuro";
    }
  });
});
let lastScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;

  if (currentScroll > lastScroll && currentScroll > 100) {
    header.classList.add("header-hidden");
  } else {
    header.classList.remove("header-hidden");
  }

  lastScroll = currentScroll;
});
