# 📁 Estructura de Carpetas - Proyecto Comparador

## 🎯 Nueva Organización

La estructura de archivos JavaScript ha sido reorganizada en carpetas lógicas para mejor mantenibilidad y escalabilidad.

---

## 📂 Estructura Actual

```
assets/js/
├── 📁 config/                 # Configuración y constantes
│   ├── config.js              # Configuración de la aplicación
│   ├── firebase.js            # Configuración de Firebase
│   └── constants.js           # Constantes globales del sistema
│
├── 📁 core/                   # Núcleo de la aplicación
│   ├── app.js                 # Aplicación principal (login)
│   ├── auth.js                # Autenticación y protección de rutas
│   └── comparador.js          # Orquestador principal del comparador
│
├── 📁 managers/               # Gestores de lógica de negocio
│   ├── baseManager.js         # Funcionalidades compartidas entre managers
│   ├── productManager.js      # Gestión de productos
│   ├── caracteristicasManager.js # Gestión de características/especificaciones
│   ├── estructuraManager.js   # Extracción de estructura de la tabla
│   └── syncManager.js         # Sincronización con Firebase
│
├── 📁 ui/                     # Interfaz de usuario
│   ├── dom.js                 # Manipulación y renderizado del DOM
│   ├── dom-optimizado.js      # Utilidades optimizadas (createElement, debounce)
│   ├── notifications.js       # Sistema de notificaciones toast
│   ├── table.js               # Gestión de tablas
│   └── eventHandlers.js       # Manejadores de eventos
│
└── 📁 utils/                  # Utilidades generales
    ├── utils.js               # Funciones auxiliares generales
    ├── validators.js          # Sistema de validación
    ├── storage.js             # Gestión de localStorage
    ├── error-handler.js       # Manejo robusto de errores
    └── console-silencer.js    # Silenciador de consola
```

---

## 📖 Descripción de Carpetas

### 🔧 config/
**Propósito:** Configuración y constantes del sistema

**Archivos:**
- `config.js` - Configuración de categorías y secciones
- `firebase.js` - Inicialización de Firebase (Firestore, Auth)
- `constants.js` - Constantes centralizadas (mensajes, selectores, clases, etc.)

**Dependencias:** Ninguna (archivos base)

---

### 🚀 core/
**Propósito:** Lógica central de la aplicación

**Archivos:**
- `app.js` - Página de login, formulario de autenticación
- `auth.js` - Sistema de autenticación con Firebase Auth
- `comparador.js` - Orquestador principal, inicializa todos los módulos

**Dependencias:** 
- Importa desde: `config/`, `managers/`, `ui/`, `utils/`
- No es importado por: ningún otro módulo (punto de entrada)

---

### 🎛️ managers/
**Propósito:** Gestores de lógica de negocio

**Archivos:**
- `baseManager.js` - Lógica compartida (validación, guardado, notificación)
- `productManager.js` - CRUD de productos
- `caracteristicasManager.js` - CRUD de características/especificaciones
- `estructuraManager.js` - Extrae estructura actual de la tabla
- `syncManager.js` - Sincronización bidireccional con Firebase

**Dependencias:**
- Importa desde: `config/`, `ui/`, `utils/`
- Importado por: `core/`, `ui/eventHandlers.js`

---

### 🎨 ui/
**Propósito:** Todo lo relacionado con la interfaz de usuario

**Archivos:**
- `dom.js` - Creación y manipulación de tablas HTML
- `dom-optimizado.js` - Utilidades de performance (createElement, debounce)
- `notifications.js` - Sistema de notificaciones toast modernas
- `table.js` - Funciones específicas de tablas
- `eventHandlers.js` - Configuración de todos los event listeners

**Dependencias:**
- Importa desde: `config/`, `managers/`, `utils/`
- Importado por: `core/`, `managers/`

---

### 🛠️ utils/
**Propósito:** Utilidades reutilizables en todo el proyecto

**Archivos:**
- `utils.js` - Funciones auxiliares (limpiarTexto, normalizar, etc.)
- `validators.js` - Sistema de validación centralizado
- `storage.js` - Gestión de localStorage
- `error-handler.js` - Sistema robusto de manejo de errores con Logger
- `console-silencer.js` - Silenciador de mensajes de consola

