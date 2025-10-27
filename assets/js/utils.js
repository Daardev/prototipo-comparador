// utils.js

export function normalizarCategoria(titulo) {
  const base = titulo.split("|")[0].trim();
  return base.charAt(0).toUpperCase() + base.slice(1).toLowerCase();
}

export function limpiarTexto(nombre) {
  if (nombre === undefined || nombre === null) return '';
  return String(nombre)
    .replace(/✏️|🗑️|🖉|📝|✍️/g, '')
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
    const cleanKey = limpiarTexto(rawKey) || rawKey;
    datos[cleanKey] = datosRaw[rawKey];
  });

  return { secciones, productos, datos, metadata: estructura.metadata || {} };
}

export function mostrarMensaje(mensaje, tipo) {
  const div = document.createElement("div");
  div.textContent = mensaje;
  div.className = `mensaje ${tipo}`;
  div.style.position = "fixed";
  div.style.top = "20px";
  div.style.right = "20px";
  div.style.padding = "10px 20px";
  div.style.borderRadius = "5px";
  div.style.color = "#fff";
  if (tipo === "success") div.style.backgroundColor = "#4CAF50";
  else if (tipo === "error") div.style.backgroundColor = "#f44336";
  else if (tipo === "info") div.style.backgroundColor = "#2196F3";
  else if (tipo === "warning") div.style.backgroundColor = "#dc3545";
  div.style.zIndex = "1000";
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
