// src/services/seguridadService.js

const API_BASE_URL =
  import.meta.env.VITE_ML_API_URL || "http://localhost:8000";

/**
 * Helper genérico para hacer GET con query params.
 */
async function get(path, params = {}) {
  const url = new URL(path, API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.append(key, value);
    }
  });

  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(
      `Error ${res.status} al llamar ${url.toString()} (${text || "sin cuerpo"})`
    );
    err.status = res.status;
    throw err;
  }
  return res.json();
}

/**
 * Lista de municipios
 * GET /municipios
 */
export function getMunicipios() {
  return get("/municipios");
}

/**
 * Nivel de riesgo por municipio
 * GET /riesgo?categoria=&anio=&mes=
 */
export function getRiesgo(params = {}) {
  return get("/riesgo", params);
}

/**
 * Detalle de delitos por municipio / año / categoría
 * GET /delitos?municipio=&anio=&categoria=
 */
export function getDelitos(params = {}) {
  return get("/delitos", params);
}
