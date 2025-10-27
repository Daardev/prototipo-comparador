// syncManager.js
// Módulo para manejar toda la sincronización con Firebase

import { CONFIG } from "./config.js";
import { sanitizeEstructura, mostrarMensaje } from "./utils.js";
import { guardarEnLocalStorage, cargarBackupLocal, esEstructuraPorDefecto } from "./storage.js";
import { crearTablaConEstructura } from "./dom.js";
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/**
 * Carga la tabla inicial desde Firebase o localStorage
 */
export async function cargarTablaInicial(db, categoria, tablaHead, tablaBody) {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";

  const productosPorDefecto = CONFIG[categoria];
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
      
      // Usar los productos guardados o los por defecto
      const productosAUsar = (estructuraFirestore.productos && estructuraFirestore.productos.length > 0)
        ? estructuraFirestore.productos
        : productosPorDefecto;
      
      // Usar el orden guardado o el orden por defecto
      const ordenAUsar = estructuraFirestore.ordenSecciones || Object.keys(CONFIG.Secciones);
      
      crearTablaConEstructura(
        { 
          secciones: seccionesAUsar, 
          productos: productosAUsar, 
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
      estructuraLimpia = { datos: {}, secciones: seccionesPorDefecto, productos: productosPorDefecto };
    }
    if (!estructuraLimpia.datos) {
      estructuraLimpia = { datos: estructuraLimpia, secciones: seccionesPorDefecto, productos: productosPorDefecto };
    }

    // Usar las secciones guardadas o las por defecto
    const seccionesAUsar = (estructuraLimpia.secciones && Object.keys(estructuraLimpia.secciones).length > 0) 
      ? estructuraLimpia.secciones 
      : seccionesPorDefecto;

    // Usar los productos guardados o los por defecto
    const productosAUsar = (estructuraLimpia.productos && estructuraLimpia.productos.length > 0)
      ? estructuraLimpia.productos
      : productosPorDefecto;

    // Usar el orden guardado o el orden por defecto
    const ordenAUsar = estructuraLimpia.ordenSecciones || Object.keys(CONFIG.Secciones);

    crearTablaConEstructura(
      { 
        secciones: seccionesAUsar, 
        productos: productosAUsar, 
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
    { secciones: seccionesPorDefecto, productos: productosPorDefecto, datos: {}, ordenSecciones: Object.keys(CONFIG.Secciones) },
    categoria,
    CONFIG
  );
  crearTablaConEstructura(estructuraInicial, tablaHead, tablaBody);
  guardarEnLocalStorage(estructuraInicial, categoria);
}

/**
 * Guarda los datos actuales en Firebase
 */
export async function guardarEnFirebase(db, categoria, obtenerEstructuraFn) {
  try {
    // Deshabilitar botones durante la operación
    const saveBtn = document.getElementById("saveFirebase");
    const syncBtn = document.getElementById("syncFirebase");
    if (saveBtn) saveBtn.disabled = true;
    if (syncBtn) syncBtn.disabled = true;

    const estructura = obtenerEstructuraFn();
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

/**
 * Sincroniza datos desde Firebase (forzado)
 */
export async function sincronizarDesdeFirebase(db, categoria, tablaHead, tablaBody) {
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
      
      // Usar los productos guardados o los por defecto
      const productosAUsar = (estructuraRemota.productos && estructuraRemota.productos.length > 0)
        ? estructuraRemota.productos
        : CONFIG[categoria];
      
      // Usar el orden guardado o el orden por defecto
      const ordenAUsar = estructuraRemota.ordenSecciones || Object.keys(CONFIG.Secciones);
      
      // Actualizar la tabla con los datos remotos
      const estructuraParaTabla = { 
        secciones: seccionesAUsar, 
        productos: productosAUsar, 
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

/**
 * Configura el listener en tiempo real de Firebase
 */
export function configurarSnapshotListener(db, categoria, tablaHead, tablaBody, isInitialLoadRef) {
  const unsubscribe = onSnapshot(
    doc(db, "comparadores", "shared", "categorias", categoria),
    (docSnapshot) => {
      // Ignorar el primer evento durante la carga inicial
      if (isInitialLoadRef.current) {
        return;
      }

      if (docSnapshot.exists()) {
        const datosRemotos = docSnapshot.data();
        const estructuraRemota = sanitizeEstructura(datosRemotos, categoria, CONFIG);
        
        // Usar las secciones guardadas o las por defecto
        const seccionesAUsar = (estructuraRemota.secciones && Object.keys(estructuraRemota.secciones).length > 0)
          ? estructuraRemota.secciones
          : CONFIG.Secciones;
        
        // Usar los productos guardados o los por defecto
        const productosAUsar = (estructuraRemota.productos && estructuraRemota.productos.length > 0)
          ? estructuraRemota.productos
          : CONFIG[categoria];
        
        // Usar el orden guardado o el orden por defecto
        const ordenAUsar = estructuraRemota.ordenSecciones || Object.keys(CONFIG.Secciones);
        
        // Actualizar la tabla con los datos remotos
        crearTablaConEstructura(
          { 
            secciones: seccionesAUsar, 
            productos: productosAUsar, 
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

  return unsubscribe;
}
