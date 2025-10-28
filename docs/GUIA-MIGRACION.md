# 🔄 Guía de Migración - Cómo Usar las Nuevas Utilidades

## 🚀 Inicio Rápido

### 1. Sin Cambios Necesarios
**Las páginas HTML existentes NO requieren cambios**. Todos los módulos se importan automáticamente donde se necesitan.

### 2. Sincronizar con Firebase
Para que todas las filas de la tabla tengan el atributo `data-seccion`:
1. Abre la aplicación
2. Haz clic en **"Sincronizar con Firebase"**
3. ¡Listo! Ahora las características se insertarán en la posición correcta

---

## 📚 Cómo Usar Cada Módulo

### Validaciones (`validators.js`)

```javascript
import { 
  validarNombreNoVacio, 
  validarLongitudNombre,
  validarProductoUnico,
  validarCaracteresSeguridad,
  validarCombinado 
} from "./validators.js";

// Validación simple
const resultado = validarNombreNoVacio(nombre);
if (!resultado.valid) {
  console.log(resultado.error); // "El nombre no puede estar vacío"
}

// Validaciones combinadas (recomendado)
const validacion = validarCombinado(
  () => validarNombreNoVacio(nombre),
  () => validarLongitudNombre(nombre, 1, 100),
  () => validarCaracteresSeguridad(nombre),
  () => validarProductoUnico(nombre, tablaHead)
);

if (!validacion.valid) {
  // Muestra automáticamente notificación al usuario
  manejarErrorValidacion(validacion);
  return;
}
```

---

### Constantes (`constants.js`)

```javascript
import { MENSAJES, SELECTORES, CLASES, TIEMPOS } from "./constants.js";

// Antes ❌
alert("Producto agregado. Recuerda guardar en Firebase.");
const btn = document.querySelector("#saveFirebase");
setTimeout(() => {}, 400);

// Después ✅
notificacionExito(MENSAJES.PRODUCTO_AGREGADO);
const btn = document.querySelector(SELECTORES.BTN_SAVE_FIREBASE);
setTimeout(() => {}, TIEMPOS.DEBOUNCE_INPUT);

// Confirmaciones
if (confirm(MENSAJES.CONFIRMAR_ELIMINAR_PRODUCTO(nombre))) {
  // eliminar
}

// Prompts
const nombre = prompt(MENSAJES.PROMPT_NUEVO_PRODUCTO);
```

**Beneficio:** Cambiar un mensaje en un solo lugar actualiza toda la app.

---

### Notificaciones (`notifications.js`)

```javascript
import { 
  notificacionExito,
  notificacionError,
  notificacionAdvertencia,
  notificacionInfo,
  notificacionCargando,
  cerrarTodasNotificaciones
} from "./notifications.js";

// Notificación de éxito (verde)
notificacionExito("¡Datos guardados correctamente!");

// Notificación de error (rojo)
notificacionError("Error al conectar con Firebase");

// Notificación de advertencia (amarillo)
notificacionAdvertencia("El producto ya existe");

// Notificación informativa (azul)
notificacionInfo("Sincronizando datos...");

// Notificación con loading (spinner)
const loading = notificacionCargando("Guardando en Firebase...");
await guardarDatos();
loading.close(); // Cerrar cuando termine
notificacionExito("¡Guardado!");

// Cerrar todas las notificaciones
cerrarTodasNotificaciones();
```

**Características:**
- Auto-cierre en 3 segundos (configurable)
- Cierre manual con botón X
- Animaciones suaves
- Responsive (se adapta a móvil)
- Accesible (aria-live, role)

---

### Manejo de Errores (`error-handler.js`)

```javascript
import { 
  ejecutarConManejador,
  manejarErrorValidacion,
  manejarErrorFirebase,
  logger,
  AppError
} from "./error-handler.js";

// Wrapper automático de try-catch
export async function miFuncion() {
  return ejecutarConManejador(async () => {
    // Tu código aquí
    // Si hay error, se maneja automáticamente
    await operacionPeligrosa();
  }, "mi función"); // Contexto para el log
}

// Logging
logger.info("Operación iniciada", { datos: "..." });
logger.warn("Advertencia", { motivo: "..." });
logger.error("Error crítico", { error: err });
logger.debug("Info de debug", { estado: "..." });

// Manejo específico por tipo
try {
  // operación Firebase
} catch (error) {
  manejarErrorFirebase(error, "guardar datos");
}

// Error personalizado
throw new AppError("Algo salió mal", "TIPO", { detalles: "..." });

// Obtener estadísticas de errores
const stats = obtenerEstadisticasErrores();
console.log(stats.totalErrores); // 5
console.log(stats.erroresPorTipo); // { firebase: 3, validacion: 2 }
```

