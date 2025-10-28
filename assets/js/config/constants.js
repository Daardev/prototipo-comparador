// constants.js
// Constantes globales de la aplicación

/**
 * Mensajes del sistema
 */
export const MENSAJES = {
  // Éxitos
  CARACTERISTICA_AGREGADA: "Característica agregada. Recuerda guardar en Firebase.",
  ESPECIFICACION_AGREGADA: "Especificación agregada. Recuerda guardar en Firebase.",
  PRODUCTO_AGREGADO: "Producto agregado. Recuerda guardar en Firebase.",
  PRODUCTO_RENOMBRADO: "Producto renombrado. Recuerda guardar en Firebase.",
  PRODUCTO_ELIMINADO: "Producto eliminado. Recuerda guardar en Firebase.",
  NOMBRE_ACTUALIZADO: "Nombre actualizado. Recuerda guardar en Firebase.",
  FILA_ELIMINADA: "Fila eliminada. Recuerda guardar en Firebase.",
  CAMPO_RESETEADO: "Campo reseteado.",
  GUARDADO_FIREBASE: "Datos guardados en Firebase correctamente.",
  SINCRONIZADO_FIREBASE: "Datos sincronizados desde Firebase correctamente.",
  
  // Información
  SINCRONIZANDO: "Sincronizando datos...",
  GUARDANDO: "Guardando datos...",
  CARGANDO: "Cargando datos...",
  NO_HAY_DATOS_FIREBASE: "No hay datos en Firebase para sincronizar.",
  
  // Advertencias
  PRODUCTO_EXISTE: "El producto ya existe.",
  CARACTERISTICA_EXISTE: "La característica ya existe en esta sección.",
  
  // Errores
  ERROR_GUARDAR_FIREBASE: "Error al guardar en Firebase.",
  ERROR_SINCRONIZAR_FIREBASE: "Error al sincronizar con Firebase.",
  ERROR_CARGAR_FIREBASE: "Error al cargar datos de Firebase.",
  ERROR_ESTRUCTURA_INVALIDA: "La estructura de datos es inválida.",
  ERROR_OPERACION: "Ha ocurrido un error. Por favor, intenta de nuevo.",
  
  // Confirmaciones
  CONFIRMAR_ELIMINAR_PRODUCTO: (nombre) => `¿Eliminar el producto "${nombre}"? Se perderán todos sus datos.`,
  CONFIRMAR_ELIMINAR_CARACTERISTICA: (nombre) => `¿Eliminar "${nombre}"?`,
  
  // Prompts
  PROMPT_NUEVO_PRODUCTO: "Nombre del nuevo producto:",
  PROMPT_NUEVA_CARACTERISTICA: "Nombre de la nueva característica:",
  PROMPT_NUEVA_ESPECIFICACION: "Nombre de la nueva especificación:",
  PROMPT_EDITAR_PRODUCTO: "Editar nombre del producto:",
  PROMPT_EDITAR_NOMBRE: "Editar nombre:",
};

/**
 * Selectores DOM comunes
 */
export const SELECTORES = {
  // Tabla
  TABLA_HEAD: "#tablaComparacion thead",
  TABLA_BODY: "#tablaComparacion tbody",
  TABLA_ROW: "tr",
  TABLA_CELL: "td",
  TABLA_HEADER: "th",
  
  // Productos
  PRODUCT_HEADER: ".product-header",
  PRODUCT_NAME: ".product-name",
  EDIT_PRODUCT: ".edit-product",
  DELETE_PRODUCT: ".delete-product",
  
  // Características
  CARACTERISTICA_HEADER: ".caracteristica-header",
  CARACTERISTICA_TITULO: ".caracteristica-titulo",
  CARACTERISTICA_BOTONES: ".caracteristica-botones",
  EDIT_NAME: ".edit-name",
  DELETE_ROW: ".delete-row",
  
  // Campos
  FIELD_CONTAINER: ".field-container",
  TEXTAREA: "textarea",
  RESET_FIELD: ".reset-field",
  
  // Secciones
  SECTION_TITLE: ".section-title",
  SECTION_TITLE_HEADER: ".section-title-header",
  
  // Botones globales
  BTN_ADD_PRODUCT: "#addProduct",
  BTN_ADD_CARACTERISTICA: ".btn-agregar-caracteristica-global",
  BTN_ADD_ESPECIFICACION: ".btn-agregar-especificacion-global",
  BTN_SAVE_FIREBASE: "#saveFirebase",
  BTN_SYNC_FIREBASE: "#syncFirebase",
  
  // Material Icons
  MATERIAL_ICONS: ".material-icons",
};

