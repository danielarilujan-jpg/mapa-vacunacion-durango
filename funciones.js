
/* ==========================================
   1. MAPA DE DURANGO SIN FONDO GEOGRÁFICO
========================================== */

const mapa = L.map("mapa", {
    zoomControl: true,
    attributionControl: false
}).setView([24.0, -104.6], 6);

let capaMunicipios = null;
let municipios = [];
let municipioActivo = null;

const estiloNormal = {
    color: "#A94E76",
    weight: 1.5,
    fillColor: "#E9B4C9",
    fillOpacity: 0.75
};

const estiloSeleccionado = {
    color: "#843653",
    weight: 3,
    fillColor: "#C76C91",
    fillOpacity: 0.95
};


// Elementos del panel municipal
const panelNombre = document.getElementById("nombreMunicipio");
const panelDescripcion = document.getElementById("descripcionMunicipio");
const panelClave = document.getElementById("claveMunicipio");
const panelPoblacion = document.getElementById("poblacionMunicipio");

const panelVacunacion =
    document.getElementById("vacunacionMunicipal");


// Obtener nombres de municipios
function nombreDeMunicipio(feature) {

    const p = feature.properties || {};

    return p.nomgeo ||
        p.NOMGEO ||
        p.nom_mun ||
        p.NOM_MUN ||
        "Municipio";
}


// Obtener clave municipal
function claveDeMunicipio(feature) {

    const p = feature.properties || {};

    return p.cvegeo ||
        p.CVEGEO ||
        p.cve_mun ||
        p.CVE_MUN ||
        "No disponible";
}


/* ==========================================
   2. DATOS DE VACUNACIÓN POR GRUPO DE EDAD
========================================== */

// IMPORTANTE:
// Los porcentajes no representan necesariamente
// coberturas específicas de cada municipio.
// El alcance de cada fuente se explica en el panel.

const datosPorEdad = {

    "0-11": {

        titulo: "Primer año de vida",

        fuente: "ENSANUT 2022. México. Esquema completo al primer año de vida.",

        datos: [
            {
                vacuna: "Esquema completo al primer año",
                porcentaje: 42.6
            }
        ]

    },

    "12-35": {

        titulo: "Niñas y niños de 12 a 35 meses",

        fuente: "Estimaciones incorporadas previamente al proyecto para Durango. Verificar con la publicación original.",

        datos: [
            {
                vacuna: "Pentavalente / Hexavalente",
                porcentaje: 81.4
            },
            {
                vacuna: "Neumocócica",
                porcentaje: 56.3
            },
            {
                vacuna: "Rotavirus",
                porcentaje: 88.3
            },
            {
                vacuna: "Triple viral",
                porcentaje: 80.5
            },
            {
                vacuna: "Esquema completo",
                porcentaje: 27.6
            }
        ]

    },

    "3-5": {

        titulo: "Menores de 5 años",

        fuente: "ENSANUT Continua 2021–2023. México. Grupo de referencia: menores de 5 años.",

        datos: [
            {
                vacuna: "BCG",
                porcentaje: 86.5
            },
            {
                vacuna: "Hepatitis B",
                porcentaje: 63.7
            },
            {
                vacuna: "Polio / DPT",
                porcentaje: 68.9
            },
            {
                vacuna: "Neumocócica",
                porcentaje: 86.6
            },
            {
                vacuna: "Rotavirus",
                porcentaje: 81.3
            },
            {
                vacuna: "Triple viral",
                porcentaje: 71.3
            }
        ]

    },

    "6-11": {

        titulo: "Niñas y niños de 5 a 6 años",

        fuente: "ENSANUT 2022. México. Grupo de referencia: 5 a 6 años y 11 meses.",

        datos: [
            {
                vacuna: "DPT",
                porcentaje: 78.8
            },
            {
                vacuna: "Triple viral primera dosis",
                porcentaje: 88.5
            },
            {
                vacuna: "Triple viral segunda dosis",
                porcentaje: 31.2
            }
        ]

    },

    "12-17": {

        titulo: "Adolescentes",

        fuente: "ENSANUT 2022. México. Grupo de referencia: 10 a 19 años. Datos de antecedente de vacunación autorreportado.",

        datos: [
            {
                vacuna: "VPH",
                porcentaje: 43.7
            },
            {
                vacuna: "Hepatitis B",
                porcentaje: 31.8
            },
            {
                vacuna: "Tétanos",
                porcentaje: 38.5
            },
            {
                vacuna: "Doble viral",
                porcentaje: 32.6
            }
        ]

    },

    "18-59": {

        titulo: "Personas adultas",

        fuente: "ENSANUT Continua 2021–2023. México. Grupo de referencia: 20 a 59 años. Dato autorreportado.",

        datos: [
            {
                vacuna: "Tétanos y difteria",
                porcentaje: 66.87
            }
        ]

    },

    "60+": {

        titulo: "Personas adultas mayores",

        fuente: "ENSANUT Continua 2021–2023. México. Personas de 60 años o más. Datos autorreportados.",

        datos: [
            {
                vacuna: "Tétanos y difteria",
                porcentaje: 59.5
            },
            {
                vacuna: "Influenza",
                porcentaje: 58.7
            },
            {
                vacuna: "Neumococo",
                porcentaje: 34.8
            }
        ]

    }

};


