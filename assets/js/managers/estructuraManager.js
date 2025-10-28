// estructuraManager.js
// Módulo para manejar la extracción de la estructura actual de la tabla

import { limpiarTexto } from "../utils/utils.js";

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
  let seccionActual = "Características"; // Iniciar con "Características" por defecto
  
  // Inicializar la sección de Características
  if (!estructura.secciones["Características"]) {
    estructura.secciones["Características"] = [];
    estructura.ordenSecciones.push("Características");
  }

  filas.forEach((fila) => {
    const th = fila.querySelector("th.section-title-header");
    if (th) {
      // Extraer el texto del span si existe, sino del th directamente
      const span = th.querySelector("span");
      seccionActual = span ? span.textContent.trim() : th.textContent.replace(/\+?\s*Agregar/g, "").trim();
      // Inicializar array de características para esta sección
      if (!estructura.secciones[seccionActual]) {
        estructura.secciones[seccionActual] = [];
        estructura.ordenSecciones.push(seccionActual); // Guardar el orden
      }
      return;
    }

    const celdaNombre = fila.querySelector("td");
    if (!celdaNombre) return;

    // Buscar el título dentro de la estructura de característica
    const tituloDiv = celdaNombre.querySelector(".caracteristica-titulo");
    const nombreCampo = tituloDiv ? limpiarTexto(tituloDiv.textContent) : limpiarTexto(celdaNombre.textContent);
    if (!nombreCampo) return;

    // Si no hay seccionActual, usar "Características" por defecto
    const seccion = seccionActual || "Características";
    
    // Inicializar la sección si no existe
    if (!estructura.secciones[seccion]) {
      estructura.secciones[seccion] = [];
      if (!estructura.ordenSecciones.includes(seccion)) {
        estructura.ordenSecciones.push(seccion);
      }
    }

    // Agregar esta característica a la sección actual
    if (!estructura.secciones[seccion].includes(nombreCampo)) {
      estructura.secciones[seccion].push(nombreCampo);
    }

    const clave = seccion ? `${seccion}:${nombreCampo}` : nombreCampo;
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
