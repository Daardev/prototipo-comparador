// comparador.js
import { protegerRuta, logout } from "./auth.js";
import { CONFIG } from "./config.js";
import { db, auth } from "./firebase.js";
import {
  doc,
  setDoc,
  enableIndexedDbPersistence,
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import {
  normalizarCategoria,
  limpiarTexto,
  sanitizeEstructura,
  mostrarMensaje,
} from "./utils.js";
import {
  guardarEnLocalStorage,
  cargarBackupLocal,
  esEstructuraPorDefecto,
} from "./storage.js";
import { crearTablaConEstructura, agregarFilaASeccion } from "./dom.js";

// ===============================================================
// Activar persistencia local de Firestore
enableIndexedDbPersistence(db).catch(() => {});

// ===============================================================
protegerRuta();

const tablaHead = document.getElementById("tablaHead");
const tablaBody = document.getElementById("tablaBody");
const categoria = normalizarCategoria(document.title);

// ===============================================================
onAuthStateChanged(auth, (user) => {
  if (!user) return;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  crearTabla();

  const saveBtnEl = document.getElementById("saveFirebase");
  if (saveBtnEl) saveBtnEl.addEventListener("click", guardarDatos);

  // === Botones "+ Agregar" ===
  document.addEventListener("agregarCaracteristica", (e) => {
    const nombre = e.detail;
    agregarFilaASeccion(tablaBody, nombre, "Características", categoria, CONFIG);
    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    guardarEnLocalStorage(estructura, categoria);
    mostrarMensaje("Característica agregada.", "success");
  });

  document.addEventListener("agregarEspecificacion", (e) => {
    const nombre = e.detail;
    agregarFilaASeccion(
      tablaBody,
      nombre,
      "Especificaciones técnicas",
      categoria,
      CONFIG
    );
    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    guardarEnLocalStorage(estructura, categoria);
    mostrarMensaje("Especificación agregada.", "success");
  });

  // === Guardado automático ===
  tablaBody.addEventListener("input", (e) => {
    if (e.target.tagName === "TEXTAREA") {
      clearTimeout(e.target._saveTimeout);
      e.target._saveTimeout = setTimeout(() => {
        const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
        guardarEnLocalStorage(estructura, categoria);
      }, 400);
    }
  });

  // === Resetear campo ===
  tablaBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("reset-field")) {
      const textarea = e.target.parentElement.querySelector("textarea");
      textarea.value = "";
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      mostrarMensaje("Campo reseteado.", "info");
    }
  });

  // === Eliminar fila ===
  tablaBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("delete-row")) {
      const fila = e.target.closest("tr");
      if (!fila) return;
      const nombre = limpiarTexto(fila.querySelector("td").textContent);
      if (!confirm(`¿Eliminar "${nombre}"?`)) return;
      fila.remove();
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      mostrarMensaje("Fila eliminada.", "success");
    }
  });
});

// ===============================================================
function crearTabla() {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";

  const productos = CONFIG[categoria];
  const secciones = JSON.parse(JSON.stringify(CONFIG.Secciones));

  const localBackup = cargarBackupLocal(categoria);

  if (localBackup && !esEstructuraPorDefecto(localBackup)) {
    let estructuraLimpia = sanitizeEstructura(localBackup, categoria, CONFIG);

    if (!estructuraLimpia || typeof estructuraLimpia !== "object") {
      estructuraLimpia = { datos: {} };
    }
    if (!estructuraLimpia.datos) {
      estructuraLimpia = { datos: estructuraLimpia };
    }

    crearTablaConEstructura(
      { secciones, productos, datos: estructuraLimpia.datos },
      tablaHead,
      tablaBody
    );

    guardarEnLocalStorage(estructuraLimpia, categoria);
    mostrarMensaje("Datos restaurados correctamente.", "success");
    return;
  }

  const estructuraInicial = sanitizeEstructura(
    { secciones, productos, datos: {} },
    categoria,
    CONFIG
  );
  crearTablaConEstructura(estructuraInicial, tablaHead, tablaBody);
  guardarEnLocalStorage(estructuraInicial, categoria);
}

// ===============================================================
async function guardarDatos() {
  try {
    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    guardarEnLocalStorage(estructura, categoria);
    const userId = auth.currentUser.uid;
    const docRef = doc(db, "comparadores", userId, "categorias", categoria);
    await setDoc(docRef, estructura, { merge: true });
    mostrarMensaje("Datos guardados en Firebase.", "success");
  } catch (error) {
    mostrarMensaje("Error al guardar en Firebase.", "error");
  }
}

// ===============================================================
export function obtenerEstructuraActual(tablaBody, categoria, CONFIG) {
  const estructura = { datos: {} };
  const filas = [...tablaBody.querySelectorAll("tr")];
  let seccionActual = "";

  filas.forEach((fila) => {
    const th = fila.querySelector("th.section-title");
    if (th) {
      seccionActual = th.textContent.replace(/\+?\s*Agregar/g, "").trim();
      return;
    }

    const celdaNombre = fila.querySelector("td");
    if (!celdaNombre) return;

    const nombreCampo = limpiarTexto(celdaNombre.textContent);
    if (!nombreCampo) return;

    const clave = seccionActual ? `${seccionActual}:${nombreCampo}` : nombreCampo;
    estructura.datos[clave] = {};

    const celdas = fila.querySelectorAll("td:not(:first-child)");
    CONFIG[categoria].forEach((producto, index) => {
      const valor = celdas[index]?.querySelector("textarea")?.value ?? "";
      estructura.datos[clave][producto] = valor;
    });
  });

  return estructura;
}