/* ==========================================
   3. MOSTRAR VACUNACIÓN EN EL PANEL MUNICIPAL
========================================== */

function actualizarPanelVacunacion() {

    if (!panelVacunacion) return;

    const edad = document.getElementById("filtroEdad").value;
    const grupo = datosPorEdad[edad];

    if (!grupo) {

        panelVacunacion.innerHTML =
            "<p>No hay información disponible para este grupo.</p>";

        return;

    }

    let alcance = "";

    if (edad === "12-35") {

        alcance =
            "Estimaciones estatales de Durango para este grupo de edad. " +
            "No representan cifras específicas del municipio seleccionado. " +
            "La publicación original debe verificarse.";

    } else {

        alcance =
            "Datos de referencia nacional de México. " +
            "No representan cifras específicas de Durango ni del municipio seleccionado.";

    }

    let contenido = `

        <div class="resumen-vacunacion">

            <strong>${grupo.titulo}</strong>

            <p>${alcance}</p>

        </div>

        <div class="lista-indicadores-vacunacion">

    `;

    grupo.datos.forEach(dato => {

        contenido += `

            <div class="indicador-vacuna">

                <div class="indicador-vacuna-texto">

                    <span>${dato.vacuna}</span>

                    <strong>${dato.porcentaje}%</strong>

                </div>

                <div class="barra-vacuna">

                    <div
                        class="progreso-vacuna"
                        style="width: ${dato.porcentaje}%">
                    </div>

                </div>

            </div>

        `;

    });

    contenido += `

        </div>

        <p class="fuente-vacunacion">

            <strong>Fuente:</strong> ${grupo.fuente}

        </p>

    `;

    panelVacunacion.innerHTML = contenido;

}


/* ==========================================
   4. SELECCIONAR MUNICIPIO
========================================== */

function seleccionarMunicipio(feature, layer) {

    if (municipioActivo && capaMunicipios) {
        capaMunicipios.resetStyle(municipioActivo);
    }

    municipioActivo = layer;

    layer.setStyle(estiloSeleccionado);
    layer.bringToFront();

    const nombre = nombreDeMunicipio(feature);
    const clave = claveDeMunicipio(feature);
    const propiedades = feature.properties || {};

    panelNombre.textContent = nombre;

    panelDescripcion.textContent =
        "Municipio perteneciente al estado de Durango.";

    panelClave.textContent = clave;

    const poblacion =
        propiedades.pob_total ||
        propiedades.POB_TOTAL;

    panelPoblacion.textContent = poblacion
        ? Number(poblacion).toLocaleString("es-MX") + " habitantes"
        : "No disponible en esta consulta";

    document.getElementById("listaMunicipios").value = clave;

    // Mostrar los indicadores de vacunación
    actualizarPanelVacunacion();

    layer.bindPopup(
        "<strong>" + nombre + "</strong><br>Municipio seleccionado"
    ).openPopup();

}


