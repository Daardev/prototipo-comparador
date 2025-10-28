// dom-optimizado.js
// Utilidades optimizadas para operaciones DOM (versión minimizada - solo funciones usadas)

import { TIEMPOS } from "../config/constants.js";

/**
 * Crea un elemento HTML con atributos y contenido de forma optimizada
 * @param {string} tag - Nombre del tag HTML  
 * @param {Object} opts - Configuración del elemento
 * @returns {HTMLElement}
 */
export function createElement(tag, opts = {}) {
  const el = document.createElement(tag);
  
  if (opts.className) el.className = opts.className;
  if (opts.id) el.id = opts.id;
  if (opts.textContent) el.textContent = opts.textContent;
  if (opts.innerHTML) el.innerHTML = opts.innerHTML;
  
  if (opts.attributes) {
    for (const [key, val] of Object.entries(opts.attributes)) {
      el.setAttribute(key, val);
    }
  }
  
  if (opts.dataset) {
    for (const [key, val] of Object.entries(opts.dataset)) {
      el.dataset[key] = val;
    }
  }
  
  if (opts.children) {
    for (const child of opts.children) {
      el.appendChild(child instanceof HTMLElement ? child : document.createTextNode(child));
    }
  }
  
  return el;
}

/**
 * Debounce: Retrasa la ejecución de una función hasta que pasen X ms sin llamadas
 * @param {Function} func - Función a ejecutar
 * @param {number} wait - Tiempo de espera en ms
 * @param {boolean} immediate - Si debe ejecutarse inmediatamente en el primer llamado
 * @returns {Function} Función debounced
 */
export function debounce(func, wait = TIEMPOS.DEBOUNCE_INPUT, immediate = false) {
  let timeout;
  
  return function(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func.apply(this, args);
  };
}
