/* =========================================================
   Elqui Terrenos — funciones de la página
   Sirve para la versión en español (/) y en inglés (/en/).
   ========================================================= */

/* ---- CONFIGURACIÓN: completar cuando esté confirmado ---- */
const CONFIG = {
  // Número de WhatsApp de Guillermo, solo números y con código de país.
  // Ejemplo de formato: "56912345678". Mientras esté vacío, WhatsApp
  // se abre y la persona elige a quién enviar el mensaje.
  whatsapp: "" // [POR CONFIRMAR]
};

const IDIOMA = document.documentElement.lang.toLowerCase().startsWith("en") ? "en" : "es";
const RAIZ = IDIOMA === "en" ? "../" : "";

const TXT = {
  es: {
    tipo: "Carnet del terreno",
    superficie: "Superficie",
    precio: "Precio",
    rio: "Río",
    agua_riego: "Agua de riego",
    rol_propio: "Rol propio",
    riesgos: "Riesgos revisados",
    acceso: "Acceso",
    luz: "Luz",
    consultar: "Consultar por WhatsApp",
    msgTerreno: n => `Hola, me interesa el ${n} que vi en elquiterrenos.cl. ¿Me puedes dar más información?`,
    conteo: (v, t) => v === t ? `${t} ${t === 1 ? "terreno" : "terrenos"} en el valle` : `Mostrando ${v} de ${t} terrenos`,
    vacio: "No hay terrenos con esos filtros por ahora. Escríbenos y te avisamos cuando aparezca uno.",
    error: "No se pudieron cargar los terrenos. Si estás viendo la página desde tu computador, ábrela con el archivo «Ver sitio».",
    ejemplo: "ubicación de ejemplo",
    fotoPendiente: "Foto pendiente",
    fotoPendienteDet: "Vista general del terreno, con su entorno.",
    verFicha: "Ver ficha completa",
    cerrar: "Cerrar",
    sinDato: "[POR CONFIRMAR]",
    abrirMenu: "Abrir menú",
    cerrarMenu: "Cerrar menú",
    errNombre: "Escribe tu nombre.",
    errTelefono: "Escribe un teléfono para llamarte.",
    msgVender: "Hola, quiero vender un terreno en el Valle del Elqui.",
    campos: { nombre: "Nombre", telefono: "Teléfono", sector: "Sector", superficie: "Superficie aproximada", rol: "¿Tiene rol propio?", agua: "¿Tiene agua de riego?", mensaje: "Mensaje" },
    zonas: { vicuna: "Vicuña", paihuano: "Paihuano", "monte-grande": "Monte Grande", "pisco-elqui": "Pisco Elqui", horcon: "Horcón", alcohuaz: "Alcohuaz" }
  },
  en: {
    tipo: "Plot ID card",
    superficie: "Size",
    precio: "Price",
    rio: "River",
    agua_riego: "Irrigation water",
    rol_propio: "Own rol",
    riesgos: "Hazards checked",
    acceso: "Access",
    luz: "Power",
    consultar: "Ask on WhatsApp",
    msgTerreno: n => `Hi, I'm interested in ${n}, which I saw on elquiterrenos.cl. Could you tell me more?`,
    conteo: (v, t) => v === t ? `${t} ${t === 1 ? "plot" : "plots"} in the valley` : `Showing ${v} of ${t} plots`,
    vacio: "No plots match those filters right now. Message us and we'll let you know when one comes up.",
    error: "The plots couldn't be loaded. If you're viewing the page from your computer, open it with the “Ver sitio” file.",
    ejemplo: "sample location",
    fotoPendiente: "Photo pending",
    fotoPendienteDet: "General view of the plot and its surroundings.",
    verFicha: "See full details",
    cerrar: "Close",
    sinDato: "[TO BE CONFIRMED]",
    abrirMenu: "Open menu",
    cerrarMenu: "Close menu",
    errNombre: "Please enter your name.",
    errTelefono: "Please enter a phone number so we can call you.",
    msgVender: "Hi, I'd like to sell a plot in the Valle del Elqui.",
    campos: { nombre: "Name", telefono: "Phone", sector: "Area", superficie: "Approximate size", rol: "Does it have its own rol?", agua: "Does it have irrigation water?", mensaje: "Message" },
    zonas: { vicuna: "Vicuña", paihuano: "Paihuano", "monte-grande": "Monte Grande", "pisco-elqui": "Pisco Elqui", horcon: "Horcón", alcohuaz: "Alcohuaz" }
  }
}[IDIOMA];

