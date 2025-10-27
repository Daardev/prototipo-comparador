// comparador.js
import { protegerRuta, logout } from "./auth.js";
import { CONFIG } from "./config.js";
import { db, auth } from "./firebase.js";
import {
  doc, 
  getDoc,
  setDoc, 
  onSnapshot,
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
// Lista de limpieza de event listeners
let cleanupFunctions = [];
let isInitialLoad = true;

onAuthStateChanged(auth, (user) => {
  // Limpiar listeners anteriores
  cleanupFunctions.forEach(cleanup => cleanup());
  cleanupFunctions = [];
  isInitialLoad = true;

  if (!user) {
    tablaHead.innerHTML = "";
    tablaBody.innerHTML = "";
    return;
  }

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    const logoutHandler = () => {
      cleanupFunctions.forEach(cleanup => cleanup());
      logout();
    };
    logoutBtn.addEventListener("click", logoutHandler);
    cleanupFunctions.push(() => logoutBtn.removeEventListener("click", logoutHandler));
  }

  // Cargar tabla primero
  crearTabla().then(() => {
    // Después de cargar, marcar como carga completada
    isInitialLoad = false;
  });

  const saveBtnEl = document.getElementById("saveFirebase");
  if (saveBtnEl) {
    const saveHandler = () => guardarDatos();
    saveBtnEl.addEventListener("click", saveHandler);
    cleanupFunctions.push(() => saveBtnEl.removeEventListener("click", saveHandler));
  }

  const syncBtnEl = document.getElementById("syncFirebase");
  if (syncBtnEl) {
    const syncHandler = () => sincronizarDatos();
    syncBtnEl.addEventListener("click", syncHandler);
    cleanupFunctions.push(() => syncBtnEl.removeEventListener("click", syncHandler));
  }

  // Escuchar cambios en tiempo real desde Firebase (después de la carga inicial)
  const unsubscribe = onSnapshot(
    doc(db, "comparadores", "shared", "categorias", categoria),
    (docSnapshot) => {
      // Ignorar el primer evento durante la carga inicial
      if (isInitialLoad) {
        return;
      }

      if (docSnapshot.exists()) {
        const datosRemotos = docSnapshot.data();
        const estructuraRemota = sanitizeEstructura(datosRemotos, categoria, CONFIG);
        
        // Usar las secciones guardadas o las por defecto
        const seccionesAUsar = (estructuraRemota.secciones && Object.keys(estructuraRemota.secciones).length > 0)
          ? estructuraRemota.secciones
          : CONFIG.Secciones;
        
        // Usar el orden guardado o el orden por defecto
        const ordenAUsar = estructuraRemota.ordenSecciones || Object.keys(CONFIG.Secciones);
        
        // Actualizar la tabla con los datos remotos
        crearTablaConEstructura(
          { 
            secciones: seccionesAUsar, 
            productos: CONFIG[categoria], 
            datos: estructuraRemota.datos,
            ordenSecciones: ordenAUsar
          },
          tablaHead,
          tablaBody
        );
        
        // Guardar los datos remotos en localStorage
        guardarEnLocalStorage(estructuraRemota, categoria);
        mostrarMensaje("Datos actualizados desde Firebase", "info");
      }
    },
    (error) => {
      console.error("Error al escuchar cambios:", error);
    }
  );

  // Agregar el unsubscribe a la lista de limpieza
  cleanupFunctions.push(() => unsubscribe());

  // === Botones "+ Agregar" ===
  document.addEventListener("agregarCaracteristica", async (e) => {
    const nombre = e.detail;
    const agregado = agregarFilaASeccion(tablaBody, nombre, "Características", categoria, CONFIG);
    
    // Si ya existe, mostrar warning y salir
    if (!agregado) {
      mostrarMensaje(`La característica "${nombre}" ya existe.`, "warning");
      return;
    }
    
    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    guardarEnLocalStorage(estructura, categoria);
    
    // Guardar también en Firebase
    try {
      estructura.ultimaActualizacion = Date.now();
      estructura.version = "1.0";
      const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
      await setDoc(docRef, estructura);
      mostrarMensaje("Característica agregada y guardada en Firebase.", "success");
    } catch (error) {
      console.error("Error al guardar característica en Firebase:", error);
      mostrarMensaje("Característica agregada localmente, pero error al sincronizar con Firebase.", "warning");
    }
  });

  document.addEventListener("agregarEspecificacion", async (e) => {
    const nombre = e.detail;
    const agregado = agregarFilaASeccion(
      tablaBody,
      nombre,
      "Especificaciones técnicas",
      categoria,
      CONFIG
    );
    
    // Si ya existe, mostrar warning y salir
    if (!agregado) {
      mostrarMensaje(`La especificación "${nombre}" ya existe.`, "warning");
      return;
    }
    
    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    guardarEnLocalStorage(estructura, categoria);
    
    // Guardar también en Firebase
    try {
      estructura.ultimaActualizacion = Date.now();
      estructura.version = "1.0";
      const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
      await setDoc(docRef, estructura);
      mostrarMensaje("Especificación agregada y guardada en Firebase.", "success");
    } catch (error) {
      console.error("Error al guardar especificación en Firebase:", error);
      mostrarMensaje("Especificación agregada localmente, pero error al sincronizar con Firebase.", "warning");
    }
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
  tablaBody.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-row")) {
      const fila = e.target.closest("tr");
      if (!fila) return;
      const nombre = limpiarTexto(fila.querySelector("td").textContent);
      if (!confirm(`¿Eliminar "${nombre}"?`)) return;
      
      fila.remove();
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      
      // Guardar también en Firebase
      try {
        estructura.ultimaActualizacion = Date.now();
        estructura.version = "1.0";
        const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
        
        // Usar setDoc SIN merge para sobrescribir completamente
        await setDoc(docRef, estructura);
        mostrarMensaje("Fila eliminada y guardada en Firebase.", "success");
      } catch (error) {
        console.error("Error al guardar eliminación en Firebase:", error);
        mostrarMensaje("Fila eliminada localmente, pero error al sincronizar con Firebase.", "warning");
      }
    }
  });
});

