// storage.js

import { obtenerEstructuraActual } from './table.js';

export function guardarEnLocalStorage(estructura, categoria, tablaBody, CONFIG) {
  try {
    // Si no me pasas estructura/categoria, la calculo yo.
    if (!estructura && tablaBody && categoria && CONFIG) {
      estructura = obtenerEstructuraActual(tablaBody, categoria, CONFIG);
    }
    if (!estructura || !categoria) {
      console.warn('guardarEnLocalStorage: faltan datos, no se guardó.');
      return;
    }
    const key = `backup_${categoria}`;
    localStorage.setItem(key, JSON.stringify(estructura));
    console.log('Cambios guardados localmente:', { key, estructura });
  } catch (err) {
    console.warn('No se pudo guardar backup local:', err);
  }
}

export function cargarBackupLocal(categoria) {
  const keyNew = `backup_${categoria}`;
  const dataNew = localStorage.getItem(keyNew);
  if (dataNew) {
    try { return JSON.parse(dataNew); } catch(e) { console.warn('Error parseando backup nuevo', e); }
  }
  return null;
}

export function esEstructuraPorDefecto(estructura) {
  if (!estructura) return true;
  const datos = estructura.datos || {};
  const tieneDatos = Object.keys(datos).some(k => {
    const v = datos[k];
    if (!v) return false;
    return Object.values(v).some(val => val && String(val).trim() !== '');
  });
  const secciones = estructura.secciones || {};
  const tieneSecciones = Object.keys(secciones).length > 0;
  return !(tieneDatos || tieneSecciones);
}
