// dom.js
import { limpiarTexto } from "./utils.js";
import { CONFIG } from "./config.js";

export function limpiarTabla(tablaHead, tablaBody) {
  tablaHead.innerHTML = "";
  tablaBody.innerHTML = "";
}

const normalizar = (str) =>
  (str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

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

  const headRow = document.createElement("tr");
  headRow.innerHTML = "<th></th>";
  productos.forEach((p) => {
    const th = document.createElement("th");
    
    // Crear contenedor para nombre y botones
    const container = document.createElement("div");
    container.style.display = "flex";
    container.style.alignItems = "center";
    container.style.justifyContent = "center";
    container.style.gap = "8px";
    
    const span = document.createElement("span");
    span.textContent = p;
    span.style.cursor = "pointer";
    span.className = "product-name";
    span.title = "Click para editar";
    
    const btnEdit = document.createElement("button");
    btnEdit.className = "edit-product";
    btnEdit.textContent = "✏️";
    btnEdit.title = "Editar nombre";
    btnEdit.style.fontSize = "0.9em";
    
    const btnDel = document.createElement("button");
    btnDel.className = "delete-product";
    btnDel.textContent = "🗑️";
    btnDel.title = "Eliminar producto";
    btnDel.style.fontSize = "0.9em";
    
    container.appendChild(span);
    container.appendChild(btnEdit);
    container.appendChild(btnDel);
    th.appendChild(container);
    headRow.appendChild(th);
  });
  tablaHead.appendChild(headRow);

  // Usar el orden guardado si existe, sino usar Object.entries
  const seccionesOrdenadas = ordenSecciones && ordenSecciones.length > 0
    ? ordenSecciones.map(nombre => [nombre, secciones[nombre]])
    : Object.entries(secciones);

  seccionesOrdenadas.forEach(([nombreSeccion, listaCaracteristicas]) => {
    if (!listaCaracteristicas) return; // Skip si la sección no existe
    
    const trSeccion = crearEncabezadoSeccion(nombreSeccion, productos);
    tablaBody.appendChild(trSeccion);

    const caracteristicas =
      Array.isArray(listaCaracteristicas) && listaCaracteristicas.length
        ? listaCaracteristicas
        : Object.keys(listaCaracteristicas || {});

    // Ordenar alfabéticamente las características/especificaciones
    const caracteristicasOrdenadas = [...caracteristicas].sort((a, b) => {
      return a.localeCompare(b, 'es', { sensitivity: 'base' });
    });

    caracteristicasOrdenadas.forEach((nombreCaracteristica) => {
      const nombreLimpio = limpiarTexto(nombreCaracteristica);
      const tr = document.createElement("tr");

      const tdNombre = document.createElement("td");
      tdNombre.textContent = nombreLimpio + " ";

      const btnEdit = document.createElement("button");
      btnEdit.className = "edit-name";
      btnEdit.textContent = "✏️";
      tdNombre.appendChild(btnEdit);

      const btnDel = document.createElement("button");
      btnDel.className = "delete-row";
      btnDel.textContent = "🗑️";
      tdNombre.appendChild(document.createTextNode(" "));
      tdNombre.appendChild(btnDel);
      tr.appendChild(tdNombre);

      const clave = datos ? resolverClave(datos, nombreSeccion, nombreLimpio) : null;

      productos.forEach((producto) => {
        const td = document.createElement("td");
        const cont = document.createElement("div");
        cont.className = "field-container";
        const textarea = document.createElement("textarea");
        textarea.rows = 2;
        textarea.value = clave ? datos[clave]?.[producto] ?? "" : "";

        const resetBtn = document.createElement("button");
        resetBtn.className = "reset-field";
        resetBtn.textContent = "🗑️";
        cont.append(textarea, resetBtn);
        td.appendChild(cont);
        tr.appendChild(td);
      });

      tablaBody.appendChild(tr);
    });
  });
}

