// dom.js - Manipulación y renderizado de tablas
import { limpiarTexto, normalizar } from "../utils/utils.js";
import { CONFIG } from "../config/config.js";
import { createElement } from "../ui/dom-optimizado.js";

export function limpiarTabla(tablaHead, tablaBody) {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";
}

function crearBoton(className, icon) {
  const btn = createElement("button", { className });
  btn.innerHTML = `<span class="material-icons">${icon}</span>`;
  return btn;
}

function crearCeldaTexto(valor = "") {
  const cont = createElement("div", { className: "field-container" });
  const textarea = createElement("textarea", { rows: 2 });
  textarea.value = valor;
  cont.appendChild(textarea);
  cont.appendChild(crearBoton("reset-field", "clear"));
  
  const td = createElement("td");
  td.appendChild(cont);
  return td;
}

function crearBotonesCaracteristica() {
  const container = createElement("div", { className: "caracteristica-botones" });
  container.appendChild(crearBoton("edit-name", "edit"));
  container.appendChild(crearBoton("delete-row", "delete"));
  return container;
}

function crearCeldaNombre(texto) {
  const container = createElement("div", { className: "caracteristica-header" });
  const titulo = createElement("div", { className: "caracteristica-titulo" });
  titulo.textContent = texto;
  
  container.appendChild(titulo);
  container.appendChild(crearBotonesCaracteristica());
  
  const td = createElement("td");
  td.appendChild(container);
  return td;
}

function resolverClave(datos, seccion, nombre) {
  const wantedSec = normalizar(seccion);
  const wantedName = normalizar(nombre);

  let candidata = Object.keys(datos).find((k) => {
    const [sec, nm] = k.includes(":") ? k.split(":") : ["", k];
    return normalizar(sec) === wantedSec && normalizar(nm) === wantedName;
  });
  if (candidata) return candidata;

  candidata = Object.keys(datos).find(
    (k) => normalizar(k) === wantedName && !k.includes(":")
  );
  if (candidata) return candidata;

  const coincidencias = Object.keys(datos).filter((k) => {
    const nm = k.includes(":") ? k.split(":")[1] : k;
    return normalizar(nm) === wantedName;
  });
  return coincidencias.length === 1 ? coincidencias[0] : null;
}

export function crearTablaConEstructura({ secciones, productos, datos, ordenSecciones }, tablaHead, tablaBody) {
  limpiarTabla(tablaHead, tablaBody);

  const headRow = createElement("tr");
  const thFirst = createElement("th", { className: "section-title-header" });
  thFirst.innerHTML = "<span>Características</span>";
  headRow.appendChild(thFirst);
  
  productos.forEach((p) => {
    const th = createElement("th");
    const container = createElement("div", { className: "product-header" });
    const span = createElement("span", { className: "product-name" });
    span.textContent = p;
    
    container.appendChild(span);
    container.appendChild(crearBoton("edit-product", "edit"));
    container.appendChild(crearBoton("delete-product", "delete"));
    th.appendChild(container);
    headRow.appendChild(th);
  });
  tablaHead.appendChild(headRow);

  const seccionesOrdenadas = ordenSecciones && ordenSecciones.length > 0
    ? ordenSecciones.map(nombre => [nombre, secciones[nombre]])
    : Object.entries(secciones);

  seccionesOrdenadas.forEach(([nombreSeccion, listaCaracteristicas]) => {
    if (!listaCaracteristicas) return;
    
    const nombreSeccionLimpio = nombreSeccion.toLowerCase();
    const esCaracteristicas = nombreSeccionLimpio.includes("característica");
    
    if (!esCaracteristicas) {
      tablaBody.appendChild(crearEncabezadoSeccion(nombreSeccion, productos));
    }

    const caracteristicas = Array.isArray(listaCaracteristicas) && listaCaracteristicas.length
      ? listaCaracteristicas
      : Object.keys(listaCaracteristicas || {});

    [...caracteristicas].sort((a, b) => a.localeCompare(b, 'es', { sensitivity: 'base' }))
      .forEach((nombreCaracteristica) => {
        const nombreLimpio = limpiarTexto(nombreCaracteristica);
        const tr = createElement("tr");
        
        // Usar determinarSeccionId para consistencia
        const seccionId = determinarSeccionId(nombreSeccion);
        tr.setAttribute("data-seccion", seccionId);

        tr.appendChild(crearCeldaNombre(nombreLimpio));

        const clave = datos ? resolverClave(datos, nombreSeccion, nombreLimpio) : null;
        productos.forEach((producto) => {
          const valor = clave ? datos[clave]?.[producto] ?? "" : "";
          tr.appendChild(crearCeldaTexto(valor));
        });

        tablaBody.appendChild(tr);
      });
  });
}

