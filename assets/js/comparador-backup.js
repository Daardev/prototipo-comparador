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

  const addProductBtn = document.getElementById("addProduct");
  if (addProductBtn) {
    const addProductHandler = () => agregarProducto();
    addProductBtn.addEventListener("click", addProductHandler);
    cleanupFunctions.push(() => addProductBtn.removeEventListener("click", addProductHandler));
  }

  // Botones globales para agregar características y especificaciones
  const addCaracteristicaBtn = document.querySelector(".btn-agregar-caracteristica-global");
  if (addCaracteristicaBtn) {
    const addCarHandler = () => {
      const nombre = prompt("Nombre de la nueva característica:");
      if (!nombre || !nombre.trim()) return;
      const event = new CustomEvent("agregarCaracteristica", {
        detail: nombre.trim(),
      });
      document.dispatchEvent(event);
    };
    addCaracteristicaBtn.addEventListener("click", addCarHandler);
    cleanupFunctions.push(() => addCaracteristicaBtn.removeEventListener("click", addCarHandler));
  }

  const addEspecificacionBtn = document.querySelector(".btn-agregar-especificacion-global");
  if (addEspecificacionBtn) {
    const addEspHandler = () => {
      const nombre = prompt("Nombre de la nueva especificación:");
      if (!nombre || !nombre.trim()) return;
      const event = new CustomEvent("agregarEspecificacion", {
        detail: nombre.trim(),
      });
      document.dispatchEvent(event);
    };
    addEspecificacionBtn.addEventListener("click", addEspHandler);
    cleanupFunctions.push(() => addEspecificacionBtn.removeEventListener("click", addEspHandler));
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

  // Agregar el unsubscribe a la lista de limpieza
  cleanupFunctions.push(() => unsubscribe());

  // === Event listeners para header (productos) ===
  tablaHead.addEventListener("click", async (e) => {
    // Editar nombre de producto
    const editBtn = e.target.closest && e.target.closest('.edit-product');
    if (editBtn) {
      const th = editBtn.closest("th");
      if (!th) return;
      
      const span = th.querySelector(".product-name");
      const nombreActual = span.textContent.trim();
      
      const nuevoNombre = prompt("Editar nombre del producto:", nombreActual);
      if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) return;
      
      // Actualizar el nombre en el span
      span.textContent = nuevoNombre.trim();
      
      // Obtener estructura actual y actualizar productos
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      
      // Guardar en Firebase
      try {
        estructura.ultimaActualizacion = Date.now();
        estructura.version = "1.0";
        const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
        await setDoc(docRef, estructura);
        mostrarMensaje("Producto renombrado y guardado en Firebase.", "success");
      } catch (error) {
        console.error("Error al guardar producto en Firebase:", error);
        mostrarMensaje("Producto renombrado localmente, pero error al sincronizar con Firebase.", "warning");
      }
      return;
    }

    // Eliminar producto
    const delBtn = e.target.closest && e.target.closest('.delete-product');
    if (delBtn) {
      const th = delBtn.closest("th");
      if (!th) return;
      
      const span = th.querySelector(".product-name");
      const nombreProducto = span.textContent.trim();
      
      if (!confirm(`¿Eliminar el producto "${nombreProducto}"? Se perderán todos sus datos.`)) return;
      
      // Eliminar la columna del header
      const thIndex = [...th.parentElement.children].indexOf(th);
      th.remove();
      
      // Eliminar las celdas correspondientes en todas las filas del body
      const filas = tablaBody.querySelectorAll("tr");
      filas.forEach(fila => {
        const celdas = fila.querySelectorAll("td");
        if (celdas[thIndex - 1]) { // -1 porque la primera celda es el nombre
          celdas[thIndex - 1].remove();
        }
      });
      
      // Guardar estructura actualizada
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      
      // Guardar en Firebase
      try {
        estructura.ultimaActualizacion = Date.now();
        estructura.version = "1.0";
        const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
        await setDoc(docRef, estructura);
        mostrarMensaje("Producto eliminado y guardado en Firebase.", "success");
      } catch (error) {
        console.error("Error al guardar eliminación en Firebase:", error);
        mostrarMensaje("Producto eliminado localmente, pero error al sincronizar con Firebase.", "warning");
      }
      return;
    }
  });

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

  // === Delegación de clicks en tabla: reset, editar, eliminar ===
  tablaBody.addEventListener("click", async (e) => {
    // Usar closest para soportar clicks sobre los emojis/text nodes dentro de los botones
    const resetBtn = e.target.closest && e.target.closest('.reset-field');
    if (resetBtn) {
      const textarea = resetBtn.parentElement.querySelector("textarea");
      if (textarea) textarea.value = "";
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);
      mostrarMensaje("Campo reseteado.", "info");
      return;
    }

    const editBtn = e.target.closest && e.target.closest('.edit-name');
    if (editBtn) {
      const fila = editBtn.closest("tr");
      if (!fila) return;

      const celdaNombre = fila.querySelector("td");
      const nombreActual = limpiarTexto(celdaNombre.textContent);
      const nuevoNombre = prompt("Editar nombre:", nombreActual);
      if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) return;

      // Reemplazar texto y mantener botones
      const btnEditNode = celdaNombre.querySelector(".edit-name");
      const btnDelNode = celdaNombre.querySelector(".delete-row");
      celdaNombre.textContent = nuevoNombre.trim() + " ";
      if (btnEditNode) celdaNombre.appendChild(btnEditNode);
      celdaNombre.appendChild(document.createTextNode(" "));
      if (btnDelNode) celdaNombre.appendChild(btnDelNode);

      // Guardar la estructura actualizada
      const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
      guardarEnLocalStorage(estructura, categoria);

      // Guardar también en Firebase
      try {
        estructura.ultimaActualizacion = Date.now();
        estructura.version = "1.0";
        const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
        await setDoc(docRef, estructura);
        mostrarMensaje("Nombre actualizado y guardado en Firebase.", "success");
      } catch (error) {
        console.error("Error al guardar edición en Firebase:", error);
        mostrarMensaje("Nombre actualizado localmente, pero error al sincronizar con Firebase.", "warning");
      }
      return;
    }

    const delBtn = e.target.closest && e.target.closest('.delete-row');
    if (delBtn) {
      const fila = delBtn.closest("tr");
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
        await setDoc(docRef, estructura);
        mostrarMensaje("Fila eliminada y guardada en Firebase.", "success");
      } catch (error) {
        console.error("Error al guardar eliminación en Firebase:", error);
        mostrarMensaje("Fila eliminada localmente, pero error al sincronizar con Firebase.", "warning");
      }
      return;
    }
  });
});

