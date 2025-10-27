# 📁 Estructura Modular del Código

## 🎯 Arquitectura

El código ha sido modularizado siguiendo el principio de **Single Responsibility** para mejorar la mantenibilidad, legibilidad y escalabilidad.

## 📂 Módulos Creados

### 1. **comparador.js** (Orquestador Principal)
- **Responsabilidad**: Coordinar todos los módulos y gestionar el ciclo de vida de la aplicación
- **Funciones**:
  - Inicialización de Firebase y autenticación
  - Configuración de listeners y limpieza
  - Orquestación de carga inicial y sincronización

### 2. **productManager.js** (Gestión de Productos)
- **Responsabilidad**: Manejar toda la lógica relacionada con productos (columnas)
- **Funciones exportadas**:
  - `agregarProducto()` - Agrega nueva columna de producto
  - `editarProducto()` - Renombra un producto existente
  - `eliminarProducto()` - Elimina columna completa de producto

### 3. **caracteristicasManager.js** (Gestión de Características)
- **Responsabilidad**: Manejar características y especificaciones (filas)
- **Funciones exportadas**:
  - `agregarCaracteristica()` - Agrega nueva característica
  - `agregarEspecificacion()` - Agrega nueva especificación técnica
  - `editarCaracteristica()` - Renombra característica/especificación
  - `eliminarCaracteristica()` - Elimina fila completa
  - `resetearCampo()` - Limpia un campo individual

### 4. **syncManager.js** (Sincronización con Firebase)
- **Responsabilidad**: Toda la lógica de comunicación con Firebase
- **Funciones exportadas**:
  - `cargarTablaInicial()` - Carga datos desde Firebase o localStorage
  - `guardarEnFirebase()` - Guarda estructura actual en Firebase
  - `sincronizarDesdeFirebase()` - Sincronización manual forzada
  - `configurarSnapshotListener()` - Escucha cambios en tiempo real

### 5. **eventHandlers.js** (Gestión de Eventos)
- **Responsabilidad**: Configurar y manejar todos los event listeners
- **Funciones exportadas**:
  - `configurarEventListeners()` - Listeners de tabla (clicks, edición)
  - `configurarBotones()` - Listeners de botones de UI

### 6. **estructuraManager.js** (Extracción de Datos)
- **Responsabilidad**: Extraer la estructura actual desde el DOM
- **Funciones exportadas**:
  - `obtenerEstructuraActual()` - Captura productos, secciones y datos de la tabla

### 7. **dom.js** (Renderizado)
- **Responsabilidad**: Manipulación y renderizado del DOM
- **Funciones existentes**:
  - `crearTablaConEstructura()` - Renderiza tabla completa
  - `agregarFilaASeccion()` - Agrega fila a sección específica

### 8. **utils.js** (Utilidades)
- **Responsabilidad**: Funciones auxiliares reutilizables
- **Funciones**: `limpiarTexto()`, `mostrarMensaje()`, `sanitizeEstructura()`, etc.

### 9. **storage.js** (Almacenamiento Local)
- **Responsabilidad**: Gestión de localStorage
- **Funciones**: `guardarEnLocalStorage()`, `cargarBackupLocal()`, etc.

### 10. **config.js** (Configuración)
- **Responsabilidad**: Configuración estática de la aplicación
- **Contiene**: Definiciones de categorías, secciones y productos por defecto

## 🔄 Flujo de Datos

```
Usuario → Event (eventHandlers.js)
         ↓
    Manager específico (productManager / caracteristicasManager)
         ↓
    Actualiza DOM
         ↓
    obtenerEstructuraActual() (estructuraManager.js)
         ↓
    guardarEnLocalStorage() (storage.js)
         ↓
    setDoc() → Firebase (syncManager.js)
         ↓
    onSnapshot() → Actualiza otros clientes
```

## 📊 Ventajas de esta Arquitectura

✅ **Separación de Responsabilidades**: Cada módulo tiene una función clara
✅ **Mantenibilidad**: Más fácil encontrar y modificar funcionalidades
✅ **Testeable**: Cada módulo se puede probar independientemente
✅ **Escalable**: Fácil agregar nuevas funcionalidades sin afectar otras
✅ **Legibilidad**: Código más limpio y fácil de entender
✅ **Reutilizable**: Funciones pueden ser usadas en otros contextos

## 🗂️ Estructura de Archivos

```
assets/js/
├── comparador.js              # Orquestador principal (100 líneas)
├── productManager.js          # Gestión de productos (170 líneas)
├── caracteristicasManager.js  # Gestión de características (150 líneas)
├── syncManager.js             # Sincronización Firebase (200 líneas)
├── eventHandlers.js           # Event listeners (150 líneas)
├── estructuraManager.js       # Extracción de estructura (70 líneas)
├── dom.js                     # Renderizado DOM
├── utils.js                   # Utilidades
├── storage.js                 # LocalStorage
├── config.js                  # Configuración
├── auth.js                    # Autenticación
├── firebase.js                # Inicialización Firebase
└── comparador-backup.js       # Backup del original
```

## 🔧 Mantenimiento

### Para agregar una nueva funcionalidad:

1. **Productos**: Edita `productManager.js`
2. **Características**: Edita `caracteristicasManager.js`
3. **Sincronización**: Edita `syncManager.js`
4. **UI/Eventos**: Edita `eventHandlers.js`
5. **Renderizado**: Edita `dom.js`

### Para debugging:

- Cada módulo tiene logs de error específicos
- Usa `console.error()` en los bloques catch de cada manager
- Mensajes al usuario a través de `mostrarMensaje()` en utils.js

## 📝 Notas

- El archivo original se guardó como `comparador-backup.js`
- Todos los módulos usan ES6 modules (import/export)
- La funcionalidad es idéntica, solo cambió la organización del código