/* ==========================================
   5. CARGAR MUNICIPIOS DESDE INEGI
========================================== */

function cargarMunicipios() {

    const url =
        "https://gaia.inegi.org.mx/wscatgeo/v2/geo/mgem/10";

    fetch(url)

        .then(respuesta => {

            if (!respuesta.ok) {
                throw new Error("No se pudo consultar INEGI");
            }

            return respuesta.json();

        })

        .then(datos => {

            const elementos = Array.isArray(datos.features)
                ? datos.features
                : [];

            if (elementos.length === 0) {
                throw new Error("No se encontraron municipios");
            }

            municipios = elementos;

            capaMunicipios = L.geoJSON(datos, {

                style: estiloNormal,

                onEachFeature: function(feature, layer) {

                    const nombre = nombreDeMunicipio(feature);

                    layer.bindTooltip(nombre);

                    layer.on("click", function() {
                        seleccionarMunicipio(feature, layer);
                    });

                    layer.on("mouseover", function() {

                        if (municipioActivo !== layer) {

                            layer.setStyle({
                                fillColor: "#D98AAA",
                                fillOpacity: 0.95,
                                weight: 2
                            });

                        }

                    });

                    layer.on("mouseout", function() {

                        if (municipioActivo !== layer) {
                            capaMunicipios.resetStyle(layer);
                        }

                    });

                }

            }).addTo(mapa);

            mapa.fitBounds(capaMunicipios.getBounds(), {
                padding: [20, 20]
            });

            // Crear lista de municipios
            const selector =
                document.getElementById("listaMunicipios");

            selector.innerHTML =
                '<option value="">Selecciona un municipio</option>';

            municipios
                .sort((a, b) =>
                    nombreDeMunicipio(a).localeCompare(
                        nombreDeMunicipio(b), "es"
                    )
                )
                .forEach(feature => {

                    const option = document.createElement("option");

                    option.value = claveDeMunicipio(feature);
                    option.textContent = nombreDeMunicipio(feature);

                    selector.appendChild(option);

                });

            document.getElementById("estadoMapa").textContent =
                "Mapa cargado correctamente. Municipios encontrados: " +
                municipios.length + ".";

        })

        .catch(error => {

            console.error("Error del mapa:", error);

            document.getElementById("estadoMapa").textContent =
                "No fue posible cargar los municipios. Revisa tu conexión.";

        });

}

cargarMunicipios();


/* ==========================================
   6. BUSCADOR DE MUNICIPIOS
========================================== */

const buscador =
    document.getElementById("buscarMunicipio");

const selectorMunicipios =
    document.getElementById("listaMunicipios");


function enfocarMunicipio(feature) {

    if (!capaMunicipios) return;

    const clave = claveDeMunicipio(feature);

    capaMunicipios.eachLayer(layer => {

        if (claveDeMunicipio(layer.feature) === clave) {

            seleccionarMunicipio(layer.feature, layer);

            mapa.fitBounds(layer.getBounds(), {
                padding: [25, 25],
                maxZoom: 9
            });

        }

    });

}


// Buscar por nombre
buscador.addEventListener("change", function() {

    const texto = this.value.toLowerCase().trim();

    const resultado = municipios.find(feature =>
        nombreDeMunicipio(feature).toLowerCase() === texto
    );

    if (resultado) {

        enfocarMunicipio(resultado);

    } else if (texto !== "") {

        panelDescripcion.textContent =
            "No se encontró ese municipio. Comprueba el nombre.";

    }

});


// Seleccionar desde la lista
selectorMunicipios.addEventListener("change", function() {

    const clave = this.value;

    if (!clave) return;

    const resultado = municipios.find(feature =>
        claveDeMunicipio(feature) === clave
    );

    if (resultado) {
        enfocarMunicipio(resultado);
    }

});