function crearEncabezadoSeccion(nombreSeccion, productos) {
  const tr = createElement("tr", { className: "section-title-row" });
  const th = createElement("th", { className: "section-title-header" });
  th.colSpan = productos.length + 1;

  const nombreLimpio = nombreSeccion.toLowerCase();
  let textoFinal;
  if (nombreLimpio.includes("característica")) {
    textoFinal = "Características";
  } else if (nombreLimpio.includes("especificaciones")) {
    textoFinal = "Especificaciones técnicas";
  } else {
    textoFinal = nombreSeccion;
  }
  
  th.innerHTML = `<span>${textoFinal}</span>`;

  tr.appendChild(th);
  return tr;
}

function determinarSeccionId(tituloSeccion) {
  const normalizado = normalizar(tituloSeccion);
  if (normalizado.includes("característica")) return "caracteristicas";
  if (normalizado.includes("especificaciones") || normalizado.includes("especificación")) return "especificaciones";
  return tituloSeccion.toLowerCase();
}

export function agregarFilaASeccion(tablaBody, nombre, tituloSeccion, categoria, CONFIG) {
  const filas = [...tablaBody.querySelectorAll("tr")];
  const seccionId = determinarSeccionId(tituloSeccion);
  const filasDeSeccion = filas.filter(r => r.getAttribute("data-seccion") === seccionId);
  
  const nombreNormalizado = normalizar(nombre);
  for (const fila of filasDeSeccion) {
    const tituloDiv = fila.querySelector(".caracteristica-titulo");
    if (tituloDiv && normalizar(tituloDiv.textContent.trim()) === nombreNormalizado) {
      return false;
    }
  }
  
  let seccionTR = null;
  let insertarAntesDe = null;
  
  if (filasDeSeccion.length > 0) {
    // Buscar posición alfabética dentro de la sección
    for (const fila of filasDeSeccion) {
      const tituloDiv = fila.querySelector(".caracteristica-titulo");
      if (tituloDiv) {
        const nombreExistente = tituloDiv.textContent.trim();
        // Si el nombre nuevo es alfabéticamente menor, insertar antes de esta fila
        if (nombre.localeCompare(nombreExistente, 'es', { sensitivity: 'base' }) < 0) {
          insertarAntesDe = fila;
          break;
        }
      }
    }
    
    // Si no encontramos una posición intermedia, insertar al final de la sección
    if (!insertarAntesDe) {
      seccionTR = filasDeSeccion[filasDeSeccion.length - 1];
    }
  } else {
    if (seccionId === "caracteristicas") {
      const primerEncabezado = filas.find(r => r.querySelector("th.section-title-header"));
      if (primerEncabezado) {
        seccionTR = { insertBeforeElement: primerEncabezado };
      } else {
        seccionTR = { appendToEnd: true };
      }
    } else {
      const tituloNormalizado = normalizar(tituloSeccion);
      const encabezadoSeccion = filas.find(r => {
        const th = r.querySelector("th.section-title-header");
        if (!th) return false;
        const span = th.querySelector("span");
        const textoEncabezado = span ? span.textContent : th.textContent;
        return normalizar(textoEncabezado).includes(tituloNormalizado);
      });
      
      if (encabezadoSeccion) {
        seccionTR = encabezadoSeccion;
      } else {
        // Crear nuevo encabezado de sección
        const tr = crearEncabezadoSeccion(tituloSeccion, CONFIG[categoria]);
        tablaBody.appendChild(tr);
        seccionTR = tr;
      }
    }
  }

  const tr = createElement("tr");
  tr.setAttribute("data-seccion", seccionId);
  tr.appendChild(crearCeldaNombre(nombre));

  CONFIG[categoria].forEach(() => tr.appendChild(crearCeldaTexto()));

  // Insertar en la posición correcta
  if (insertarAntesDe) {
    tablaBody.insertBefore(tr, insertarAntesDe);
  } else if (seccionTR && seccionTR.appendToEnd) {
    tablaBody.appendChild(tr);
  } else if (seccionTR && seccionTR.insertBeforeElement) {
    tablaBody.insertBefore(tr, seccionTR.insertBeforeElement);
  } else if (seccionTR && seccionTR.tagName === 'TR') {
    if (seccionTR.nextSibling) {
      tablaBody.insertBefore(tr, seccionTR.nextSibling);
    } else {
      tablaBody.appendChild(tr);
    }
  } else {
    tablaBody.appendChild(tr);
  }
  
  return true;
}