/**
 * Clases CSS comunes
 */
export const CLASES = {
  PRODUCT_HEADER: "product-header",
  PRODUCT_NAME: "product-name",
  EDIT_PRODUCT: "edit-product",
  DELETE_PRODUCT: "delete-product",
  
  CARACTERISTICA_HEADER: "caracteristica-header",
  CARACTERISTICA_TITULO: "caracteristica-titulo",
  CARACTERISTICA_BOTONES: "caracteristica-botones",
  EDIT_NAME: "edit-name",
  DELETE_ROW: "delete-row",
  
  FIELD_CONTAINER: "field-container",
  RESET_FIELD: "reset-field",
  
  SECTION_TITLE: "section-title",
  SECTION_TITLE_HEADER: "section-title-header",
  
  MATERIAL_ICONS: "material-icons",
  
  // Estados
  DISABLED: "disabled",
  LOADING: "loading",
  ERROR: "error",
  SUCCESS: "success",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Atributos de datos
 */
export const DATA_ATTRIBUTES = {
  SECCION: "data-seccion",
  PRODUCTO_INDEX: "data-producto-index",
  FILA_INDEX: "data-fila-index",
};

/**
 * IDs de secciones
 */
export const SECCIONES_IDS = {
  CARACTERISTICAS: "caracteristicas",
  ESPECIFICACIONES: "especificaciones",
};

/**
 * Eventos personalizados
 */
export const EVENTOS = {
  AGREGAR_CARACTERISTICA: "agregarCaracteristica",
  AGREGAR_ESPECIFICACION: "agregarEspecificacion",
  TABLA_ACTUALIZADA: "tablaActualizada",
  DATOS_SINCRONIZADOS: "datosSincronizados",
  ERROR_FIREBASE: "errorFirebase",
};

/**
 * Tiempos (en milisegundos)
 */
export const TIEMPOS = {
  DEBOUNCE_INPUT: 400,
  MENSAJE_DURACION: 3000,
  ANIMACION_CORTA: 150,
  ANIMACION_LARGA: 300,
  TIMEOUT_FIREBASE: 10000,
};

/**
 * Límites de validación
 */
export const LIMITES = {
  NOMBRE_MIN: 1,
  NOMBRE_MAX: 100,
  DESCRIPCION_MAX: 500,
  PRODUCTOS_MAX: 10,
  CARACTERISTICAS_MAX: 50,
};

/**
 * Configuración de Firebase
 */
export const FIREBASE_CONFIG = {
  COLLECTION_BASE: "comparadores",
  DOCUMENT_SHARED: "shared",
  SUBCOLLECTION_CATEGORIAS: "categorias",
  VERSION: "1.0",
};

/**
 * Configuración de LocalStorage
 */
const STORAGE_PREFIX = "comparador_";

export const STORAGE_CONFIG = {
  PREFIX: STORAGE_PREFIX,
  ESTRUCTURA_KEY: (categoria) => `${STORAGE_PREFIX}${categoria}`,
  BACKUP_KEY: (categoria) => `${STORAGE_PREFIX}backup_${categoria}`,
  VERSION_KEY: `${STORAGE_PREFIX}version`,
};

/**
 * Iconos Material Icons
 */
export const ICONOS = {
  EDIT: "edit",
  DELETE: "delete",
  CLEAR: "clear",
  ADD: "add",
  SAVE: "save",
  SYNC: "sync",
  CHECK: "check",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

/**
 * Expresiones regulares comunes
 */
export const REGEX = {
  SOLO_LETRAS: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  ALFANUMERICO: /^[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]+$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  CARACTERES_PELIGROSOS: /<|>|script|eval|onerror|onclick/gi,
};