---

### DOM Optimizado (`dom-optimizado.js`)

```javascript
import { 
  createElement,
  createFragment,
  debounce,
  throttle,
  batchDOMOperations,
  medirPerformance
} from "./dom-optimizado.js";

// Crear elementos (más limpio)
const boton = createElement("button", {
  className: "mi-boton",
  textContent: "Click aquí",
  attributes: {
    "aria-label": "Mi botón",
    "data-id": "123"
  },
  eventListeners: {
    click: () => console.log("Clic!")
  }
});

// Debounce (para input, scroll, resize)
const buscar = debounce((query) => {
  // buscar en API
}, 300); // 300ms delay

// Throttle (para eventos muy frecuentes)
const handleScroll = throttle(() => {
  // manejar scroll
}, 100); // Max 1 vez cada 100ms

// Batch operations (optimización)
batchDOMOperations(contenedor, () => {
  // Múltiples cambios al DOM
  // Se oculta temporalmente para evitar reflows
  contenedor.appendChild(elemento1);
  contenedor.appendChild(elemento2);
  contenedor.appendChild(elemento3);
});

// Medir performance
await medirPerformance("Cargar tabla", async () => {
  await cargarTabla();
});
// Console: "[Performance] Cargar tabla: 123.45ms"

// Fragment para muchos elementos
const fragment = createFragment([
  () => createElement("div", { textContent: "1" }),
  () => createElement("div", { textContent: "2" }),
  () => createElement("div", { textContent: "3" })
]);
contenedor.appendChild(fragment); // 1 solo reflow
```

---

## 🎯 Patrones Comunes

### Patrón 1: Agregar Elemento con Validación

```javascript
export async function agregarNuevo() {
  return ejecutarConManejador(async () => {
    // 1. Pedir nombre
    const nombre = prompt(MENSAJES.PROMPT_NUEVO);
    if (!nombre?.trim()) return;
    
    // 2. Validar
    const validacion = validarCombinado(
      () => validarNombreNoVacio(nombre),
      () => validarLongitudNombre(nombre, 1, 100),
      () => validarUnico(nombre)
    );
    
    if (!validacion.valid) {
      manejarErrorValidacion(validacion);
      return;
    }
    
    // 3. Agregar al DOM
    const elemento = createElement("div", {
      textContent: nombre,
      className: CLASES.MI_CLASE
    });
    contenedor.appendChild(elemento);
    
    // 4. Guardar
    guardarEnLocalStorage(datos);
    
    // 5. Notificar
    notificacionExito(MENSAJES.ELEMENTO_AGREGADO);
    logger.info("Elemento agregado", { nombre });
  }, "agregar nuevo elemento");
}
```

### Patrón 2: Operación Asíncrona con Loading

```javascript
export async function guardar() {
  return ejecutarConManejador(async () => {
    // 1. Mostrar loading
    const loading = notificacionCargando(MENSAJES.GUARDANDO);
    
    // 2. Deshabilitar botones
    const btn = document.querySelector(SELECTORES.BTN_GUARDAR);
    btn.disabled = true;
    btn.classList.add(CLASES.LOADING);
    
    try {
      // 3. Validar
      const validacion = validarEstructuraFirebase(datos);
      if (!validacion.valid) {
        throw new Error(validacion.error);
      }
      
      // 4. Guardar
      await firebase.guardar(datos);
      
      // 5. Éxito
      loading.close();
      notificacionExito(MENSAJES.GUARDADO_EXITO);
      logger.info("Guardado exitoso");
    } catch (error) {
      loading.close();
      throw manejarErrorFirebase(error, "guardar");
    } finally {
      // 6. Re-habilitar
      btn.disabled = false;
      btn.classList.remove(CLASES.LOADING);
    }
  }, "guardar datos");
}
```

### Patrón 3: Input con Debounce

