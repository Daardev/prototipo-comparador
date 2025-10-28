// comparador.js - Refactorizado y modular
// Archivo principal que orquesta todos los módulos

import { protegerRuta, logout } from "../core/auth.js";
import { CONFIG } from "../config/config.js";
import { db, auth } from "../config/firebase.js";
import { enableIndexedDbPersistence } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js";
import { normalizarCategoria } from "../utils/utils.js";
import { obtenerEstructuraActual } from "../managers/estructuraManager.js";
import { 
  cargarTablaInicial, 
  guardarEnFirebase, 
  sincronizarDesdeFirebase,
  configurarSnapshotListener 
} from "../managers/syncManager.js";
import { configurarEventListeners, configurarBotones } from "../ui/eventHandlers.js";

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

  // Configurar menú hamburguesa lateral
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.querySelector(".main-nav");
  if (menuToggle && mainNav) {
    const toggleMenu = () => {
      mainNav.classList.toggle("active");
    };
    
    const closeMenu = () => {
      mainNav.classList.remove("active");
    };
    
    // Toggle al hacer clic en hamburguesa
    menuToggle.addEventListener("click", toggleMenu);
    
    // Cerrar al hacer clic fuera del menú
    document.addEventListener("click", (e) => {
      if (mainNav.classList.contains("active") && 
          !mainNav.contains(e.target) && 
          !menuToggle.contains(e.target)) {
        closeMenu();
      }
    });
    
    // Cerrar al hacer clic en un enlace
    const navLinks = mainNav.querySelectorAll("a");
    navLinks.forEach(link => {
      link.addEventListener("click", closeMenu);
    });
    
    cleanupFunctions.push(() => menuToggle.removeEventListener("click", toggleMenu));
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

  // DESHABILITADO: Sincronización automática en tiempo real
  // Solo se guardará cuando se presione el botón "Guardar en Firebase"
  /*
  const unsubscribe = configurarSnapshotListener(
    db, 
    categoria, 
    tablaHead, 
    tablaBody, 
    isInitialLoadRef
  );
  cleanupFunctions.push(() => unsubscribe());
  */

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
