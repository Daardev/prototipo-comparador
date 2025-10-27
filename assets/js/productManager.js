// productManager.js
// Módulo para gestionar productos (agregar, editar, eliminar)

import { limpiarTexto, mostrarMensaje } from "./utils.js";
import { guardarEnLocalStorage } from "./storage.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

/**
 * Agrega un nuevo producto (columna) a la tabla
 */
export async function agregarProducto(db, categoria, tablaHead, tablaBody, obtenerEstructuraFn) {
  const nombreProducto = prompt("Nombre del nuevo producto:");
  if (!nombreProducto || !nombreProducto.trim()) return;
  
  const nombre = nombreProducto.trim();
  
  // Agregar nueva columna al header
  const headRow = tablaHead.querySelector("tr");
  if (!headRow) return;
  
  const th = document.createElement("th");
  
  // Crear contenedor para nombre y botones
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.alignItems = "center";
  container.style.justifyContent = "center";
  container.style.gap = "8px";
  
  const span = document.createElement("span");
  span.textContent = nombre;
  span.style.cursor = "pointer";
  span.className = "product-name";
  span.title = "Click para editar";
  
  const btnEdit = document.createElement("button");
  btnEdit.className = "edit-product";
  btnEdit.textContent = "✏️";
  btnEdit.title = "Editar nombre";
  btnEdit.style.fontSize = "0.9em";
  
  const btnDel = document.createElement("button");
  btnDel.className = "delete-product";
  btnDel.textContent = "🗑️";
  btnDel.title = "Eliminar producto";
  btnDel.style.fontSize = "0.9em";
  
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
  const estructura = obtenerEstructuraFn();
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

/**
 * Edita el nombre de un producto existente
 */
export async function editarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn) {
  const span = th.querySelector(".product-name");
  const nombreActual = span.textContent.trim();
  
  const nuevoNombre = prompt("Editar nombre del producto:", nombreActual);
  if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) return;
  
  // Actualizar el nombre en el span
  span.textContent = nuevoNombre.trim();
  
  // Obtener estructura actual y actualizar productos
  const estructura = obtenerEstructuraFn();
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
}

/**
 * Elimina un producto (columna completa)
 */
export async function eliminarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn) {
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
  const estructura = obtenerEstructuraFn();
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
}
