// baseManager.js - Lógica compartida para managers
import { sanitizeEstructura } from "../utils/utils.js";
import { guardarEnLocalStorage } from "../utils/storage.js";
import { notificacionExito } from "../ui/notifications.js";
import { validarNombreNoVacio, validarLongitudNombre, validarCaracteresSeguridad, validarCombinado } from "../utils/validators.js";
import { manejarErrorValidacion, ejecutarConManejador, logger } from "../utils/error-handler.js";
import { LIMITES } from "../config/constants.js";

export async function validarNombre(nombre) {
  const validacion = validarCombinado(
    () => validarNombreNoVacio(nombre),
    () => validarLongitudNombre(nombre, LIMITES.NOMBRE_MIN, LIMITES.NOMBRE_MAX),
    () => validarCaracteresSeguridad(nombre)
  );
  
  if (!validacion.valid) {
    await manejarErrorValidacion(validacion);
    return false;
  }
  return true;
}

export function guardarYNotificar(estructura, categoria, CONFIG, mensaje, logData) {
  const estructuraLimpia = sanitizeEstructura(estructura, categoria, CONFIG);
  guardarEnLocalStorage(estructuraLimpia, categoria);
  notificacionExito(mensaje);
  logger.info(logData.message, logData.data);
}

export function ejecutarConManejo(fn, operacion) {
  return ejecutarConManejador(fn, operacion);
}