// ===============================================================
async function agregarProducto() {
  const nombreProducto = prompt("Nombre del nuevo producto:");
  if (!nombreProducto || !nombreProducto.trim()) return;
  
  const nombre = nombreProducto.trim();
  
  // Agregar nueva columna al header
  const headRow = tablaHead.querySelector("tr");
  if (!headRow) return;
  
  const th = document.createElement("th");
  
  // Crear contenedor para nombre y botones
  const container = document.createElement("div");
  container.className = "product-header-container";
  
  const span = document.createElement("span");
  span.textContent = nombre;
  span.className = "product-name product-name-span";
  span.title = "Click para editar";
  
  const btnEdit = document.createElement("button");
  btnEdit.className = "edit-product";
  btnEdit.textContent = "✏️";
  btnEdit.title = "Editar nombre";
  
  const btnDel = document.createElement("button");
  btnDel.className = "delete-product";
  btnDel.textContent = "🗑️";
  btnDel.title = "Eliminar producto";
  
  container.appendChild(span);
  container.appendChild(btnEdit);
  container.appendChild(btnDel);
  th.appendChild(container);
  headRow.appendChild(th);
  
  // Agregar nueva celda a cada fila del body
  const filas = tablaBody.querySelectorAll("tr");
  filas.forEach(fila => {
    // Solo agregar celda a filas que no son headers de sección
    if (!fila.querySelector("th.section-title")) {
      const td = document.createElement("td");
      const cont = document.createElement("div");
      cont.className = "field-container";
      const textarea = document.createElement("textarea");
      textarea.rows = 2;
      const resetBtn = document.createElement("button");
      resetBtn.className = "reset-field";
      resetBtn.textContent = "🗑️";
      cont.append(textarea, resetBtn);
      td.appendChild(cont);
      fila.appendChild(td);
    } else {
      // Para filas de sección, incrementar colspan
      const th = fila.querySelector("th.section-title");
      if (th) {
        th.colSpan = parseInt(th.colSpan) + 1;
      }
    }
  });
  
  // Guardar estructura actualizada
  const estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
  guardarEnLocalStorage(estructura, categoria);
  
  // Guardar en Firebase
  try {
    estructura.ultimaActualizacion = Date.now();
    estructura.version = "1.0";
    const docRef = doc(db, "comparadores", "shared", "categorias", categoria);
    await setDoc(docRef, estructura);
    mostrarMensaje("Producto agregado y guardado en Firebase.", "success");
  } catch (error) {
    console.error("Error al guardar producto en Firebase:", error);
    mostrarMensaje("Producto agregado localmente, pero error al sincronizar con Firebase.", "warning");
  }
}

// ===============================================================
async function crearTabla() {
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

export function obtenerEstructuraActual(tablaBody, categoria, CONFIG) {
  // Obtener productos dinámicamente desde el header
  const productosActuales = [];
  const headRow = document.querySelector("#tablaHead tr");
  if (headRow) {
    const ths = headRow.querySelectorAll("th");
    ths.forEach((th, index) => {
      if (index === 0) return; // Saltar la primera columna vacía
      const span = th.querySelector(".product-name");
      if (span) {
        productosActuales.push(span.textContent.trim());
      }
    });
  }
  
  const estructura = { 
    datos: {},
    secciones: {},
    productos: productosActuales.length > 0 ? productosActuales : CONFIG[categoria],
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
    estructura.productos.forEach((producto, index) => {
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