// ===============================================================
async function crearTabla() {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";

  const productos = CONFIG[categoria];
  const seccionesPorDefecto = JSON.parse(JSON.stringify(CONFIG.Secciones));

  try {
    // 1. Intentar cargar datos de Firestore primero (compartido)
    const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      // Si hay datos en Firestore, usarlos
      const firestoreData = docSnap.data();
      const estructuraFirestore = sanitizeEstructura(firestoreData, categoria, CONFIG);
      
      // Usar las secciones guardadas o las por defecto
      const seccionesAUsar = (estructuraFirestore.secciones && Object.keys(estructuraFirestore.secciones).length > 0) 
        ? estructuraFirestore.secciones 
        : seccionesPorDefecto;
      
      // Usar el orden guardado o el orden por defecto
      const ordenAUsar = estructuraFirestore.ordenSecciones || Object.keys(CONFIG.Secciones);
      
      crearTablaConEstructura(
        { 
          secciones: seccionesAUsar, 
          productos, 
          datos: estructuraFirestore.datos,
          ordenSecciones: ordenAUsar
        },
        tablaHead, 
        tablaBody
      );
      // Actualizar localStorage con datos de Firestore
      guardarEnLocalStorage(estructuraFirestore, categoria);
      mostrarMensaje("Datos sincronizados desde Firebase", "success");
      return;
    }
  } catch (error) {
    console.error("Error al cargar datos de Firebase:", error);
    mostrarMensaje("Error al cargar datos de Firebase, usando datos locales", "info");
  }

  // 2. Si no hay datos en Firestore o falló, usar localStorage
  const localBackup = cargarBackupLocal(categoria);
  if (localBackup && !esEstructuraPorDefecto(localBackup)) {
    let estructuraLimpia = sanitizeEstructura(localBackup, categoria, CONFIG);

    if (!estructuraLimpia || typeof estructuraLimpia !== "object") {
      estructuraLimpia = { datos: {}, secciones: seccionesPorDefecto };
    }
    if (!estructuraLimpia.datos) {
      estructuraLimpia = { datos: estructuraLimpia, secciones: seccionesPorDefecto };
    }

    // Usar las secciones guardadas o las por defecto
    const seccionesAUsar = (estructuraLimpia.secciones && Object.keys(estructuraLimpia.secciones).length > 0) 
      ? estructuraLimpia.secciones 
      : seccionesPorDefecto;

    // Usar el orden guardado o el orden por defecto
    const ordenAUsar = estructuraLimpia.ordenSecciones || Object.keys(CONFIG.Secciones);

    crearTablaConEstructura(
      { 
        secciones: seccionesAUsar, 
        productos, 
        datos: estructuraLimpia.datos,
        ordenSecciones: ordenAUsar
      },
      tablaHead,
      tablaBody
    );

    guardarEnLocalStorage(estructuraLimpia, categoria);
    mostrarMensaje("Datos restaurados desde almacenamiento local", "success");
    return;
  }

  // 3. Si no hay datos en ningún lado, crear estructura inicial
  const estructuraInicial = sanitizeEstructura(
    { secciones: seccionesPorDefecto, productos, datos: {}, ordenSecciones: Object.keys(CONFIG.Secciones) },
    categoria,
    CONFIG
  );
  crearTablaConEstructura(estructuraInicial, tablaHead, tablaBody);
  guardarEnLocalStorage(estructuraInicial, categoria);
}

