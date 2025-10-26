import { login } from "./auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const emailInput = document.getElementById("email");
const rememberMeCheckbox = document.getElementById("rememberMe");

// Cargar email guardado si existe
window.addEventListener("DOMContentLoaded", () => {
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail && emailInput) {
    emailInput.value = savedEmail;
    if (rememberMeCheckbox) {
      rememberMeCheckbox.checked = true;
    }
  }
});

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = document.getElementById("password").value.trim();
    const rememberMe = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

    try {
      await login(email, password, rememberMe);
    } catch (err) {
      message.textContent = err.message;
      message.classList.add("error");
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        message.textContent = "";
        message.classList.remove("error");
      }, 5000);
    }
  });
}
