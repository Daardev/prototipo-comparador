# 🧩 Prototipo Comparador de Productos

**Prototipo web interactivo** para comparar productos según sus **características** y **especificaciones técnicas**, desarrollado con **HTML, CSS y JavaScript puro (Vanilla JS)**.

El proyecto permite crear, editar y gestionar dinámicamente tablas comparativas de productos, almacenando los datos de forma persistente en el navegador mediante `localStorage`, con opción de sincronización en la nube utilizando **Firebase Firestore**.

🌐 **Demo en vivo:** [https://comparador-8nd.pages.dev/](https://comparador-8nd.pages.dev/)

---

## 🚀 Características principales

- 🧱 **Estructura dinámica:**  
  Las secciones (“Características” y “Especificaciones técnicas”) se generan automáticamente desde la configuración definida en `config.js`.

- ✏️ **Gestión completa desde la interfaz:**  
  El usuario puede agregar, editar y eliminar características o especificaciones directamente en la tabla sin recargar la página.

- 💾 **Persistencia local automática:**  
  Los cambios se guardan en `localStorage`, manteniendo los datos aunque se cierre o recargue el navegador.

- ☁️ **Integración opcional con Firebase:**  
  Permite autenticación de usuarios (`auth.js`) y respaldo remoto de los datos en Firestore (`firebase.js`).

- 🔒 **Protección de acceso:**  
  Las rutas están protegidas por verificación de sesión, evitando el acceso no autorizado a los comparadores.

- 🧩 **Arquitectura modular:**  
  Cada funcionalidad está organizada en módulos independientes (DOM, configuración, almacenamiento, utilidades, tablas, etc.).

- 🌐 **Hosting gratuito:**  
  Desplegado y accesible públicamente en **Cloudflare Pages**.

---

## 🛠️ Tecnologías utilizadas

| Tipo | Tecnología |
|------|-------------|
| Frontend | HTML5, CSS3, JavaScript (ES6 Modules) |
| Backend (opcional) | Firebase Firestore |
| Autenticación | Firebase Auth |
| Hosting | Cloudflare Pages |
| Almacenamiento local | localStorage API |

---

## 🧰 Estructura del proyecto

📁 /prototipo-comparador
├── index.html
├── carpas.html
├── overland.html
├── outdoor.html
├── /css
│ └── style.css
├── /js
│ ├── app.js # Punto de entrada general
│ ├── auth.js # Control de autenticación Firebase
│ ├── comparador.js # Lógica principal del comparador (render, eventos, guardado)
│ ├── config.js # Configuración de categorías, productos y secciones
│ ├── dom.js # Renderizado dinámico de tablas y estructura visual
│ ├── firebase.js # Inicialización de Firebase y configuración
│ ├── storage.js # Manejo de localStorage (guardar, cargar, backup)
│ ├── table.js # Lectura y reconstrucción de estructura de la tabla
│ ├── utils.js # Funciones utilitarias (sanitizar, normalizar, helpers)
│ └── ...
└── /assets # (Opcional) Imágenes o recursos adicionales