**Dependencias:**
- Importa desde: `config/` (solo constants.js)
- Importado por: todos los demás módulos

---

## 🔄 Flujo de Imports

```
┌─────────────────────────────────────────┐
│           HTML (index, carpas, etc)      │
└───────────────┬─────────────────────────┘
                │
                ▼
        ┌───────────────┐
        │  core/app.js  │
        │ core/comparador.js │
        └───────┬───────┘
                │
    ┌───────────┼───────────┐
    ▼           ▼           ▼
┌──────┐  ┌──────────┐  ┌──────┐
│config│  │ managers │  │  ui  │
└──┬───┘  └────┬─────┘  └──┬───┘
   │           │            │
   │           ▼            │
   │      ┌────────┐        │
   └──────►  utils ◄────────┘
          └────────┘
```

---

## 📝 Convenciones de Import

### Desde `managers/`:
```javascript
import { CONFIG } from "../config/config.js";
import { validarNombre } from "../utils/validators.js";
import { notificacionExito } from "../ui/notifications.js";
```

### Desde `ui/`:
```javascript
import { CONSTANTES } from "../config/constants.js";
import { agregarProducto } from "../managers/productManager.js";
import { sanitizeEstructura } from "../utils/utils.js";
```

### Desde `core/`:
```javascript
import { auth } from "../config/firebase.js";
import { cargarTablaInicial } from "../managers/syncManager.js";
import { configurarEventListeners } from "../ui/eventHandlers.js";
```

---

## ✅ Beneficios de la Nueva Estructura

### 1. **Organización Clara**
- Cada carpeta tiene un propósito bien definido
- Fácil encontrar archivos por categoría

### 2. **Escalabilidad**
- Agregar nuevos managers, utilidades o componentes UI es sencillo
- Estructura preparada para crecer

### 3. **Mantenibilidad**
- Código más fácil de mantener
- Dependencias claras entre módulos

### 4. **Reutilización**
- Utilidades y managers son fácilmente reutilizables
- Menos duplicación de código

### 5. **Trabajo en Equipo**
- Diferentes desarrolladores pueden trabajar en diferentes carpetas
- Menos conflictos de merge

---

## 🔍 Encontrar Archivos Rápidamente

### Por Funcionalidad:
- **¿Autenticación?** → `core/auth.js`
- **¿Firebase config?** → `config/firebase.js`
- **¿Agregar producto?** → `managers/productManager.js`
- **¿Validar datos?** → `utils/validators.js`
- **¿Notificaciones?** → `ui/notifications.js`
- **¿Manejo de errores?** → `utils/error-handler.js`

### Por Tipo:
- **Configuración** → `config/`
- **Lógica de negocio** → `managers/`
- **Interfaz** → `ui/`
- **Herramientas** → `utils/`
- **Inicialización** → `core/`

---

## 📊 Métricas

| Carpeta | Archivos | Líneas Aprox. | Propósito |
|---------|----------|---------------|-----------|
| `config/` | 3 | ~250 | Configuración |
| `core/` | 3 | ~270 | Núcleo |
| `managers/` | 5 | ~650 | Lógica |
| `ui/` | 5 | ~650 | Interfaz |
| `utils/` | 5 | ~550 | Utilidades |
| **TOTAL** | **21** | **~2,370** | **100%** |

---

## 🎯 Próximos Pasos Sugeridos

### Corto Plazo:
- ✅ Estructura reorganizada
- ✅ Imports actualizados
- ✅ Sin errores de compilación

### Mediano Plazo:
- [ ] Agregar tests unitarios por carpeta
- [ ] Documentar APIs de cada módulo
- [ ] Crear diagramas de flujo detallados

### Largo Plazo:
- [ ] Separar `ui/` en subcarpetas (components, services)
- [ ] Crear carpeta `types/` para TypeScript (si se migra)
- [ ] Agregar carpeta `tests/` con estructura espejo

---

## 📚 Referencias

- **Documentación anterior:** Ver `ARCHITECTURE.md`
- **Refactorización:** Ver `REFACTORIZACION-COMPLETADA.md`
- **Fase 5:** Ver archivos de documentación de fases

---

**Fecha de reorganización:** 28 de octubre de 2025  
**Versión:** 3.0.0 (Nueva estructura)  
**Estado:** ✅ Completado sin errores
