// comparador.js - Refactorizado y modular
// Archivo principal que orquesta todos los módulos

import { protegerRuta, logout } from "./auth.js";
import { CONFIG } from "./config.js";
import { db, auth } from "./firebase.js";
import { enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { normalizarCategoria } from "./utils.js";
import { obtenerEstructuraActual } from "./estructuraManager.js";
import { 
  cargarTablaInicial, 
  guardarEnFirebase, 
  sincronizarDesdeFirebase,
  configurarSnapshotListener 
} from "./syncManager.js";
import { configurarEventListeners, configurarBotones } from "./eventHandlers.js";

// ===============================================================
// Activar persistencia local de Firestore
enableIndexedDbPersistence(db).catch(() => {});

// ===============================================================
protegerRuta();

const tablaHead = document.getElementById("tablaHead");
const tablaBody = document.getElementById("tablaBody");
const categoria = normalizarCategoria(document.title);

// ===============================================================
// Lista de limpieza de event listeners
let cleanupFunctions = [];
let isInitialLoadRef = { current: true };

onAuthStateChanged(auth, (user) => {
  // Limpiar listeners anteriores
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions = [];
  isInitialLoadRef.current = true;

  if (!user) {
    tablaHead.innerHTML = "";
    tablaBody.innerHTML = "";
    return;
  }

  // Configurar botón de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    const logoutHandler = () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      logout();
    };
    logoutBtn.addEventListener("click", logoutHandler);
    cleanupFunctions.push(() => logoutBtn.removeEventListener("click", logoutHandler));
  }

  // Función auxiliar para obtener estructura actual
  const obtenerEstructura = () => obtenerEstructuraActual(tablaHead, tablaBody, categoria, CONFIG);

  // Cargar tabla inicial
  cargarTablaInicial(db, categoria, tablaHead, tablaBody).then(() => {
    // Después de cargar, marcar como carga completada
    isInitialLoadRef.current = false;
  });

  // Configurar todos los botones
  configurarBotones(
    db,
    categoria,
    tablaHead,
    tablaBody,
    obtenerEstructura,
    () => guardarEnFirebase(db, categoria, obtenerEstructura),
    () => sincronizarDesdeFirebase(db, categoria, tablaHead, tablaBody),
    cleanupFunctions
  );

  // Configurar snapshot listener (sincronización en tiempo real)
  const unsubscribe = configurarSnapshotListener(
    db, 
    categoria, 
    tablaHead, 
    tablaBody, 
    isInitialLoadRef
  );
  cleanupFunctions.push(() => unsubscribe());

  // Configurar todos los event listeners de la tabla
  configurarEventListeners(
    db,
    categoria,
    CONFIG,
    tablaHead,
    tablaBody,
    obtenerEstructura,
    cleanupFunctions
  );
});
