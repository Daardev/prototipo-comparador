import { auth } from "./firebase.js";
import { signInWithEmailAndPassword, onAuthStateChanged, signOut, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";

// 🔐 Login
export async function login(email, password, rememberMe = false) {
  try {
    // Configurar la persistencia según el checkbox
    const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    
    // Realizar el login
    await signInWithEmailAndPassword(auth, email, password);
    
    // Guardar o eliminar el email según "Recordarme"
    if (rememberMe) {
      localStorage.setItem("rememberedEmail", email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
    
    window.location.href = "carpas.html";
  } catch (error) {
    throw new Error("Error al iniciar sesión: " + error.message);
  }
}

// 🚪 Logout
export function logout() {
  // Limpiar email recordado al cerrar sesión
  localStorage.removeItem("rememberedEmail");
  signOut(auth).then(() => window.location.href = "index.html");
}

// 🧭 Protección de páginas
export function protegerRuta() {
  onAuthStateChanged(auth, user => {
    if (!user) window.location.href = "index.html";
  });
}