// Restablecer mapa
document.getElementById("restablecerMapa")
    .addEventListener("click", function() {

        if (capaMunicipios) {

            mapa.fitBounds(capaMunicipios.getBounds());

            if (municipioActivo) {
                capaMunicipios.resetStyle(municipioActivo);
                municipioActivo = null;
            }

        }

        buscador.value = "";
        selectorMunicipios.value = "";

        panelNombre.textContent = "Durango";

        panelDescripcion.textContent =
            "Selecciona un municipio para consultar su información.";

        panelClave.textContent = "—";

        panelPoblacion.textContent = "No disponible";

        panelVacunacion.innerHTML =
            "<p>Selecciona un municipio para consultar los indicadores.</p>";

    });


/* ==========================================
   7. CONFIGURACIÓN DE LAS GRÁFICAS
========================================== */

let grafica = null;


// Normalizar texto para comparar filtros
function normalizarTexto(texto) {

    return String(texto)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

}


// Comprobar coincidencia entre vacuna y filtro
function coincideVacuna(nombre, filtro) {

    const n = normalizarTexto(nombre);
    const f = normalizarTexto(filtro);

    if (!f || f === "todas" || f === "todos") {
        return true;
    }

    if (f.includes("neumococ") && n.includes("neumococ")) {
        return true;
    }

    if (
        (f.includes("triple viral") || f === "srp") &&
        (n.includes("triple viral") || n.includes("srp"))
    ) {
        return true;
    }

    if (
        (f.includes("pentavalente") || f.includes("hexavalente")) &&
        (n.includes("pentavalente") || n.includes("hexavalente"))
    ) {
        return true;
    }

    if (f === "rotavirus" && n.includes("rotavirus")) {
        return true;
    }

    if (f === "bcg" && n.includes("bcg")) {
        return true;
    }

    if (f.includes("hepatitis") && n.includes("hepatitis")) {
        return true;
    }

    if (f.includes("esquema completo") && n.includes("esquema completo")) {
        return true;
    }

    if (f === "dpt" && n.includes("dpt")) {
        return true;
    }

    if (f.includes("vph") && n.includes("vph")) {
        return true;
    }

    if (f.includes("tetanos") && n.includes("tetanos")) {
        return true;
    }

    if (f.includes("influenza") && n.includes("influenza")) {
        return true;
    }

    if (f.includes("doble viral") && n.includes("doble viral")) {
        return true;
    }

    return n.includes(f) || f.includes(n);

}


// Crear gráfica
function crearGrafica() {

    const elemento =
        document.getElementById("graficaVacunacion");

    if (!elemento) {
        console.error("No se encontró el elemento graficaVacunacion");
        return;
    }

    const contexto = elemento.getContext("2d");

    grafica = new Chart(contexto, {

        type: "bar",

        data: {

            labels: [],

            datasets: [{

                label: "Porcentaje reportado (%)",

                data: [],

                backgroundColor: [
                    "#D98AAA",
                    "#C76C91",
                    "#E8B7CB",
                    "#B95F83",
                    "#843653",
                    "#E7A1BC"
                ],

                borderRadius: 8,

                borderSkipped: false

            }]

        },

        options: {

            responsive: true,

            maintainAspectRatio: false,

            animation: {
                duration: 700
            },

            scales: {

                y: {

                    beginAtZero: true,

                    max: 100,

                    ticks: {

                        callback: valor => valor + "%"

                    },

                    title: {

                        display: true,

                        text: "Porcentaje reportado"

                    }

                },

                x: {

                    ticks: {

                        autoSkip: false

                    }

                }

            },

            plugins: {

                legend: {
                    display: false
                },

                tooltip: {

                    callbacks: {

                        label: contexto =>
                            "Porcentaje reportado: " +
                            contexto.raw + "%"

                    }

                }

            }

        }

    });

    actualizarGrafica();

}


