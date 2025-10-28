# Diagrama de Flujo - Sistema de Comparador

## Flujo Principal

```
1. INICIO
   ↓
2. Usuario intenta iniciar sesión
   ├─ Credenciales válidas → Acceso a rutas protegidas (Carpas, Outdoor, Overland)
   └─ Credenciales inválidas → Mostrar error → VOLVER A INICIO

3. Cargar productos desde Firestore Database

4. Renderizar tabla de productos con características y especificaciones

5. Usuario puede:
   ├─ Agregar nuevo producto
   │  ├─ Producto duplicado → Mostrar alerta
   │  └─ Producto válido → Agregar a tabla
   │
   ├─ Agregar nueva característica
   │  ├─ Característica duplicada → Mostrar alerta
   │  └─ Característica válida → Agregar a tabla
   │
   └─ Agregar nueva especificación
      ├─ Especificación duplicada → Mostrar alerta
      └─ Especificación válida → Agregar a tabla

6. Botón "Guardar cambios"
   ↓
7. Actualizar Firestore Database
   ↓
8. Confirmar guardado y recargar tabla
   ↓
9. FIN
```

## Puntos Clave

### Autenticación
- ✅ Protección de rutas (carpas.html, outdoor.html, overland.html)
- ✅ Validación de credenciales
- ✅ Manejo de errores de login

### Validación de Duplicados
- ✅ Productos: Validar antes de agregar
- ✅ Características: Validar antes de agregar
- ✅ Especificaciones: Validar antes de agregar

### Guardado de Datos
- ❌ NO guardar automáticamente
- ✅ SOLO guardar cuando se presiona "Guardar en Firebase"
- ✅ Confirmación visual después de guardar
- ✅ Recargar tabla después de guardar

### Sincronización
- ❌ NO sincronizar automáticamente en tiempo real
- ✅ Cargar datos al inicio desde Firestore
- ✅ Sincronizar solo con botón manual "Sincronizar con Firebase"
