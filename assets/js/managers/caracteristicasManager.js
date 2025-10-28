// caracteristicasManager.js - Gestión de características y especificaciones
import { limpiarTexto } from "../utils/utils.js";
import { agregarFilaASeccion } from "../ui/dom.js";
import { CONFIG } from "../config/config.js";
import { notificacionAdvertencia, notificacionInfo } from "../ui/notifications.js";
import { guardarEnLocalStorage } from "../utils/storage.js";
import { logger } from "../utils/error-handler.js";
import { MENSAJES } from "../config/constants.js";
import { validarNombre, guardarYNotificar, ejecutarConManejo } from "./baseManager.js";

async function agregarFila(nombre, seccion, mensajeExito, mensajeExiste, categoria, tablaBody, obtenerEstructuraFn) {
  if (!await validarNombre(nombre)) return;
  
  const agregado = agregarFilaASeccion(tablaBody, nombre, seccion, categoria, CONFIG);
  
  if (!agregado) {
    notificacionAdvertencia(mensajeExiste);
    return;
  }
  
  guardarYNotificar(
    obtenerEstructuraFn(),
    categoria,
    CONFIG,
    mensajeExito,
    { message: `${seccion} agregada`, data: { nombre, categoria } }
  );
}

export async function agregarCaracteristica(nombre, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    await agregarFila(nombre, "Características", MENSAJES.CARACTERISTICA_AGREGADA, MENSAJES.CARACTERISTICA_EXISTE, categoria, tablaBody, obtenerEstructuraFn);
  }, "agregar característica");
}

export async function agregarEspecificacion(nombre, db, categoria, tablaBody, CONFIG, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    await agregarFila(nombre, "Especificaciones técnicas", MENSAJES.ESPECIFICACION_AGREGADA, MENSAJES.CARACTERISTICA_EXISTE, categoria, tablaBody, obtenerEstructuraFn);
  }, "agregar especificación");
}

export async function editarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    const tituloDiv = fila.querySelector(".caracteristica-titulo");
    const nombreActual = limpiarTexto(tituloDiv.textContent);
    
    const nuevoNombre = prompt(MENSAJES.PROMPT_EDITAR_NOMBRE, nombreActual);
    if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) return;
    
    if (!await validarNombre(nuevoNombre.trim())) return;
    
    tituloDiv.textContent = nuevoNombre.trim();
    guardarYNotificar(
      obtenerEstructuraFn(),
      categoria,
      CONFIG,
      MENSAJES.NOMBRE_ACTUALIZADO,
      { message: "Característica editada", data: { anterior: nombreActual, nuevo: nuevoNombre.trim() } }
    );
  }, "editar característica");
}

export async function eliminarCaracteristica(fila, db, categoria, tablaBody, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    const nombre = limpiarTexto(fila.querySelector(".caracteristica-titulo").textContent);
    
    if (!confirm(MENSAJES.CONFIRMAR_ELIMINAR_CARACTERISTICA(nombre))) return;
    
    fila.remove();
    guardarYNotificar(
      obtenerEstructuraFn(),
      categoria,
      CONFIG,
      MENSAJES.FILA_ELIMINADA,
      { message: "Característica eliminada", data: { nombre } }
    );
  }, "eliminar característica");
}

export function resetearCampo(resetBtn, categoria, tablaBody, obtenerEstructuraFn) {
  const textarea = resetBtn.parentElement.querySelector("textarea");
  if (textarea) {
    textarea.value = "";
    guardarEnLocalStorage(obtenerEstructuraFn(), categoria);
    notificacionInfo(MENSAJES.CAMPO_RESETEADO);
    logger.debug("Campo reseteado");
  }
}
