// table.js
import { limpiarTexto } from './utils.js';

export function obtenerEstructuraActual(tablaBody, categoria, CONFIG) {
  const estructura = {
    secciones: {},
    datos: {},
    productos: CONFIG[categoria]
  };

  let seccionActual = null;
  const filas = tablaBody.querySelectorAll("tr");

  filas.forEach(fila => {
    const seccionTH = fila.querySelector("th.section-title");
    if (seccionTH) {
      seccionActual = limpiarTexto(seccionTH.textContent)
        .replace(/\+?\s*Agregar/g, '')
        .trim();
      estructura.secciones[seccionActual] = [];
    } else {
      const td = fila.querySelector("td");
      if (!td) return;

      const caracteristica = limpiarTexto(td.textContent);
      if (seccionActual && caracteristica) {
        estructura.secciones[seccionActual].push(caracteristica);

        // 🔹 Clave con prefijo de sección
        const clave = `${seccionActual}:${caracteristica}`;
        estructura.datos[clave] = {};

        const textareas = fila.querySelectorAll("textarea");
        textareas.forEach((textarea, index) => {
          const producto = CONFIG[categoria][index];
          if (producto) {
            estructura.datos[clave][producto] = textarea.value;
          }
        });
      }
    }
  });

  console.log("🧩 Estructura guardada:", estructura);
  return estructura;
}
