// notifications.js
// Sistema de notificaciones toast mejorado

import { MENSAJES, TIEMPOS, CLASES } from "../config/constants.js";

// Contenedor para las notificaciones
let notificationContainer = null;

/**
 * Inicializa el contenedor de notificaciones
 */
function inicializarContenedor() {
  if (notificationContainer) return;
  
  notificationContainer = document.createElement("div");
  notificationContainer.id = "notification-container";
  notificationContainer.className = "notification-container";
  document.body.appendChild(notificationContainer);
}

/**
 * Muestra una notificación toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación: success, error, warning, info
 * @param {number} duracion - Duración en milisegundos
 */
export function mostrarNotificacion(mensaje, tipo = "info", duracion = TIEMPOS.MENSAJE_DURACION) {
  inicializarContenedor();
  
  const notification = document.createElement("div");
  notification.className = `notification notification-${tipo}`;
  notification.setAttribute("role", "alert");
  notification.setAttribute("aria-live", "polite");
  
  // Icono según el tipo
  const iconos = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ"
  };
  
  const icon = document.createElement("span");
  icon.className = "notification-icon";
  icon.textContent = iconos[tipo] || iconos.info;
  
  const text = document.createElement("span");
  text.className = "notification-text";
  text.textContent = mensaje;
  
  const closeBtn = document.createElement("button");
  closeBtn.className = "notification-close";
  closeBtn.textContent = "×";
  closeBtn.setAttribute("aria-label", "Cerrar notificación");
  closeBtn.onclick = () => cerrarNotificacion(notification);
  
  notification.appendChild(icon);
  notification.appendChild(text);
  notification.appendChild(closeBtn);
  
  notificationContainer.appendChild(notification);
  
  // Animación de entrada
  requestAnimationFrame(() => {
    notification.classList.add("notification-show");
  });
  
  // Auto-cerrar después de la duración especificada
  if (duracion > 0) {
    setTimeout(() => cerrarNotificacion(notification), duracion);
  }
  
  return notification;
}

/**
 * Cierra una notificación
 * @param {HTMLElement} notification - Elemento de notificación a cerrar
 */
function cerrarNotificacion(notification) {
  if (!notification || !notification.parentNode) return;
  
  notification.classList.remove("notification-show");
  notification.classList.add("notification-hide");
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, TIEMPOS.ANIMACION_LARGA);
}

/**
 * Muestra una notificación de éxito
 * @param {string} mensaje - Mensaje a mostrar
 */
export function notificacionExito(mensaje) {
  return mostrarNotificacion(mensaje, CLASES.SUCCESS);
}

/**
 * Muestra una notificación de error
 * @param {string} mensaje - Mensaje a mostrar
 */
export function notificacionError(mensaje) {
  return mostrarNotificacion(mensaje, CLASES.ERROR);
}

/**
 * Muestra una notificación de advertencia
 * @param {string} mensaje - Mensaje a mostrar
 */
export function notificacionAdvertencia(mensaje) {
  return mostrarNotificacion(mensaje, CLASES.WARNING);
}

/**
 * Muestra una notificación informativa
 * @param {string} mensaje - Mensaje a mostrar
 */
export function notificacionInfo(mensaje) {
  return mostrarNotificacion(mensaje, CLASES.INFO);
}

/**
 * Muestra una notificación de carga con spinner
 * @param {string} mensaje - Mensaje a mostrar
 * @returns {Object} Objeto con método close() para cerrar la notificación
 */
export function notificacionCargando(mensaje) {
  inicializarContenedor();
  
  const notification = document.createElement("div");
  notification.className = "notification notification-loading";
  notification.setAttribute("role", "status");
  notification.setAttribute("aria-live", "polite");
  
  const spinner = document.createElement("span");
  spinner.className = "notification-spinner";
  
  const text = document.createElement("span");
  text.className = "notification-text";
  text.textContent = mensaje;
  
  notification.appendChild(spinner);
  notification.appendChild(text);
  
  notificationContainer.appendChild(notification);
  
  // Animación de entrada
  requestAnimationFrame(() => {
    notification.classList.add("notification-show");
  });
  
  return {
    close: () => cerrarNotificacion(notification),
    update: (nuevoMensaje) => {
      text.textContent = nuevoMensaje;
    }
  };
}

/**
 * Cierra todas las notificaciones activas
 */
export function cerrarTodasNotificaciones() {
  if (!notificationContainer) return;
  
  const notifications = notificationContainer.querySelectorAll(".notification");
  notifications.forEach(notification => cerrarNotificacion(notification));
}
