// eventHandlers.js
// Módulo para configurar todos los event listeners

import { agregarProducto, editarProducto, eliminarProducto } from "./productManager.js";
import { 
  agregarCaracteristica, 
  agregarEspecificacion, 
  editarCaracteristica, 
  eliminarCaracteristica,
  resetearCampo
} from "./caracteristicasManager.js";
import { guardarEnLocalStorage } from "./storage.js";

/**
 * Configura todos los event listeners de la aplicación
 */
export function configurarEventListeners(
  db, 
  categoria, 
  CONFIG,
  tablaHead, 
  tablaBody, 
  obtenerEstructuraFn,
  cleanupFunctions
) {
  
  // === Event listeners para header (productos) ===
  const headerHandler = async (e) => {
    // Editar nombre de producto
    const editBtn = e.target.closest && e.target.closest('.edit-product');
    if (editBtn) {
      const th = editBtn.closest("th");
      if (th) await editarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn);
      return;
    }

    // Eliminar producto
    const delBtn = e.target.closest && e.target.closest('.delete-product');
    if (delBtn) {
      const th = delBtn.closest("th");
      if (th) await eliminarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn);
      return;
    }
  };
  
  tablaHead.addEventListener("click", headerHandler);
  cleanupFunctions.push(() => tablaHead.removeEventListener("click", headerHandler));

  // === Event listeners globales para agregar ===
  document.addEventListener("agregarCaracteristica", async (e) => {
    await agregarCaracteristica(e.detail, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn);
  });

  document.addEventListener("agregarEspecificacion", async (e) => {
    await agregarEspecificacion(e.detail, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn);
  });

  // === Delegación de clicks en tabla: reset, editar, eliminar ===
  const bodyHandler = async (e) => {
    // Usar closest para soportar clicks sobre los emojis/text nodes dentro de los botones
    const resetBtn = e.target.closest && e.target.closest('.reset-field');
    if (resetBtn) {
      resetearCampo(resetBtn, categoria, tablaBody, obtenerEstructuraFn);
      return;
    }

    const editBtn = e.target.closest && e.target.closest('.edit-name');
    if (editBtn) {
      const fila = editBtn.closest("tr");
      if (fila) await editarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn);
      return;
    }

    const delBtn = e.target.closest && e.target.closest('.delete-row');
    if (delBtn) {
      const fila = delBtn.closest("tr");
      if (fila) await eliminarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn);
      return;
    }
  };
  
  tablaBody.addEventListener("click", bodyHandler);
  cleanupFunctions.push(() => tablaBody.removeEventListener("click", bodyHandler));

  // === Guardado automático al editar textareas ===
  const inputHandler = (e) => {
    if (e.target.tagName === "TEXTAREA") {
      clearTimeout(e.target._saveTimeout);
      e.target._saveTimeout = setTimeout(() => {
        const estructura = obtenerEstructuraFn();
        guardarEnLocalStorage(estructura, categoria);
      }, 400);
    }
  };
  
  tablaBody.addEventListener("input", inputHandler);
  cleanupFunctions.push(() => tablaBody.removeEventListener("input", inputHandler));
}

/**
 * Configura los botones de la interfaz
 */
export function configurarBotones(
  db,
  categoria,
  tablaHead,
  tablaBody,
  obtenerEstructuraFn,
  guardarEnFirebaseFn,
  sincronizarFn,
  cleanupFunctions
) {
  // Botón agregar producto
  const addProductBtn = document.getElementById("addProduct");
  if (addProductBtn) {
    const addProductHandler = () => agregarProducto(db, categoria, tablaHead, tablaBody, obtenerEstructuraFn);
    addProductBtn.addEventListener("click", addProductHandler);
    cleanupFunctions.push(() => addProductBtn.removeEventListener("click", addProductHandler));
  }

  // Botón agregar característica global
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

  // Botón agregar especificación global
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

  // Botón guardar en Firebase
  const saveBtnEl = document.getElementById("saveFirebase");
  if (saveBtnEl) {
    const saveHandler = () => guardarEnFirebaseFn();
    saveBtnEl.addEventListener("click", saveHandler);
    cleanupFunctions.push(() => saveBtnEl.removeEventListener("click", saveHandler));
  }

  // Botón sincronizar con Firebase
  const syncBtnEl = document.getElementById("syncFirebase");
  if (syncBtnEl) {
    const syncHandler = () => sincronizarFn();
    syncBtnEl.addEventListener("click", syncHandler);
    cleanupFunctions.push(() => syncBtnEl.removeEventListener("click", syncHandler));
  }
}