// ===============================================================
async function guardarDatos() {
  try {
    // Deshabilitar botones durante la operación
    const saveBtn = document.getElementById("saveFirebase");
    const syncBtn = document.getElementById("syncFirebase");
    if (saveBtn) saveBtn.disabled = true;
    if (syncBtn) syncBtn.disabled = true;

    const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    if (!estructura || !estructura.datos) {
      throw new Error("Estructura de datos inválida");
    }

    // Agregar timestamp y versión
    estructura.ultimaActualizacion = Date.now();
    estructura.version = "1.0";
    
    guardarEnLocalStorage(estructura, categoria);
    
    // Guardar en ruta compartida - SIN merge para sobrescribir completamente
    const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
    await setDoc(docRef, estructura);
    mostrarMensaje("Datos guardados en Firebase.", "success");
  } catch (error) {
    console.error("Error al guardar en Firebase:", error);
    mostrarMensaje(error.message || "Error al guardar en Firebase.", "error");
  } finally {
    // Re-habilitar botones después de la operación
    const saveBtn = document.getElementById("saveFirebase");
    const syncBtn = document.getElementById("syncFirebase");
    if (saveBtn) saveBtn.disabled = false;
    if (syncBtn) syncBtn.disabled = false;
  }
}

// ===============================================================
// ===============================================================
async function sincronizarDatos() {
  try {
    // Deshabilitar botones durante la sincronización
    const saveBtn = document.getElementById("saveFirebase");
    const syncBtn = document.getElementById("syncFirebase");
    if (saveBtn) saveBtn.disabled = true;
    if (syncBtn) syncBtn.disabled = true;

    mostrarMensaje("Sincronizando datos...", "info");

    const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const datosRemotos = docSnap.data();
      const estructuraRemota = sanitizeEstructura(datosRemotos, categoria, CONFIG);
      
      // Limpiar la tabla antes de actualizar
      tablaHead.innerHTML = "";
      tablaBody.innerHTML = "";
      
      // Usar las secciones guardadas o las por defecto
      const seccionesAUsar = (estructuraRemota.secciones && Object.keys(estructuraRemota.secciones).length > 0)
        ? estructuraRemota.secciones
        : CONFIG.Secciones;
      
      // Usar el orden guardado o el orden por defecto
      const ordenAUsar = estructuraRemota.ordenSecciones || Object.keys(CONFIG.Secciones);
      
      // Actualizar la tabla con los datos remotos
      const estructuraParaTabla = { 
        secciones: seccionesAUsar, 
        productos: CONFIG[categoria], 
        datos: estructuraRemota.datos,
        ordenSecciones: ordenAUsar
      };
      
      crearTablaConEstructura(
        estructuraParaTabla,
        tablaHead,
        tablaBody
      );
      
      // Guardar los datos remotos en localStorage
      guardarEnLocalStorage(estructuraRemota, categoria);
      mostrarMensaje("Datos sincronizados desde Firebase correctamente", "success");
    } else {
      mostrarMensaje("No hay datos en Firebase para sincronizar", "info");
    }
  } catch (error) {
    console.error("Error al sincronizar con Firebase:", error);
    mostrarMensaje(error.message || "Error al sincronizar con Firebase", "error");
  } finally {
    // Re-habilitar botones después de la sincronización
    const saveBtn = document.getElementById("saveFirebase");
    const syncBtn = document.getElementById("syncFirebase");
    if (saveBtn) saveBtn.disabled = false;
    if (syncBtn) syncBtn.disabled = false;
  }
}

export function obtenerEstructuraActual(tablaBody, categoria, CONFIG) {
  const estructura = { 
    datos: {},
    secciones: {},
    productos: CONFIG[categoria],
    ordenSecciones: [] // Nuevo: mantener el orden explícito
  };
  const filas = [...tablaBody.querySelectorAll("tr")];
  let seccionActual = "";

  filas.forEach((fila) => {
    const th = fila.querySelector("th.section-title");
    if (th) {
      seccionActual = th.textContent.replace(/\+?\s*Agregar/g, "").trim();
      // Inicializar array de características para esta sección
      if (!estructura.secciones[seccionActual]) {
        estructura.secciones[seccionActual] = [];
        estructura.ordenSecciones.push(seccionActual); // Guardar el orden
      }
      return;
    }

    const celdaNombre = fila.querySelector("td");
    if (!celdaNombre) return;

    const nombreCampo = limpiarTexto(celdaNombre.textContent);
    if (!nombreCampo) return;

    // Agregar esta característica a la sección actual
    if (seccionActual && !estructura.secciones[seccionActual].includes(nombreCampo)) {
      estructura.secciones[seccionActual].push(nombreCampo);
    }

    const clave = seccionActual ? `${seccionActual}:${nombreCampo}` : nombreCampo;
    estructura.datos[clave] = {};

    const celdas = fila.querySelectorAll("td:not(:first-child)");
    CONFIG[categoria].forEach((producto, index) => {
      const valor = celdas[index]?.querySelector("textarea")?.value ?? "";
      estructura.datos[clave][producto] = valor;
    });
  });

  // Ordenar alfabéticamente las características dentro de cada sección
  Object.keys(estructura.secciones).forEach(seccion => {
    estructura.secciones[seccion].sort((a, b) => {
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });
  });

  return estructura;
}
