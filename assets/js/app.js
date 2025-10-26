import { login } from "./auth.js";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
      await login(email, password);
    } catch (err) {
      message.textContent = err.message;
      message.classList.add("error");
    }
  });
}
