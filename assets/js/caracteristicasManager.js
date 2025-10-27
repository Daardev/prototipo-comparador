// caracteristicasManager.js
// Módulo para gestionar características y especificaciones

import { limpiarTexto, mostrarMensaje } from "./utils.js";
import { guardarEnLocalStorage } from "./storage.js";
import { agregarFilaASeccion } from "./dom.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/**
 * Agrega una nueva característica
 */
export async function agregarCaracteristica(nombre, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn) {
  const agregado = agregarFilaASeccion(tablaBody, nombre, "Características", categoria, CONFIG);
  
  // Si ya existe, mostrar warning y salir
  if (!agregado) {
    mostrarMensaje(`La característica "${nombre}" ya existe.`, "warning");
    return;
  }
  
  const estructura = obtenerEstructuraFn();
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
}

/**
 * Agrega una nueva especificación técnica
 */
export async function agregarEspecificacion(nombre, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn) {
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
  
  const estructura = obtenerEstructuraFn();
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
}

/**
 * Edita el nombre de una característica/especificación
 */
export async function editarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn) {
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
  const estructura = obtenerEstructuraFn();
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
}

/**
 * Elimina una característica/especificación (fila completa)
 */
export async function eliminarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn) {
  const nombre = limpiarTexto(fila.querySelector("td").textContent);
  if (!confirm(`¿Eliminar "${nombre}"?`)) return;
  
  fila.remove();
  const estructura = obtenerEstructuraFn();
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
}

/**
 * Resetea un campo individual
 */
export function resetearCampo(resetBtn, categoria, tablaBody, obtenerEstructuraFn) {
  const textarea = resetBtn.parentElement.querySelector("textarea");
  if (textarea) textarea.value = "";
  const estructura = obtenerEstructuraFn();
  guardarEnLocalStorage(estructura, categoria);
  mostrarMensaje("Campo reseteado.", "info");
}