function crearEncabezadoSeccion(nombreSeccion, productos) {
  const tr = document.createElement("tr");
  const th = document.createElement("th");
  th.colSpan = productos.length + 1;
  th.classList.add("section-title");

  const nombreLimpio = nombreSeccion.toLowerCase();

  if (nombreLimpio.includes("característica")) {
    const cont = document.createElement("div");
    cont.classList.add("encabezado-caracteristicas");
    const titulo = document.createElement("span");
    titulo.textContent = "Características";
    const boton = document.createElement("button");
    boton.textContent = "+ Agregar";
    boton.classList.add("btn-agregar-caracteristica");
    boton.addEventListener("click", () => {
      const nombre = prompt("Nombre de la nueva característica:");
      if (!nombre || !nombre.trim()) return;
      const event = new CustomEvent("agregarCaracteristica", {
        detail: nombre.trim(),
      });
      document.dispatchEvent(event);
    });
    cont.appendChild(titulo);
    cont.appendChild(boton);
    th.appendChild(cont);
  } else if (nombreLimpio.includes("especificaciones")) {
    const cont = document.createElement("div");
    cont.classList.add("encabezado-caracteristicas");
    const titulo = document.createElement("span");
    titulo.textContent = "Especificaciones técnicas";
    const boton = document.createElement("button");
    boton.textContent = "+ Agregar";
    boton.classList.add("btn-agregar-caracteristica");
    boton.addEventListener("click", () => {
      const nombre = prompt("Nombre de la nueva especificación:");
      if (!nombre || !nombre.trim()) return;
      const event = new CustomEvent("agregarEspecificacion", {
        detail: nombre.trim(),
      });
      document.dispatchEvent(event);
    });
    cont.appendChild(titulo);
    cont.appendChild(boton);
    th.appendChild(cont);
  } else {
    th.textContent = nombreSeccion;
  }

  tr.appendChild(th);
  return tr;
}

export function agregarFilaASeccion(tablaBody, nombre, tituloSeccion, categoria, CONFIG) {
  const normalizar = (str) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

  const filas = [...tablaBody.querySelectorAll("tr")];
  let seccionTR = filas.find((r) => {
    const th = r.querySelector("th.section-title");
    return th && normalizar(th.textContent).includes(normalizar(tituloSeccion));
  });

  if (!seccionTR) {
    const th = document.createElement("th");
    th.colSpan = CONFIG[categoria].length + 1;
    th.classList.add("section-title");
    th.textContent = tituloSeccion;
    const tr = document.createElement("tr");
    tr.appendChild(th);
    tablaBody.appendChild(tr);
    seccionTR = tr;
  }

  // Verificar si ya existe una característica/especificación con el mismo nombre en esta sección
  const nombreNormalizado = normalizar(nombre);
  let filaActual = seccionTR.nextElementSibling;
  while (filaActual && !filaActual.querySelector("th.section-title")) {
    const td = filaActual.querySelector("td");
    if (td) {
      const nombreExistente = td.textContent.replace(/✏️|🗑️/g, "").trim();
      if (normalizar(nombreExistente) === nombreNormalizado) {
        // Ya existe, retornar false para indicar duplicado
        return false;
      }
    }
    filaActual = filaActual.nextElementSibling;
  }

  const tr = document.createElement("tr");
  const tdNombre = document.createElement("td");
  tdNombre.textContent = nombre + " ";

  const btnEdit = document.createElement("button");
  btnEdit.className = "edit-name";
  btnEdit.textContent = "✏️";
  tdNombre.appendChild(btnEdit);

  const btnDel = document.createElement("button");
  btnDel.className = "delete-row";
  btnDel.textContent = "🗑️";
  tdNombre.appendChild(document.createTextNode(" "));
  tdNombre.appendChild(btnDel);
  tr.appendChild(tdNombre);

  CONFIG[categoria].forEach(() => {
    const td = document.createElement("td");
    const cont = document.createElement("div");
    cont.className = "field-container";
    const textarea = document.createElement("textarea");
    textarea.rows = 2;
    const resetBtn = document.createElement("button");
    resetBtn.className = "reset-field";
    resetBtn.textContent = "🗑️";
    cont.append(textarea, resetBtn);
    td.appendChild(cont);
    tr.appendChild(td);
  });

  let siguiente = seccionTR.nextElementSibling;
  while (siguiente && !siguiente.querySelector("th.section-title")) {
    seccionTR = siguiente;
    siguiente = siguiente.nextElementSibling;
  }

  tablaBody.insertBefore(tr, seccionTR.nextSibling);
  return true; // Retornar true para indicar que se agregó correctamente
}