const ICONOS = { rio: "i-rio", agua_riego: "i-agua", rol_propio: "i-rol", riesgos: "i-riesgo", acceso: "i-acceso", luz: "i-luz" };
const ORDEN_DATOS = ["rio", "agua_riego", "rol_propio", "riesgos", "acceso", "luz"];

/* ---------- Utilidades ---------- */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function escapar(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// Escapa el texto y marca en amarillo lo que falta confirmar
function texto(s) {
  if (s === null || s === undefined || s === "") s = TXT.sinDato;
  return escapar(s).replace(/\[(POR CONFIRMAR|TO BE CONFIRMED)[^\]]*\]/g, m => `<mark class="pc">${m}</mark>`);
}

const t = obj => (obj && typeof obj === "object" ? obj[IDIOMA] : obj);
const icono = id => `<svg class="ico" aria-hidden="true"><use href="#${id}"/></svg>`;

function enlaceWhatsApp(mensaje) {
  const num = (CONFIG.whatsapp || "").replace(/\D/g, "");
  return `https://wa.me/${num}?text=${encodeURIComponent(mensaje)}`;
}

function superficie(m2) {
  if (!m2) return texto(null);
  return `${Number(m2).toLocaleString(IDIOMA === "en" ? "en-US" : "es-CL")} m²`;
}

function zonaTexto(terreno) {
  const nombre = TXT.zonas[terreno.zona] || "";
  const sector = t(terreno.sector);
  let s = escapar(nombre);
  if (sector && !/^\[(POR CONFIRMAR|TO BE CONFIRMED)\]$/.test(sector)) s += ` · ${escapar(sector)}`;
  if (!terreno.zona_confirmada) s += ` · ${texto("[" + (IDIOMA === "en" ? "TO BE CONFIRMED" : "POR CONFIRMAR") + ": " + TXT.ejemplo + "]")}`;
  return s;
}

function foto(terreno, sizes) {
  if (!terreno.foto) {
    return `<div class="foto-pendiente" role="img" aria-label="${escapar(TXT.fotoPendiente)}">
      ${icono("i-foto")}<strong>${TXT.fotoPendiente}</strong><span>${TXT.fotoPendienteDet}</span></div>`;
  }
  const base = `${RAIZ}img/${terreno.foto}`;
  return `<img src="${base}-800.webp" srcset="${base}-800.webp 800w, ${base}-1600.webp 1600w" sizes="${sizes}"
    width="800" height="600" loading="lazy" decoding="async" alt="${escapar(t(terreno.foto_alt))}">`;
}

/* ---------- WhatsApp en enlaces con data-wa ---------- */
function activarEnlacesWhatsApp() {
  $$("[data-wa]").forEach(a => {
    a.href = enlaceWhatsApp(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });
}

/* ---------- Menú móvil ---------- */
function activarMenu() {
  const boton = $("#menu-boton");
  const menu = $("#menu");
  if (!boton || !menu) return;
  const etiqueta = $(".sr", boton);
  const usar = $("use", boton);

  const fijar = abierto => {
    menu.classList.toggle("abierto", abierto);
    boton.setAttribute("aria-expanded", String(abierto));
    etiqueta.textContent = abierto ? TXT.cerrarMenu : TXT.abrirMenu;
    usar.setAttribute("href", abierto ? "#i-x" : "#i-menu");
  };
  boton.addEventListener("click", () => fijar(!menu.classList.contains("abierto")));
  $$("a", menu).forEach(a => a.addEventListener("click", () => fijar(false)));
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && menu.classList.contains("abierto")) { fijar(false); boton.focus(); }
  });
}

