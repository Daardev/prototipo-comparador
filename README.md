# 🧩 Prototipo Comparador de Productos

**Prototipo web interactivo** para comparar productos según sus **características** y **especificaciones técnicas**, desarrollado con **HTML, CSS y JavaScript puro (Vanilla JS)**.

El proyecto permite crear, editar y gestionar dinámicamente tablas comparativas de productos, almacenando los datos de forma persistente en el navegador mediante `localStorage`, con opción de sincronización en la nube utilizando **Firebase Firestore**.

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