```javascript
import { debounce } from "./dom-optimizado.js";

// Guardar automáticamente al escribir
const guardarDebounced = debounce((valor) => {
  guardarEnLocalStorage({ campo: valor });
  logger.debug("Auto-guardado", { valor });
}, TIEMPOS.DEBOUNCE_INPUT);

textarea.addEventListener("input", (e) => {
  guardarDebounced(e.target.value);
});
```

---

## 🔧 Migrar Código Existente

### Antes (código viejo)
```javascript
function agregar() {
  const nombre = prompt("Nombre:");
  if (!nombre || !nombre.trim()) {
    alert("El nombre no puede estar vacío");
    return;
  }
  
  // Verificar si existe
  const existe = productos.find(p => p === nombre);
  if (existe) {
    alert("Ya existe");
    return;
  }
  
  // Agregar
  const div = document.createElement("div");
  div.className = "producto";
  div.textContent = nombre;
  container.appendChild(div);
  
  // Guardar
  localStorage.setItem("datos", JSON.stringify(datos));
  
  alert("Producto agregado");
}
```

### Después (código nuevo) ✅
```javascript
import { validarCombinado, validarNombreNoVacio, validarUnico } from "./validators.js";
import { notificacionExito } from "./notifications.js";
import { ejecutarConManejador, logger, manejarErrorValidacion } from "./error-handler.js";
import { createElement } from "./dom-optimizado.js";
import { MENSAJES, CLASES } from "./constants.js";

export async function agregar() {
  return ejecutarConManejador(async () => {
    const nombre = prompt(MENSAJES.PROMPT_NUEVO_PRODUCTO);
    if (!nombre?.trim()) return;
    
    const validacion = validarCombinado(
      () => validarNombreNoVacio(nombre),
      () => validarUnico(nombre, productos)
    );
    
    if (!validacion.valid) {
      manejarErrorValidacion(validacion);
      return;
    }
    
    const div = createElement("div", {
      className: CLASES.PRODUCTO,
      textContent: nombre
    });
    container.appendChild(div);
    
    guardarEnLocalStorage(datos);
    
    notificacionExito(MENSAJES.PRODUCTO_AGREGADO);
    logger.info("Producto agregado", { nombre });
  }, "agregar producto");
}
```

**Ventajas:**
- Validaciones reutilizables
- Manejo de errores automático
- Notificación moderna
- Logging para debugging
- Constantes en lugar de strings
- Código más limpio y testeable

---

## ✅ Checklist de Migración

Cuando migres código existente, verifica:

- [ ] Reemplazar `alert()` por notificaciones toast
- [ ] Usar constantes de `MENSAJES` en lugar de strings
- [ ] Usar constantes de `SELECTORES` para querySelector
- [ ] Validar con funciones de `validators.js`
- [ ] Envolver con `ejecutarConManejador()`
- [ ] Agregar logging con `logger`
- [ ] Usar `createElement()` en lugar de document.createElement()
- [ ] Agregar aria-labels para accesibilidad
- [ ] Usar debounce para inputs
- [ ] Agregar loading states en operaciones async

---

## 🆘 Troubleshooting

### Problema: Las notificaciones no aparecen
**Solución:** Verifica que `notifications.js` esté importado y que el CSS esté cargado.

### Problema: Errores de imports
**Solución:** Verifica las rutas relativas (todas deben empezar con `./`).

### Problema: Características se insertan al final
**Solución:** Haz clic en "Sincronizar con Firebase" para regenerar la tabla con `data-seccion`.

### Problema: Validaciones no funcionan
**Solución:** Verifica que estés importando las funciones correctas de `validators.js`.

---

## 📖 Recursos Adicionales

- `MEJORAS-IMPLEMENTADAS.md` - Documentación completa y detallada
- `RESUMEN-EJECUTIVO.md` - Resumen de alto nivel
- Cada archivo `.js` tiene JSDoc completo para autocompletado

---

**¿Dudas?** Revisa los archivos existentes actualizados como ejemplos:
- `productManager.js` - Ejemplo completo de validaciones y notificaciones
- `caracteristicasManager.js` - Ejemplo de error handling
- `syncManager.js` - Ejemplo de loading states
- `eventHandlers.js` - Ejemplo de debounce

**¡Todo listo para empezar a usar las nuevas utilidades!** 🚀