/* ---------- Aparecer al hacer scroll ---------- */
const observadorAparecer = "IntersectionObserver" in window
  ? new IntersectionObserver((entradas, obs) => {
      entradas.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visto"); obs.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" })
  : null;

function observar(el) {
  if (observadorAparecer) observadorAparecer.observe(el);
  else el.classList.add("visto");
}

/* ---------- Terrenos: carnets y filtros ---------- */
let TERRENOS = [];

function carnet(terreno) {
  const nombre = t(terreno.nombre);
  const datos = ORDEN_DATOS.map(clave => {
    const d = terreno[clave] || {};
    return `<li class="dato" data-estado="${escapar(d.estado || "pendiente")}">
      <span class="dato__ico">${icono(ICONOS[clave])}</span>
      <span><span class="dato__nombre">${TXT[clave]}</span><span class="dato__valor">${texto(d[IDIOMA])}</span></span>
    </li>`;
  }).join("");

  return `<article class="carnet aparecer" id="${escapar(terreno.id)}" tabindex="-1" aria-labelledby="${escapar(terreno.id)}-nombre">
    <div class="carnet__foto">${foto(terreno, "(min-width: 1060px) 380px, (min-width: 700px) 50vw, 100vw")}</div>
    <div class="carnet__cuerpo">
      <p class="carnet__tipo">${TXT.tipo}</p>
      <h3 id="${escapar(terreno.id)}-nombre">${escapar(nombre)}</h3>
      <p class="carnet__zona">${icono("i-pin")}<span>${zonaTexto(terreno)}</span></p>
      <dl class="carnet__cifras">
        <div><dt>${TXT.superficie}</dt><dd>${superficie(terreno.superficie_m2)}</dd></div>
        <div><dt>${TXT.precio}</dt><dd>${texto(t(terreno.precio))}</dd></div>
      </dl>
      <ul class="carnet__datos">${datos}</ul>
      <p class="carnet__desc">${texto(t(terreno.descripcion))}</p>
      <a class="boton boton--wa" href="${enlaceWhatsApp(TXT.msgTerreno(nombre))}" target="_blank" rel="noopener">
        ${icono("i-wa")} ${TXT.consultar}
      </a>
    </div>
  </article>`;
}

function filtrar() {
  const zona = $("#filtro-zona")?.value || "";
  const rango = $("#filtro-superficie")?.value || "";
  const [min, max] = rango.split("-").map(v => (v === "" ? null : Number(v)));

  return TERRENOS.filter(x => {
    if (zona && x.zona !== zona) return false;
    if (rango) {
      if (!x.superficie_m2) return false;
      if (min !== null && x.superficie_m2 < min) return false;
      if (max !== null && x.superficie_m2 > max) return false;
    }
    return true;
  });
}

function pintarTerrenos() {
  const lista = $("#lista-terrenos");
  const visibles = filtrar();
  lista.innerHTML = visibles.length ? visibles.map(carnet).join("") : `<p class="vacio">${TXT.vacio}</p>`;
  $$(".aparecer", lista).forEach(observar);
  $("#conteo").textContent = TXT.conteo(visibles.length, TERRENOS.length);
}