// Actualizar gráfica según los filtros
function actualizarGrafica() {

    if (!grafica) return;

    const edad =
        document.getElementById("filtroEdad").value;

    const vacuna =
        document.getElementById("filtroVacuna").value;

    const mensaje =
        document.getElementById("mensajeGrafica");

    const grupo = datosPorEdad[edad];

    if (!grupo) {

        grafica.data.labels = [];
        grafica.data.datasets[0].data = [];

        grafica.update();

        mensaje.textContent =
            "No hay información disponible para este grupo.";

        return;

    }

    const filtrados = grupo.datos.filter(dato =>
        coincideVacuna(dato.vacuna, vacuna)
    );

    grafica.data.labels =
        filtrados.map(dato => dato.vacuna);

    grafica.data.datasets[0].data =
        filtrados.map(dato => dato.porcentaje);

    grafica.update();

    if (filtrados.length > 0) {

        mensaje.textContent =
            grupo.titulo + ". Fuente: " + grupo.fuente +
            " Los rangos de edad de la fuente pueden diferir del filtro seleccionado.";

    } else {

        mensaje.textContent =
            "No hay datos de esa vacuna para este grupo de edad. " +
            "Selecciona 'Todas' para ver los indicadores disponibles.";

    }

}


// Activar filtros
document.getElementById("filtroEdad")
    .addEventListener("change", function() {

        actualizarGrafica();

        // Actualizar también el panel del municipio
        if (municipioActivo) {
            actualizarPanelVacunacion();
        }

    });

document.getElementById("filtroVacuna")
    .addEventListener("change", actualizarGrafica);


// Iniciar gráfica
crearGrafica();


/* ==========================================
   8. LOS OCHO APARTADOS TEMÁTICOS
========================================== */

const informacionTemas = {

    importancia: {

        titulo: "Importancia de la vacunación",

        texto:
            "La vacunación es una medida fundamental de salud pública. " +
            "Ayuda a prevenir enfermedades infecciosas, disminuye el riesgo " +
            "de complicaciones y contribuye a proteger a la comunidad."

    },

    riesgos: {

        titulo: "Riesgos",

        texto:
            "La falta de vacunación puede favorecer la aparición de brotes " +
            "de enfermedades prevenibles. Las vacunas pueden producir " +
            "reacciones adversas, generalmente leves y de corta duración; " +
            "las reacciones graves son poco frecuentes."

    },

    recursos: {

        titulo: "Recursos necesarios",

        texto:
            "Se necesitan vacunas, personal de salud capacitado, centros " +
            "de vacunación, jeringas, material informativo, transporte " +
            "y una cadena de frío adecuada."

    },

    areas: {

        titulo: "Áreas perjudicadas",

        texto:
            "Una cobertura insuficiente puede incrementar la demanda de " +
            "servicios médicos y afectar a las familias, la economía, " +
            "la educación, la productividad y el bienestar social."

    },

    poblacion: {

        titulo: "Población vulnerable",

        texto:
            "Los bebés, niñas y niños, adultos mayores, embarazadas y " +
            "personas con determinadas condiciones de salud pueden requerir " +
            "atención prioritaria según las recomendaciones sanitarias."

    },

    beneficios: {

        titulo: "Beneficios",

        texto:
            "Las vacunas ayudan a desarrollar defensas, reducen el riesgo " +
            "de enfermedades y complicaciones y contribuyen a la protección " +
            "colectiva cuando se alcanzan coberturas adecuadas."

    },

    consecuencias: {

        titulo: "Consecuencias de una baja cobertura",

        texto:
            "Cuando disminuye la vacunación, pueden aumentar las personas " +
            "susceptibles, facilitarse la transmisión de enfermedades y " +
            "generarse mayor presión sobre los servicios de salud."

    },

    soluciones: {

        titulo: "Soluciones y acciones",

        texto:
            "Es importante fortalecer las campañas de vacunación, facilitar " +
            "el acceso a los servicios, promover la educación sanitaria, " +
            "revisar las cartillas y dar seguimiento a los esquemas."

    }

};


// Mostrar apartado
function mostrarTema(tema) {

    const informacion = informacionTemas[tema];

    if (!informacion) return;

    document.getElementById("contenidoTema").innerHTML = `

        <h3>${informacion.titulo}</h3>

        <p>${informacion.texto}</p>

    `;

    document.getElementById("contenidoTema")
        .scrollIntoView({

            behavior: "smooth",

            block: "nearest"

        });

}

