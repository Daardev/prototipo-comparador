# 🧩 Prototipo Comparador de Productos

**Prototipo web interactivo** para comparar productos según sus **características** y **especificaciones técnicas**, desarrollado con **HTML, CSS y JavaScript puro (Vanilla JS)**.

El proyecto permite crear, editar y gestionar dinámicamente tablas comparativas de productos, almacenando los datos de forma persistente en el navegador mediante `localStorage`, con sincronización en tiempo real utilizando **Firebase Firestore**.

🌐 **Demo en vivo:** [https://comparador-8nd.pages.dev/](https://comparador-8nd.pages.dev/)

---

## 🚀 Características principales

- ➕ **Gestión dinámica de productos:**  
  Agrega, edita y elimina productos (columnas) directamente desde la interfaz.

- ✏️ **Gestión completa de características:**  
  Crea, edita y elimina características y especificaciones técnicas (filas) sin recargar la página.

- 🔄 **Sincronización en tiempo real:**  
  Los cambios se sincronizan automáticamente con Firebase, visible para todos los usuarios conectados.

- 💾 **Persistencia dual:**  
  Datos guardados en `localStorage` (local) y Firebase Firestore (nube) para máxima confiabilidad.

- 🔒 **Autenticación segura:**  
  Control de acceso mediante Firebase Authentication con persistencia de sesión.

- 📊 **Ordenamiento automático:**  
  Características y especificaciones se ordenan alfabéticamente de forma automática.

- ⚠️ **Validación de duplicados:**  
  Previene la creación de características o productos con nombres duplicados.

- 🎨 **Diseño responsivo:**  
  Interfaz adaptable a diferentes tamaños de pantalla con glassmorphism en login.

---

## 🛠️ Tecnologías utilizadas

| Tipo | Tecnología |
|------|-------------|
| Frontend | HTML5, CSS3, JavaScript ES6+ (Modules) |
| Backend | Firebase Firestore (Base de datos en tiempo real) |
| Autenticación | Firebase Authentication |
| Hosting | Cloudflare Pages |
| Almacenamiento local | localStorage API |
| Arquitectura | Modular con Single Responsibility Principle |

---

## 📁 Arquitectura Modular

El proyecto sigue una **arquitectura modular** con separación de responsabilidades:

### 📂 Módulos Principales

```
assets/js/
├── comparador.js              # 🎯 Orquestador principal (100 líneas)
├── productManager.js          # 🛒 Gestión de productos (170 líneas)
├── caracteristicasManager.js  # 📝 Gestión de características (150 líneas)
├── syncManager.js             # ☁️ Sincronización Firebase (200 líneas)
├── eventHandlers.js           # 🎮 Event listeners centralizados (150 líneas)
├── estructuraManager.js       # 📊 Extracción de estructura (70 líneas)
├── dom.js                     # 🎨 Renderizado DOM
├── utils.js                   # 🔧 Utilidades
├── storage.js                 # 💾 LocalStorage
├── config.js                  # ⚙️ Configuración
├── auth.js                    # 🔐 Autenticación
└── firebase.js                # 🔥 Inicialización Firebase
```

### 1. **comparador.js** (Orquestador)
- Coordina todos los módulos
- Gestiona ciclo de vida y autenticación
- Configura listeners y limpieza de recursos

### 2. **productManager.js** (Productos)
- `agregarProducto()` - Nueva columna de producto
- `editarProducto()` - Renombrar producto
- `eliminarProducto()` - Eliminar columna completa

### 3. **caracteristicasManager.js** (Características)
- `agregarCaracteristica()` - Nueva característica
- `agregarEspecificacion()` - Nueva especificación
- `editarCaracteristica()` - Renombrar fila
- `eliminarCaracteristica()` - Eliminar fila
- `resetearCampo()` - Limpiar campo individual

### 4. **syncManager.js** (Sincronización)
- `cargarTablaInicial()` - Carga desde Firebase/localStorage
- `guardarEnFirebase()` - Guardar estructura
- `sincronizarDesdeFirebase()` - Sincronización manual
- `configurarSnapshotListener()` - Listener en tiempo real

### 5. **eventHandlers.js** (Eventos)
- `configurarEventListeners()` - Clicks en tabla
- `configurarBotones()` - Botones de UI

### 6. **estructuraManager.js** (Datos)
- `obtenerEstructuraActual()` - Extrae productos, secciones y datos

---

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
    onSnapshot() → Actualiza otros clientes en tiempo real
```

---

## 🗂️ Estructura del Proyecto

```
prototipo-comparador/
├── index.html                 # Página de login
├── carpas.html                # Comparador de carpas
├── outdoor.html               # Comparador outdoor
├── overland.html              # Comparador overland
├── ARCHITECTURE.md            # Documentación de arquitectura
├── README.md                  # Este archivo
├── .gitignore                 # Archivos ignorados
└── assets/
    ├── css/
    │   └── style.css          # Estilos globales + responsivo
    ├── js/
    │   ├── comparador.js      # Orquestador principal
    │   ├── productManager.js  # Gestión de productos
    │   ├── caracteristicasManager.js
    │   ├── syncManager.js
    │   ├── eventHandlers.js
    │   ├── estructuraManager.js
    │   ├── dom.js
    │   ├── utils.js
    │   ├── storage.js
    │   ├── config.js
    │   ├── auth.js
    │   ├── firebase.js
    │   ├── app.js
    │   └── console-silencer.js
    └── img/
        └── pexels-camcasey-2007139.jpg
```

---

## 📊 Ventajas de la Arquitectura

✅ **Separación de Responsabilidades**: Cada módulo tiene una función clara  
✅ **Mantenibilidad**: Fácil encontrar y modificar funcionalidades  
✅ **Testeable**: Módulos independientes pueden probarse por separado  
✅ **Escalable**: Agregar features sin afectar código existente  
✅ **Legibilidad**: Código limpio y autodocumentado  
✅ **Reutilizable**: Funciones utilizables en otros contextos  

---

## 🚀 Instalación y Uso

### Requisitos previos
- Navegador moderno con soporte para ES6 Modules
- Conexión a internet (para Firebase)

### Configuración

1. **Clona el repositorio:**
```bash
git clone https://github.com/Daardev/prototipo-comparador.git
cd prototipo-comparador
```

2. **Configura Firebase:**
   - Edita `assets/js/firebase.js` con tus credenciales de Firebase
   - Configura Firestore Database en modo producción
   - Habilita Authentication con Email/Password

3. **Abre la aplicación:**
   - Puedes usar cualquier servidor local o abrir `index.html` directamente
   - Recomendado: Live Server en VS Code

4. **Login:**
   - Usa las credenciales configuradas en Firebase Authentication
   - O crea una cuenta nueva desde la consola de Firebase

---

## 🎯 Uso de la Aplicación

### Gestión de Productos (Columnas)

1. **Agregar Producto:**
   - Click en "➕ Agregar Producto"
   - Ingresa el nombre del producto
   - Se crea una nueva columna automáticamente

2. **Editar Producto:**
   - Click en el botón ✏️ junto al nombre del producto
   - Modifica el nombre y confirma

3. **Eliminar Producto:**
   - Click en el botón 🗑️ junto al producto
   - Confirma la eliminación (se perderán todos sus datos)

### Gestión de Características (Filas)

1. **Agregar Característica:**
   - Click en "➕ Agregar Característica"
   - Ingresa el nombre y confirma

2. **Agregar Especificación:**
   - Click en "➕ Agregar Especificación"
   - Ingresa el nombre y confirma

3. **Editar Característica:**
   - Click en el botón ✏️ junto a la característica
   - Modifica el nombre y confirma

4. **Eliminar Característica:**
   - Click en el botón 🗑️ junto a la característica
   - Confirma la eliminación

### Sincronización

- **Guardar:** Click en "💾 Guardar en Firebase"
- **Sincronizar:** Click en "🔄 Sincronizar con Firebase"
- **Automático:** Los cambios se sincronizan en tiempo real

---

## 🔧 Mantenimiento

### Para agregar nuevas funcionalidades:

- **Productos:** Edita `productManager.js`
- **Características:** Edita `caracteristicasManager.js`
- **Sincronización:** Edita `syncManager.js`
- **UI/Eventos:** Edita `eventHandlers.js`
- **Renderizado:** Edita `dom.js`

### Debugging:

- Cada módulo tiene logs de error específicos
- Usa `console.error()` en los bloques catch
- Mensajes al usuario vía `mostrarMensaje()` en `utils.js`

---

## 📝 Notas Técnicas

- Los datos se guardan en estructura compartida: `comparadores/shared/categorias/{categoria}`
- Todos los usuarios editan la misma tabla (colaborativo)
- Persistencia dual: localStorage + Firestore
- Ordenamiento alfabético automático
- Validación de duplicados integrada
- Console logs filtrados para producción

---

## 📄 Licencia

Este proyecto es de código abierto bajo licencia MIT.

---

## 👨‍💻 Autor

**Darwin** - [Daardev](https://github.com/Daardev)

---

## 🔗 Enlaces

- **Demo:** [https://comparador-8nd.pages.dev/](https://comparador-8nd.pages.dev/)
- **Repositorio:** [https://github.com/Daardev/prototipo-comparador](https://github.com/Daardev/prototipo-comparador)
- **Documentación Arquitectura:** [ARCHITECTURE.md](./ARCHITECTURE.md)
