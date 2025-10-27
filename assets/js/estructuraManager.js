// estructuraManager.js
// Módulo para manejar la extracción de la estructura actual de la tabla

import { limpiarTexto } from "./utils.js";

/**
 * Extrae la estructura actual de la tabla (productos, secciones, datos)
 */
export function obtenerEstructuraActual(tablaHead, tablaBody, categoria, CONFIG) {
  // Obtener productos dinámicamente desde el header
  const productosActuales = [];
  const headRow = tablaHead.querySelector("tr");
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
    ordenSecciones: [] // Mantener el orden explícito
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