/* ---------- Línea del valle ---------- */
function activarLineaDelValle() {
  const panel = $("#valle-panel");
  if (!panel) return;

  TERRENOS.forEach(terreno => {
    const contenedor = $(`.pueblo[data-zona="${terreno.zona}"] .pueblo__marcas`);
    if (!contenedor) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = "marca";
    b.setAttribute("aria-expanded", "false");
    b.setAttribute("aria-controls", "valle-panel");
    b.innerHTML = `${icono("i-pin")}<span>${escapar(t(terreno.nombre))}</span>`;
    b.addEventListener("click", () => {
      const abierto = b.getAttribute("aria-expanded") === "true";
      cerrarPanel();
      if (!abierto) abrirPanel(terreno, b);
    });
    contenedor.appendChild(b);
  });

  function abrirPanel(terreno, boton) {
    const nombre = t(terreno.nombre);
    panel.innerHTML = `
      <div class="panel__foto">${foto(terreno, "(min-width: 900px) 40vw, 100vw")}</div>
      <div class="panel__cuerpo">
        <button class="panel__cerrar" type="button" aria-label="${TXT.cerrar}">${icono("i-x")}</button>
        <p class="carnet__tipo">${TXT.tipo}</p>
        <h3>${escapar(nombre)}</h3>
        <p class="carnet__zona">${icono("i-pin")}<span>${zonaTexto(terreno)}</span></p>
        <p><strong>${TXT.superficie}:</strong> ${superficie(terreno.superficie_m2)} · <strong>${TXT.precio}:</strong> ${texto(t(terreno.precio))}</p>
        <div class="panel__acciones">
          <a class="boton boton--wa" href="${enlaceWhatsApp(TXT.msgTerreno(nombre))}" target="_blank" rel="noopener">${icono("i-wa")} ${TXT.consultar}</a>
          <a class="boton panel__ver" href="#${escapar(terreno.id)}">${TXT.verFicha} ${icono("i-flecha")}</a>
        </div>
      </div>`;
    panel.hidden = false;
    boton.setAttribute("aria-expanded", "true");
    // En celular el panel queda bajo la lista de pueblos: se acerca para que se vea
    if (panel.getBoundingClientRect().top > innerHeight * 0.75) {
      panel.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "nearest" });
    }

    $(".panel__cerrar", panel).addEventListener("click", () => { cerrarPanel(); boton.focus(); });
    $(".panel__ver", panel).addEventListener("click", e => {
      e.preventDefault();
      irAlCarnet(terreno.id);
    });
  }

  function cerrarPanel() {
    panel.hidden = true;
    panel.innerHTML = "";
    $$(".marca[aria-expanded='true']").forEach(m => m.setAttribute("aria-expanded", "false"));
  }
}

function irAlCarnet(id) {
  // Si los filtros lo esconden, se limpian para poder mostrarlo
  if (!$("#" + CSS.escape(id))) {
    $("#filtro-zona").value = "";
    $("#filtro-superficie").value = "";
    pintarTerrenos();
  }
  const ficha = $("#" + CSS.escape(id));
  if (!ficha) return;
  ficha.classList.add("visto", "resaltado");
  ficha.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  ficha.focus({ preventScroll: true });
  setTimeout(() => ficha.classList.remove("resaltado"), 2500);
}

