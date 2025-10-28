// productManager.js - Gestión de productos
import { validarProductoUnico, validarCombinado, validarNombreNoVacio, validarLongitudNombre, validarCaracteresSeguridad } from "../utils/validators.js";
import { manejarErrorValidacion, logger } from "../utils/error-handler.js";
import { MENSAJES, LIMITES, CLASES, ICONOS } from "../config/constants.js";
import { createElement } from "../ui/dom-optimizado.js";
import { guardarYNotificar, ejecutarConManejo, validarNombre } from "./baseManager.js";
import { CONFIG } from "../config/config.js";

function crearBotonProducto(className, icono, label) {
  return createElement("button", {
    className,
    innerHTML: `<span class="${CLASES.MATERIAL_ICONS}">${icono}</span>`,
    attributes: { "aria-label": label }
  });
}

function crearCeldaProducto() {
  const cont = createElement("div", { className: CLASES.FIELD_CONTAINER });
  cont.appendChild(createElement("textarea", { attributes: { rows: "2" } }));
  cont.appendChild(crearBotonProducto(CLASES.RESET_FIELD, ICONOS.CLEAR, "Limpiar campo"));
  
  const td = createElement("td");
  td.appendChild(cont);
  return td;
}

export async function agregarProducto(db, categoria, tablaHead, tablaBody, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    const nombreProducto = prompt(MENSAJES.PROMPT_NUEVO_PRODUCTO);
    if (!nombreProducto || !nombreProducto.trim()) return;
    
    const nombre = nombreProducto.trim();
    
    const validacion = validarCombinado(
      () => validarNombreNoVacio(nombre),
      () => validarLongitudNombre(nombre, LIMITES.NOMBRE_MIN, LIMITES.NOMBRE_MAX),
      () => validarCaracteresSeguridad(nombre),
      () => validarProductoUnico(nombre, tablaHead)
    );
    
    if (!validacion.valid) {
      await manejarErrorValidacion(validacion);
      return;
    }
    
    const headRow = tablaHead.querySelector("tr");
    if (!headRow) {
      logger.error("No se encontró el header row");
      return;
    }
    
    const th = createElement("th");
    const container = createElement("div", { className: CLASES.PRODUCT_HEADER });
    const span = createElement("span", { className: CLASES.PRODUCT_NAME, textContent: nombre });
    
    container.appendChild(span);
    container.appendChild(crearBotonProducto(CLASES.EDIT_PRODUCT, ICONOS.EDIT, "Editar producto"));
    container.appendChild(crearBotonProducto(CLASES.DELETE_PRODUCT, ICONOS.DELETE, "Eliminar producto"));
    th.appendChild(container);
    headRow.appendChild(th);
    
    tablaBody.querySelectorAll("tr").forEach(fila => {
      if (!fila.querySelector("th.section-title")) {
        fila.appendChild(crearCeldaProducto());
      } else {
        const th = fila.querySelector("th.section-title");
        if (th) th.colSpan = parseInt(th.colSpan) + 1;
      }
    });
    
    guardarYNotificar(
      obtenerEstructuraFn(),
      categoria,
      CONFIG,
      MENSAJES.PRODUCTO_AGREGADO,
      { message: "Producto agregado", data: { nombre, categoria } }
    );
  }, "agregar producto");
}

export async function editarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    const span = th.querySelector(".product-name");
    const nombreActual = span.textContent.trim();
    
    const nuevoNombre = prompt(MENSAJES.PROMPT_EDITAR_PRODUCTO, nombreActual);
    if (!nuevoNombre || !nuevoNombre.trim() || nuevoNombre.trim() === nombreActual) return;
    
    if (!await validarNombre(nuevoNombre.trim())) return;
    
    span.textContent = nuevoNombre.trim();
    guardarYNotificar(
      obtenerEstructuraFn(),
      categoria,
      CONFIG,
      MENSAJES.PRODUCTO_RENOMBRADO,
      { message: "Producto renombrado", data: { anterior: nombreActual, nuevo: nuevoNombre.trim() } }
    );
  }, "editar producto");
}

export async function eliminarProducto(th, db, categoria, tablaBody, obtenerEstructuraFn) {
  return ejecutarConManejo(async () => {
    const nombreProducto = th.querySelector(".product-name").textContent.trim();
    
    if (!confirm(MENSAJES.CONFIRMAR_ELIMINAR_PRODUCTO(nombreProducto))) return;
    
    const thIndex = [...th.parentElement.children].indexOf(th);
    th.remove();
    
    tablaBody.querySelectorAll("tr").forEach(fila => {
      const sectionTh = fila.querySelector("th.section-title");
      if (sectionTh) {
        sectionTh.colSpan = parseInt(sectionTh.colSpan) - 1;
      } else {
        const celdas = fila.querySelectorAll("td");
        if (celdas[thIndex - 1]) celdas[thIndex - 1].remove();
      }
    });
    
    guardarYNotificar(
      obtenerEstructuraFn(),
      categoria,
      CONFIG,
      MENSAJES.PRODUCTO_ELIMINADO,
      { message: "Producto eliminado", data: { nombre: nombreProducto } }
    );
  }, "eliminar producto");
}
