// syncManager.js - Sincronización con Firebase

import { CONFIG } from "../config/config.js";
import { sanitizeEstructura } from "../utils/utils.js";
import { guardarEnLocalStorage, cargarBackupLocal, esEstructuraPorDefecto } from "../utils/storage.js";
import { crearTablaConEstructura } from "../ui/dom.js";
import { doc, getDoc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";
import { notificacionExito, notificacionInfo, notificacionCargando } from "../ui/notifications.js";
import { manejarErrorFirebase, ejecutarConManejador, logger } from "../utils/error-handler.js";
import { validarEstructuraFirebase } from "../utils/validators.js";
import { MENSAJES, CLASES } from "../config/constants.js";

function controlarBotones(habilitado, loadingBtn = null) {
  const saveBtn = document.getElementById("saveFirebase");
  const syncBtn = document.getElementById("syncFirebase");
  
  [saveBtn, syncBtn].forEach(btn => {
    if (btn) {
      btn.disabled = !habilitado;
      // Si estamos habilitando (true), remover loading de ambos botones
      // Si estamos deshabilitando (false), agregar loading solo al botón especificado
      if (habilitado) {
        btn.classList.remove(CLASES.LOADING);
      } else if (btn.id === loadingBtn) {
        btn.classList.add(CLASES.LOADING);
      }
    }
  });
}

function prepararEstructura(estructura, categoria) {
  const productosPorDefecto = CONFIG[categoria];
  const seccionesPorDefecto = CONFIG.Secciones;
  
  return {
    secciones: (estructura.secciones && Object.keys(estructura.secciones).length > 0) 
      ? estructura.secciones : seccionesPorDefecto,
    productos: (estructura.productos && estructura.productos.length > 0)
      ? estructura.productos : productosPorDefecto,
    datos: estructura.datos || {},
    ordenSecciones: estructura.ordenSecciones || Object.keys(seccionesPorDefecto)
  };
}

export async function cargarTablaInicial(db, categoria, tablaHead, tablaBody) {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";

  try {
    const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      const estructuraFirestore = sanitizeEstructura(docSnap.data(), categoria, CONFIG);
      const estructuraPreparada = prepararEstructura(estructuraFirestore, categoria);
      
      crearTablaConEstructura(estructuraPreparada, tablaHead, tablaBody);
      guardarEnLocalStorage(estructuraFirestore, categoria);
      return;
    }
  } catch (error) {
    console.error("Error al cargar datos de Firebase:", error);
  }

  const localBackup = cargarBackupLocal(categoria);
  if (localBackup && !esEstructuraPorDefecto(localBackup)) {
    let estructuraLimpia = sanitizeEstructura(localBackup, categoria, CONFIG);

    if (!estructuraLimpia || typeof estructuraLimpia !== "object") {
      estructuraLimpia = { datos: {}, secciones: CONFIG.Secciones, productos: CONFIG[categoria] };
    }
    if (!estructuraLimpia.datos) {
      estructuraLimpia = { datos: estructuraLimpia, secciones: CONFIG.Secciones, productos: CONFIG[categoria] };
    }

    const estructuraPreparada = prepararEstructura(estructuraLimpia, categoria);
    crearTablaConEstructura(estructuraPreparada, tablaHead, tablaBody);
    guardarEnLocalStorage(estructuraLimpia, categoria);
    return;
  }

  const estructuraInicial = sanitizeEstructura(
    { secciones: CONFIG.Secciones, productos: CONFIG[categoria], datos: {}, ordenSecciones: Object.keys(CONFIG.Secciones) },
    categoria,
    CONFIG
  );
  crearTablaConEstructura(estructuraInicial, tablaHead, tablaBody);
  guardarEnLocalStorage(estructuraInicial, categoria);
}

export async function guardarEnFirebase(db, categoria, obtenerEstructuraFn) {
  return ejecutarConManejador(async () => {
    const loadingNotif = notificacionCargando(MENSAJES.GUARDANDO);
    controlarBotones(false, "saveFirebase");

    try {
      const estructura = obtenerEstructuraFn();
      
      const validacion = validarEstructuraFirebase(estructura);
      if (!validacion.valid) {
        throw new Error(validacion.error);
      }

      const estructuraLimpia = sanitizeEstructura(estructura, categoria, CONFIG);
      estructuraLimpia.ultimaActualizacion = Date.now();
      estructuraLimpia.version = "1.0";
      
      guardarEnLocalStorage(estructuraLimpia, categoria);
      
      const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
      await setDoc(docRef, estructuraLimpia);
      
      loadingNotif.close();
      notificacionExito(MENSAJES.GUARDADO_FIREBASE);
      logger.info("Datos guardados en Firebase", { categoria });
    } catch (error) {
      loadingNotif.close();
      throw await manejarErrorFirebase(error, "guardar en Firebase");
    } finally {
      controlarBotones(true);
    }
  }, "guardar en Firebase");
}

export async function sincronizarDesdeFirebase(db, categoria, tablaHead, tablaBody) {
  return ejecutarConManejador(async () => {
    const loadingNotif = notificacionCargando(MENSAJES.SINCRONIZANDO);
    controlarBotones(false, "syncFirebase");

    try {
      const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const estructuraRemota = sanitizeEstructura(docSnap.data(), categoria, CONFIG);
        
        tablaHead.innerHTML = "";
        tablaBody.innerHTML = "";
        
        const estructuraPreparada = prepararEstructura(estructuraRemota, categoria);
        crearTablaConEstructura(estructuraPreparada, tablaHead, tablaBody);
        guardarEnLocalStorage(estructuraRemota, categoria);
        
        loadingNotif.close();
        notificacionExito(MENSAJES.SINCRONIZADO_FIREBASE);
        logger.info("Datos sincronizados desde Firebase", { categoria });
      } else {
        loadingNotif.close();
        notificacionInfo(MENSAJES.NO_HAY_DATOS_FIREBASE);
        logger.warn("No hay datos en Firebase para sincronizar", { categoria });
      }
    } catch (error) {
      loadingNotif.close();
      throw await manejarErrorFirebase(error, "sincronizar con Firebase");
    } finally {
      controlarBotones(true);
    }
  }, "sincronizar con Firebase");
}

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
        // No mostrar mensaje aquí para evitar sobreposición con mensajes de acciones del usuario
      }
    },
    (error) => {
      console.error("Error al escuchar cambios:", error);
    }
  );

  return unsubscribe;
}
