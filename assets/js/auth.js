import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// 🔐 Login
export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = "carpas.html";
  } catch (error) {
    throw new Error("Error al iniciar sesión: " + error.message);
  }
}

// 🚪 Logout
export function logout() {
  signOut(auth).then(() => window.location.href = "index.html");
}

// 🧭 Protección de páginas
export function protegerRuta() {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "index.html";
  });
}
