import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
//import HeatmapWithFilters from "@/components/ui/HeatmapWithFilters";

import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { useAuth } from "@/context/AuthContext";
import {
  getMunicipios,
  getRiesgo,
  getDelitos,
} from "@/services/seguridadService";

// URL para heatmap 
const HEATMAP_API_URL =
  import.meta.env.VITE_ML_HEATMAP_URL ||
  `${import.meta.env.VITE_ML_API_URL || "http://localhost:8000"}/heatmap`;

const CATEGORIAS = [
  { value: "HURTO", label: "Hurtos" },
  { value: "VIOLENCIA_INTRAFAMILIAR", label: "Violencia intrafamiliar" },
  { value: "DELITOS_SEXUALES", label: "Delitos sexuales" },
];

const GRUPOS_POBLACION = [
  { id: "NINOS", label: "Niñas/os 0–12" },
  { id: "ADOLESCENTES", label: "Adolescentes 13–17" },
  { id: "ADULTOS", label: "Adultos 18–59" },
  { id: "MAYORES", label: "Adulto mayor 60+" },
];

// Ajusta a los textos 
const MAPA_GRUPOS_ETARIOS = {
  NINOS: ["0 a 12"],
  ADOLESCENTES: ["13 a 17"],
  ADULTOS: ["18 a 59"],
  MAYORES: ["60 y más", "60 y mas", "60+"],
};

function getConteo(row) {
  return (
    row.total_delitos ??
    row.total ??
    row.cantidad ??
    row.count ??
    0
  );
}

