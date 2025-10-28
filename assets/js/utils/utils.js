// utils.js

export function normalizarCategoria(titulo) {
  const base = titulo.split("|")[0].trim();
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

/**
 * Normaliza texto removiendo acentos y convirtiendo a minúsculas
 */
export function normalizar(str) {
  return (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function limpiarTexto(nombre) {
  if (nombre === undefined || nombre === null) return '';
  return String(nombre)
    .replace(/✏️|🗑️|🖉|📝|✍️/g, '')
    // Limpiar palabras de Material Icons (tanto separadas como juntas)
    .replace(/edit/gi, '')
    .replace(/delete/gi, '')
    .replace(/clear/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function sanitizeEstructura(estructura, categoria = '', CONFIG = {}) {
  if (!estructura) {
    const productosFallback = (CONFIG && categoria && CONFIG[categoria]) ? CONFIG[categoria] : [];
    return { secciones: {}, productos: productosFallback, datos: {} };
  }
  const productos = estructura.productos && Array.isArray(estructura.productos)
    ? estructura.productos
    : ((CONFIG && categoria && CONFIG[categoria]) ? CONFIG[categoria] : []);

  const seccionesRaw = estructura.secciones || {};
  const datosRaw = estructura.datos || {};

  const secciones = {};
  const datos = {};

  Object.entries(seccionesRaw).forEach(([secTitle, items]) => {
    const secClean = limpiarTexto(secTitle) || secTitle;
    const cleanedItems = Array.isArray(items) ? items.map(i => limpiarTexto(i)) : [];
    secciones[secClean] = cleanedItems;
  });

  Object.keys(datosRaw || {}).forEach(rawKey => {
    let cleanKey = rawKey;
    
    // Si la clave contiene ':', limpiar ambas partes
    if (rawKey.includes(':')) {
      const [seccion, nombre] = rawKey.split(':');
      const seccionLimpia = limpiarTexto(seccion);
      const nombreLimpio = limpiarTexto(nombre);
      cleanKey = `${seccionLimpia}:${nombreLimpio}`;
    } else {
      cleanKey = limpiarTexto(rawKey) || rawKey;
    }
    
    datos[cleanKey] = datosRaw[rawKey];
  });

  return { 
    secciones, 
    productos, 
    datos, 
    metadata: estructura.metadata || {},
    ordenSecciones: estructura.ordenSecciones || []
  };
}

/**
 * Muestra un mensaje al usuario (wrapper para compatibilidad)
 * Usa el nuevo sistema de notificaciones
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo: success, error, warning, info
 */
export function mostrarMensaje(mensaje, tipo = "info") {
  // Importación dinámica para evitar dependencias circulares
  import('./notifications.js').then(({ mostrarNotificacion }) => {
    mostrarNotificacion(mensaje, tipo);
  }).catch(() => {
    // Fallback si el módulo de notificaciones falla
    console.log(`[${tipo.toUpperCase()}] ${mensaje}`);
  });
}
