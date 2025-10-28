// error-handler.js
// Sistema robusto de manejo de errores

import { MENSAJES } from "../config/constants.js";

/**
 * Importación dinámica de notificaciones para evitar dependencia circular
 * @returns {Promise<Function>}
 */
async function obtenerNotificacionError() {
  try {
    const modulo = await import('../ui/notifications.js');
    return modulo.notificacionError;
  } catch (error) {
    console.error('Error al cargar módulo de notificaciones:', error);
    return (mensaje) => console.error(mensaje);
  }
}

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(mensaje, tipo = "general", detalles = {}) {
    super(mensaje);
    this.name = "AppError";
    this.tipo = tipo;
    this.detalles = detalles;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Tipos de errores
 */
export const TIPOS_ERROR = {
  VALIDACION: "validacion",
  FIREBASE: "firebase",
  STORAGE: "storage",
  DOM: "dom",
  RED: "red",
  GENERAL: "general",
};

/**
 * Logger centralizado (versión simplificada - solo métodos usados)
 */
class Logger {
  log(nivel, mensaje, datos = null) {
    const metodo = nivel === "error" ? "error" : nivel === "warn" ? "warn" : "log";
    console[metodo](`[${nivel.toUpperCase()}] ${mensaje}`, datos || "");
  }

  info(mensaje, datos) { this.log("info", mensaje, datos); }
  warn(mensaje, datos) { this.log("warn", mensaje, datos); }
  error(mensaje, datos) { this.log("error", mensaje, datos); }
  debug(mensaje, datos) { this.log("debug", mensaje, datos); }
}

// Instancia global del logger
export const logger = new Logger();

/**
 * Maneja errores de validación
 * @param {Object} resultadoValidacion - Resultado de una validación
 * @param {boolean} mostrarNotificacion - Si debe mostrar notificación al usuario
 */
export async function manejarErrorValidacion(resultadoValidacion, mostrarNotificacion = true) {
  if (resultadoValidacion.valid) return;

  const error = new AppError(
    resultadoValidacion.error,
    TIPOS_ERROR.VALIDACION,
    resultadoValidacion
  );

  logger.warn("Error de validación", error);

  if (mostrarNotificacion) {
    const notificacionError = await obtenerNotificacionError();
    notificacionError(resultadoValidacion.error);
  }

  return error;
}

/**
 * Maneja errores de Firebase
 * @param {Error} error - Error original
 * @param {string} operacion - Operación que falló
 * @param {boolean} mostrarNotificacion - Si debe mostrar notificación al usuario
 */
export async function manejarErrorFirebase(error, operacion = "operación", mostrarNotificacion = true) {
  const mensajeUsuario = obtenerMensajeFirebaseAmigable(error);
  
  const appError = new AppError(
    mensajeUsuario,
    TIPOS_ERROR.FIREBASE,
    { error, operacion }
  );

  logger.error(`Error en Firebase (${operacion})`, {
    mensaje: error.message,
    code: error.code,
    stack: error.stack,
  });

  if (mostrarNotificacion) {
    const notificacionError = await obtenerNotificacionError();
    notificacionError(mensajeUsuario);
  }

  return appError;
}

/**
 * Convierte códigos de error de Firebase a mensajes amigables
 */
function obtenerMensajeFirebaseAmigable(error) {
  const codigosError = {
    "permission-denied": "No tienes permisos para realizar esta operación.",
    "unavailable": "El servicio no está disponible. Verifica tu conexión a internet.",
    "not-found": "Los datos solicitados no existen.",
    "already-exists": "Los datos ya existen.",
    "failed-precondition": "No se cumplen las condiciones para esta operación.",
    "unauthenticated": "Debes iniciar sesión para realizar esta operación.",
  };

  return codigosError[error.code] || MENSAJES.ERROR_FIREBASE;
}

/**
 * Maneja errores generales con try-catch
 * @param {Function} fn - Función a ejecutar
 * @param {string} contexto - Contexto de la operación
 * @param {Function} fallback - Función de fallback en caso de error
 */
export async function ejecutarConManejador(fn, contexto = "operación", fallback = null) {
  try {
    return await fn();
  } catch (error) {
    logger.error(`Error en ${contexto}`, error);
    
    if (error instanceof AppError) {
      // Ya es un error manejado
      return fallback ? fallback(error) : null;
    }

    // Error no manejado
    const appError = new AppError(
      MENSAJES.ERROR_OPERACION,
      TIPOS_ERROR.GENERAL,
      { error, contexto }
    );

    const notificacionError = await obtenerNotificacionError();
    notificacionError(MENSAJES.ERROR_OPERACION);
    
    return fallback ? fallback(appError) : null;
  }
}
