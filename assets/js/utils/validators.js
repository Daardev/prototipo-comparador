// validators.js
// Sistema centralizado de validación

import { normalizar } from "../utils/utils.js";

/**
 * Valida que un nombre no esté vacío
 * @param {string} nombre - Nombre a validar
 * @returns {{valid: boolean, error?: string}}
 */
export function validarNombreNoVacio(nombre) {
  if (!nombre || !nombre.trim()) {
    return { valid: false, error: "El nombre no puede estar vacío" };
  }
  return { valid: true };
}

/**
 * Valida la longitud de un nombre
 * @param {string} nombre - Nombre a validar
 * @param {number} min - Longitud mínima
 * @param {number} max - Longitud máxima
 * @returns {{valid: boolean, error?: string}}
 */
export function validarLongitudNombre(nombre, min = 1, max = 100) {
  const length = nombre.trim().length;
  if (length < min) {
    return { valid: false, error: `El nombre debe tener al menos ${min} caracteres` };
  }
  if (length > max) {
    return { valid: false, error: `El nombre no puede exceder ${max} caracteres` };
  }
  return { valid: true };
}

/**
 * Valida que un producto no exista ya en la tabla
 * @param {string} nombre - Nombre del producto
 * @param {HTMLElement} tablaHead - Header de la tabla
 * @returns {{valid: boolean, error?: string}}
 */
export function validarProductoUnico(nombre, tablaHead) {
  const headRow = tablaHead.querySelector("tr");
  if (!headRow) return { valid: true };
  
  const productosExistentes = [...headRow.querySelectorAll("th .product-name")];
  const nombreNormalizado = normalizar(nombre.trim());
  
  for (const productoSpan of productosExistentes) {
    const nombreExistente = productoSpan.textContent.trim();
    if (normalizar(nombreExistente) === nombreNormalizado) {
      return { 
        valid: false, 
        error: `El producto "${nombre.trim()}" ya existe` 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Valida que una característica sea única en su sección
 * @param {string} nombre - Nombre de la característica
 * @param {string} seccionId - ID de la sección
 * @param {HTMLElement} tablaBody - Body de la tabla
 * @returns {{valid: boolean, error?: string}}
 */
export function validarCaracteristicaUnica(nombre, seccionId, tablaBody) {
  const filas = [...tablaBody.querySelectorAll("tr")];
  const filasDeSeccion = filas.filter(r => r.getAttribute("data-seccion") === seccionId);
  const nombreNormalizado = normalizar(nombre.trim());
  
  for (const fila of filasDeSeccion) {
    const tituloDiv = fila.querySelector(".caracteristica-titulo");
    if (tituloDiv) {
      const nombreExistente = tituloDiv.textContent.trim();
      if (normalizar(nombreExistente) === nombreNormalizado) {
        return { 
          valid: false, 
          error: `La característica "${nombre.trim()}" ya existe en esta sección` 
        };
      }
    }
  }
  
  return { valid: true };
}

/**
 * Valida caracteres especiales peligrosos
 * @param {string} texto - Texto a validar
 * @returns {{valid: boolean, error?: string}}
 */
export function validarCaracteresSeguridad(texto) {
  const caracteresProhibidos = /<|>|script|eval|onerror|onclick/gi;
  if (caracteresProhibidos.test(texto)) {
    return { 
      valid: false, 
      error: "El texto contiene caracteres no permitidos por seguridad" 
    };
  }
  return { valid: true };
}

/**
 * Valida estructura de datos antes de guardar en Firebase
 * @param {Object} estructura - Estructura a validar
 * @returns {{valid: boolean, error?: string}}
 */
export function validarEstructuraFirebase(estructura) {
  if (!estructura || typeof estructura !== 'object') {
    return { 
      valid: false, 
      error: "La estructura de datos es inválida" 
    };
  }
  
  if (!estructura.datos || typeof estructura.datos !== 'object') {
    return { 
      valid: false, 
      error: "La estructura debe contener un objeto 'datos'" 
    };
  }
  
  if (!estructura.productos || !Array.isArray(estructura.productos)) {
    return { 
      valid: false, 
      error: "La estructura debe contener un array 'productos'" 
    };
  }
  
  if (!estructura.secciones || typeof estructura.secciones !== 'object') {
    return { 
      valid: false, 
      error: "La estructura debe contener un objeto 'secciones'" 
    };
  }
  
  return { valid: true };
}

/**
 * Ejecuta múltiples validaciones y retorna la primera que falle
 * @param {...Function} validadores - Funciones de validación
 * @returns {{valid: boolean, error?: string}}
 */
export function validarCombinado(...validadores) {
  for (const validador of validadores) {
    const resultado = validador();
    if (!resultado.valid) {
      return resultado;
    }
  }
  return { valid: true };
}