async function cargarTerrenos() {
  const lista = $("#lista-terrenos");
  if (!lista) return;
  try {
    const r = await fetch(`${RAIZ}terrenos.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    const datos = await r.json();
    TERRENOS = Array.isArray(datos.terrenos) ? datos.terrenos : [];
  } catch (e) {
    lista.innerHTML = `<p class="vacio">${TXT.error}</p>`;
    return;
  }
  pintarTerrenos();
  activarLineaDelValle();
  $("#filtros")?.addEventListener("change", pintarTerrenos);
  $("#filtros")?.addEventListener("submit", e => e.preventDefault());
}

/* ---------- Formulario para propietarios ---------- */
function activarFormulario() {
  const form = $("#form-vender");
  if (!form) return;

  const marcarError = (campo, error, malo) => {
    campo.setAttribute("aria-invalid", String(malo));
    if (malo) campo.setAttribute("aria-describedby", error.id); else campo.removeAttribute("aria-describedby");
    error.hidden = !malo;
  };

  form.addEventListener("input", e => {
    if (e.target.getAttribute("aria-invalid") === "true") {
      const error = $("#e-" + e.target.name);
      if (error && e.target.value.trim()) marcarError(e.target, error, false);
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const nombre = form.nombre, telefono = form.telefono;
    const nombreMalo = !nombre.value.trim();
    const telMalo = telefono.value.replace(/\D/g, "").length < 8;
    marcarError(nombre, $("#e-nombre"), nombreMalo);
    marcarError(telefono, $("#e-telefono"), telMalo);
    if (nombreMalo || telMalo) { (nombreMalo ? nombre : telefono).focus(); return; }

    const datos = new FormData(form);
    const lineas = [TXT.msgVender, ""];
    Object.entries(TXT.campos).forEach(([clave, etiqueta]) => {
      const v = (datos.get(clave) || "").toString().trim();
      if (v) lineas.push(`${etiqueta}: ${v}`);
    });
    const url = enlaceWhatsApp(lineas.join("\n"));
    const ventana = window.open(url, "_blank", "noopener");
    if (!ventana) location.href = url;
  });
}

/* ---------- Botón flotante: en escritorio aparece después de la portada ---------- */
function activarFlotante() {
  const boton = $(".wa-flotante");
  const hero = $(".hero");
  if (!boton) return;
  if (!hero || !("IntersectionObserver" in window)) { boton.classList.add("visible"); return; }
  new IntersectionObserver(([e]) => boton.classList.toggle("visible", !e.isIntersecting), { threshold: 0.15 }).observe(hero);
}

/* ---------- Bloques numerados (solo para revisar la maqueta) ----------
   Se encienden abriendo la página con ?bloques al final del enlace
   (ej: .../elqui-terrenos/?bloques) y se apagan con ?bloques=no o con
   el botón "Ocultar números". Los números están escritos en el HTML,
   en los atributos data-bloque y data-bloque-nombre.
   REGLA: un número nunca se cambia ni se reutiliza. Un bloque nuevo
   recibe el siguiente número libre, aunque quede en otro orden.
   Al pasar el sitio a elquiterrenos.cl se puede borrar esta función. */
function modoBloquesEncendido() {
  let encendido = false;
  try { encendido = sessionStorage.getItem("ver-bloques") === "1"; } catch (e) {}
  const p = new URLSearchParams(location.search);
  if (p.has("bloques")) {
    encendido = !/^(0|no|false|off)$/i.test(p.get("bloques"));
    try { sessionStorage.setItem("ver-bloques", encendido ? "1" : "0"); } catch (e) {}
  }
  return encendido;
}

function activarBloques() {
  if (!modoBloquesEncendido()) return;
  document.documentElement.classList.add("ver-bloques");

  // Capa fija donde van las etiquetas: no toca el diseño de la página
  const capa = document.createElement("div");
  capa.className = "bloques-capa";
  capa.setAttribute("aria-hidden", "true");
  document.body.appendChild(capa);

  const etiquetas = new Map();
  const cabecera = $(".cabecera");
  const esPrincipal = el => !el.dataset.bloque.includes(".");

  function ubicar() {
    const altoCabecera = cabecera ? cabecera.getBoundingClientRect().bottom : 0;
    const ancho = document.documentElement.clientWidth;
    const elementos = $$("[data-bloque]");

    etiquetas.forEach((et, el) => { if (!elementos.includes(el)) { et.remove(); etiquetas.delete(el); } });

    elementos.forEach(el => {
      let et = etiquetas.get(el);
      if (!et) {
        et = document.createElement("span");
        const principal = esPrincipal(el);
        et.className = "bloque-etiqueta" + (principal ? " bloque-etiqueta--principal" : "");
        et.textContent = !principal ? el.dataset.bloque
          : el.matches(".wa-flotante") ? `${el.dataset.bloque} · WhatsApp`  // corta, para que quepa en celular
          : `${el.dataset.bloque} · ${el.dataset.bloqueNombre}`;
        capa.appendChild(et);
        etiquetas.set(el, et);
      }
      const r = el.getBoundingClientRect();
      const invisible = r.width === 0 || r.height === 0 || getComputedStyle(el).opacity < 0.1;
      if (invisible || r.bottom < 0 || r.top > innerHeight) { et.hidden = true; return; }

      let x, y;
      if (esPrincipal(el)) {
        // Arriba a la derecha del bloque; mientras se recorre el bloque,
        // la etiqueta acompaña bajo la barra de arriba
        // Todas en una columna a la derecha: primero el 1 (colgando bajo la
        // barra de arriba) y debajo el bloque que se está recorriendo
        const w = et.offsetWidth || 120, h = et.offsetHeight || 28;
        x = Math.min(r.right, ancho) - w - 12;
        if (el === cabecera) {
          y = r.bottom + 4;
        } else if (el.matches(".wa-flotante")) {
          x = r.left - w - 8;                 // a la izquierda del botón
          y = r.top + (r.height - h) / 2;
        } else {
          const debajoDelUno = altoCabecera + 4 + h + 6;
          y = Math.min(Math.max(r.top + 10, debajoDelUno), r.bottom - h - 6);
          if (y < debajoDelUno - 2) { et.hidden = true; return; }  // el bloque ya casi salió
        }
      } else {
        // En la esquina de arriba a la izquierda del elemento
        x = Math.max(4, r.left - 6);
        y = r.top - 11;
        const dentroDeCabecera = cabecera && cabecera.contains(el);
        if (!dentroDeCabecera) {
          if (r.top < altoCabecera) { et.hidden = true; return; }  // ya pasó bajo la barra
          y = Math.max(y, altoCabecera + 2);
        }
      }
      et.hidden = false;
      et.style.transform = `translate(${Math.round(x)}px, ${Math.round(y)}px)`;
    });
  }

  let pendiente = false;
  const pedir = () => { if (!pendiente) { pendiente = true; requestAnimationFrame(() => { pendiente = false; ubicar(); }); } };
  addEventListener("scroll", pedir, { passive: true });
  addEventListener("resize", pedir);
  addEventListener("load", pedir);
  document.addEventListener("transitionend", pedir, true);  // ej: el botón de WhatsApp aparece con fundido
  if ("ResizeObserver" in window) new ResizeObserver(pedir).observe(document.body);
  new MutationObserver(pedir).observe($("main") || document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["hidden", "open", "class"] });
  pedir();

  // Mapa de bloques: botón abajo a la izquierda con la lista completa
  const mapa = document.createElement("div");
  mapa.className = "bloques-mapa";
  const lista = $$("[data-bloque]").map(el => {
    const principal = esPrincipal(el);
    return `<li class="${principal ? "bloques-mapa__principal" : ""}"><button type="button" data-ir="${escapar(el.dataset.bloque)}"><b>${escapar(el.dataset.bloque)}</b> ${escapar(el.dataset.bloqueNombre)}</button></li>`;
  }).join("");
  mapa.innerHTML = `
    <div class="bloques-mapa__panel" id="bloques-panel" hidden>
      <p class="bloques-mapa__titulo">Mapa de bloques</p>
      <ul>${lista}</ul>
      <button type="button" class="bloques-mapa__ocultar">Ocultar números</button>
    </div>
    <button type="button" class="bloques-mapa__boton" aria-expanded="false" aria-controls="bloques-panel">Bloques</button>`;
  document.body.appendChild(mapa);

  const boton = $(".bloques-mapa__boton", mapa);
  const panel = $(".bloques-mapa__panel", mapa);
  const abrir = abierto => { panel.hidden = !abierto; boton.setAttribute("aria-expanded", String(abierto)); };
  boton.addEventListener("click", () => abrir(panel.hidden));
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !panel.hidden) { abrir(false); boton.focus(); } });
  panel.addEventListener("click", e => {
    const ir = e.target.closest("[data-ir]");
    if (ir) {
      const destino = $(`[data-bloque="${CSS.escape(ir.dataset.ir)}"]`);
      if (destino) {
        const d = destino.matches("details") ? destino : destino.closest("details");
        if (d) d.open = true;
        destino.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      if (matchMedia("(max-width: 700px)").matches) abrir(false);
    }
    if (e.target.closest(".bloques-mapa__ocultar")) {
      try { sessionStorage.setItem("ver-bloques", "0"); } catch (err) {}
      location.replace(location.pathname + location.hash);
    }
  });
}

/* ---------- Inicio ---------- */
document.documentElement.classList.add("js");
activarBloques();
activarEnlacesWhatsApp();
activarMenu();
activarFlotante();
activarFormulario();
$$(".aparecer").forEach(observar);
const anio = $("#anio");
if (anio) anio.textContent = new Date().getFullYear();
cargarTerrenos();