export default function Mapa() {
  const { session } = useAuth();
  const userName = session?.user?.nombre || session?.user?.name || "Usuario";

  const mapRef = useRef(null);
  const heatmapRef = useRef(null);
  const [map, setMap] = useState(null);

  const [categoria, setCategoria] = useState("HURTO");
  const [anio, setAnio] = useState(String(new Date().getFullYear()));
  const [mes, setMes] = useState("");

  const [riesgo, setRiesgo] = useState([]);
  const [municipioSeleccionado, setMunicipioSeleccionado] = useState("");
  const [delitosMunicipio, setDelitosMunicipio] = useState([]);

  const [grupoSeleccionado, setGrupoSeleccionado] = useState("ADULTOS");

  const [loadingRiesgo, setLoadingRiesgo] = useState(false);
  const [loadingHeatmap, setLoadingHeatmap] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [error, setError] = useState("");

  // ========= GOOGLE MAPS =========
  const loadGoogleAPI = async () => {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      v: "weekly",
    });

    const { Map } = await importLibrary("maps");
    const { HeatmapLayer } = await importLibrary("visualization");
    return { Map, HeatmapLayer };
  };

  const initializeMap = (MapClass) => {
    if (!mapRef.current) return;

    const mapa = new MapClass(mapRef.current, {
      center: { lat: 7.125, lng: -73.1189 }, // centro Santander
      zoom: 8,
      streetViewControl: false,
      mapTypeControl: false,
    });

    setMap(mapa);
  };

  const updateHeatmap = async (points) => {
    if (!map) return;
    const { HeatmapLayer } = await importLibrary("visualization");

    const heatmapData = points.map(
      (p) => new google.maps.LatLng(p.lat, p.lng)
    );

    if (!heatmapRef.current) {
      heatmapRef.current = new HeatmapLayer({
        data: heatmapData,
        radius: 40,
      });
      heatmapRef.current.setMap(map);
    } else {
      heatmapRef.current.setData(heatmapData);
    }
  };

  const fetchHeatmapData = async () => {
    if (!map) return;
    setLoadingHeatmap(true);
    try {
      let url = HEATMAP_API_URL;
      const params = [];
      if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
      if (anio) params.push(`anio=${encodeURIComponent(anio)}`);
      if (mes) params.push(`mes=${encodeURIComponent(mes)}`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await fetch(url);
      const data = await response.json();

      const points = (data || []).map((p) => ({
        lat: p.lat ?? p.latitud,
        lng: p.lng ?? p.longitud,
      }));

      await updateHeatmap(points);
    } catch (err) {
      console.error("Error cargando datos del heatmap:", err);
    } finally {
      setLoadingHeatmap(false);
    }
  };

  // Inicializar mapa
  useEffect(() => {
    (async () => {
      try {
        const { Map } = await loadGoogleAPI();
        initializeMap(Map);
      } catch (err) {
        console.error("Error cargando Google Maps:", err);
        setError("No se pudo cargar el mapa de Google.");
      }
    })();
  }, []);

  // Actualizar heatmap cuando cambian filtros
  useEffect(() => {
    if (map) {
      fetchHeatmapData();
    }
  }, [map, categoria, anio, mes]);

  // ========= API RIESGO Y MUNICIPIOS =========
  useEffect(() => {
    (async () => {
      setLoadingRiesgo(true);
      setError("");
      try {
        const data = await getRiesgo({
          categoria,
          anio,
          mes: mes || undefined,
          limit: 500,
        });
        const lista = Array.isArray(data.resultados) ? data.resultados : data;
        setRiesgo(lista || []);
      } catch (err) {
        console.error(err);
        setError("Error al cargar los datos de riesgo.");
      } finally {
        setLoadingRiesgo(false);
      }
    })();
  }, [categoria, anio, mes]);

  const topMunicipios = useMemo(() => {
    const byMun = new Map();
    for (const r of riesgo || []) {
      const key = r.municipio;
      const actual = byMun.get(key);
      if (!actual || (r.riesgo_score || 0) > (actual.riesgo_score || 0)) {
        byMun.set(key, r);
      }
    }
    return Array.from(byMun.values())
      .sort((a, b) => (b.riesgo_score || 0) - (a.riesgo_score || 0))
      .slice(0, 5);
  }, [riesgo]);

  // ========= API DELITOS POR GRUPO =========
  useEffect(() => {
    if (!municipioSeleccionado) {
      setDelitosMunicipio([]);
      return;
    }

    (async () => {
      setLoadingGrupos(true);
      try {
        const data = await getDelitos({
          municipio: municipioSeleccionado,
          anio,
          categoria: categoria || undefined,
          limit: 1000,
        });
        const lista = Array.isArray(data.resultados) ? data.resultados : data;
        setDelitosMunicipio(lista || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingGrupos(false);
      }
    })();
  }, [municipioSeleccionado, categoria, anio]);

  const resumenGrupos = useMemo(() => {
    if (!delitosMunicipio.length) return {};
    const resultado = {};

    for (const grupo of GRUPOS_POBLACION) {
      const etiquetas = MAPA_GRUPOS_ETARIOS[grupo.id] || [];
      const filasGrupo = delitosMunicipio.filter((d) =>
        etiquetas.includes((d.grupo_etario || "").trim())
      );

      const acumulado = new Map();
      for (const f of filasGrupo) {
        const cat = f.categoria || "OTRO";
        const actual = acumulado.get(cat) || 0;
        acumulado.set(cat, actual + getConteo(f));
      }

      if (acumulado.size === 0) {
        resultado[grupo.id] = null;
      } else {
        let mejorCat = null;
        let mejorValor = -Infinity;
        for (const [cat, total] of acumulado.entries()) {
          if (total > mejorValor) {
            mejorValor = total;
            mejorCat = { categoria: cat, total };
          }
        }
        resultado[grupo.id] = mejorCat;
      }
    }
    return resultado;
  }, [delitosMunicipio]);

  const delitoGrupoSeleccionado = resumenGrupos[grupoSeleccionado];

  // ========= UI =========
  return (
    <div className="mx-auto max-w-[1600px] px-6 py-6 flex flex-col xl:flex-row gap-6">
      {/* COLUMNA IZQUIERDA: MAPA */}
      <div className="flex-1 rounded-[32px] bg-[#151827] overflow-hidden shadow-xl border border-white/5">
        <div className="px-6 pt-4 pb-2 flex items-center justify-between">
          <div>
            <p className="text-xs text-white/60">Inicio</p>
            <h1 className="text-xl font-semibold text-white">
              Hola, {userName}
            </h1>
          </div>
          <p className="text-[11px] text-white/50">
            Visualización de riesgo por municipio
          </p>
        </div>

        <div className="px-6 pb-4 flex flex-wrap gap-2 text-xs">
          {CATEGORIAS.map((cat) => {
            const active = categoria === cat.value;
            return (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategoria(cat.value)}
                className={[
                  "rounded-2xl px-4 py-2 font-medium border transition",
                  active
                    ? "bg-[#5b4bff] border-[#5b4bff] text-white shadow"
                    : "bg-transparent border-white/15 text-white/75 hover:border-white/60",
                ].join(" ")}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        <div className="px-6 pb-4 flex flex-wrap gap-3 text-xs">
          <div>
            <label className="block mb-1 text-white/60">Año</label>
            <input
              type="number"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              className="w-24 rounded-xl bg-[#202436] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5b4bff]"
            />
          </div>
          <div>
            <label className="block mb-1 text-white/60">Mes (opcional)</label>
            <input
              type="number"
              min={1}
              max={12}
              value={mes}
              onChange={(e) => setMes(e.target.value)}
              className="w-24 rounded-xl bg-[#202436] border border-white/15 px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#5b4bff]"
              placeholder="1-12"
            />
          </div>
          {loadingHeatmap && (
            <span className="self-end text-[11px] text-white/60">
              Actualizando mapa…
            </span>
          )}
        </div>

        <div
          ref={mapRef}
          className="w-full h-[520px] rounded-[24px] border-t border-white/10"
        />
      </div>

      {/* COLUMNA DERECHA: PANEL */}
      <aside className="w-full xl:w-[360px] rounded-[32px] bg-[#202436] text-white px-5 py-6 shadow-xl border border-white/10 flex flex-col gap-4">
        {/* Nivel de riesgo */}
        <section className="rounded-2xl bg-[#151827] border border-white/10 px-4 py-3 text-xs">
          <p className="font-semibold mb-2">Nivel de riesgo por municipio</p>
          <p className="text-white/60 text-[11px] mb-3">
            ¿Qué municipios están en riesgo BAJO, MEDIO o ALTO para{" "}
            <span className="font-semibold">{categoria}</span> en {anio}?
          </p>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block h-3 w-3 rounded-full bg-[#22c55e]" />
            <span>Bajo</span>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-block h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span>Medio</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-block h-3 w-3 rounded-full bg-[#ef4444]" />
            <span>Alto</span>
          </div>
          {loadingRiesgo && (
            <p className="mt-2 text-white/60">Cargando datos…</p>
          )}
          {error && (
            <p className="mt-2 text-red-400 text-[11px]">{error}</p>
          )}
        </section>

        {/* Municipios más críticos */}
        <section className="rounded-2xl bg-[#151827] border border-white/10 px-4 py-3 text-xs">
          <p className="font-semibold mb-2">Municipios más críticos</p>
          <p className="text-white/60 text-[11px] mb-3">
            Top 5 municipios con mayor riesgo estimado para{" "}
            <span className="font-semibold">{categoria}</span> en {anio}.
          </p>

          {topMunicipios.length === 0 && !loadingRiesgo && (
            <p className="text-white/60 text-[11px]">
              Sin datos para los filtros actuales.
            </p>
          )}

          {topMunicipios.map((m, idx) => (
            <button
              key={m.municipio || idx}
              type="button"
              onClick={() => setMunicipioSeleccionado(m.municipio)}
              className={[
                "w-full flex items-center justify-between py-1.5 px-2 rounded-xl mb-1",
                municipioSeleccionado === m.municipio
                  ? "bg-[#5b4bff] text-white"
                  : "bg-transparent hover:bg-white/5 text-white/80",
              ].join(" ")}
            >
              <span>
                {idx + 1}. {m.municipio}
              </span>
              <span className="text-[11px]">
                {m.nivel_riesgo} • {m.delitos_observados} casos
              </span>
            </button>
          ))}
        </section>

        {/* Impacto por grupo poblacional */}
        <section className="rounded-2xl bg-[#151827] border border-white/10 px-4 py-3 text-xs">
          <p className="font:semicolon mb-2">
            Impacto por grupo poblacional
          </p>
          <p className="text-white/60 text-[11px] mb-3">
            En el municipio{" "}
            <span className="font-semibold">
              {municipioSeleccionado || "…"}
            </span>
            , ¿qué delito afecta más a cada grupo?
          </p>

          {!municipioSeleccionado && (
            <p className="text-[11px] text-white/60 mb-3">
              Selecciona un municipio en la lista de arriba para ver el
              detalle.
            </p>
          )}

          {municipioSeleccionado && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-3">
                {GRUPOS_POBLACION.map((g) => {
                  const active = g.id === grupoSeleccionado;
                  return (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setGrupoSeleccionado(g.id)}
                      className={[
                        "rounded-xl border px-3 py-2 text-[11px] text-left transition",
                        active
                          ? "border-[#5b4bff] bg-[#5b4bff]/20 text-white"
                          : "border-white/15 bg-transparent text-white/80 hover:border-white/60",
                      ].join(" ")}
                    >
                      {g.label}
                    </button>
                  );
                })}
              </div>

              {loadingGrupos && (
                <p className="text-[11px] text-white/60">Cargando…</p>
              )}

              {!loadingGrupos && (
                <div className="text-[11px] text-white/80">
                  {delitoGrupoSeleccionado ? (
                    <>
                      <p className="mb-1">
                        Delito más frecuente en{" "}
                        <span className="font-semibold">
                          {
                            GRUPOS_POBLACION.find(
                              (g) => g.id === grupoSeleccionado
                            )?.label
                          }
                        </span>
                        :
                      </p>
                      <p className="font-semibold">
                        {delitoGrupoSeleccionado.categoria}
                      </p>
                      <p className="text-white/60">
                        {delitoGrupoSeleccionado.total} casos
                        registrados.
                      </p>
                    </>
                  ) : (
                    <p className="text-white/60">
                      No hay datos suficientes para este grupo en el
                      municipio seleccionado.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </aside>
    </div>
  );
}
