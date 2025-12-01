/* global google */
import React, { useEffect, useRef } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";


// AQUÍ DEFINES LA URL QUE TE DA TU COMPAÑERO / TU API
// Puedes usar directamente su PHP:
const HEATMAP_API_URL = "https://nivel99.com/urbanik/getHeatmapData.php";
// Más adelante, si quieren, esto se puede cambiar a su ML-API.

// Este componente SOLO dibuja el mapa de calor.
// Los filtros (categoría, año, mes) vienen como props desde la página Mapa.
export default function HeatmapWithFilters({ categoria, anio, mes }) {
  const mapRef = useRef(null);           // DIV donde va el mapa
  const heatmapRef = useRef(null);       // instancia del HeatmapLayer
  const mapInstanceRef = useRef(null);   // instancia del Map

  // Carga Google Maps + heatmap y actualiza cuando cambian los filtros
  useEffect(() => {
    async function init() {
      // 1. Configurar la API de Google
      setOptions({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY, // tu clave del .env
        version: "weekly",
      });

      const { Map } = await importLibrary("maps");
      const { HeatmapLayer } = await importLibrary("visualization");

      // 2. Crear el mapa SOLO la primera vez
      if (!mapInstanceRef.current && mapRef.current) {
        mapInstanceRef.current = new Map(mapRef.current, {
          center: { lat: 7.125, lng: -73.1189 }, // centro Santander aprox
          zoom: 8,
          streetViewControl: false,
          mapTypeControl: false,
        });
      }

      // 3. Pedir los datos del heatmap para los filtros actuales
      await fetchHeatmapData(HeatmapLayer);
    }

    async function fetchHeatmapData(HeatmapLayer) {
      if (!mapInstanceRef.current) return;

      // Construir la URL con filtros (igual que el ejemplo de tu compañero)
      let url = HEATMAP_API_URL;
      const params = [];
      if (categoria) params.push(`categoria=${encodeURIComponent(categoria)}`);
      if (anio) params.push(`anio=${encodeURIComponent(anio)}`);
      if (mes) params.push(`mes=${encodeURIComponent(mes)}`);
      if (params.length > 0) url += "?" + params.join("&");

      const response = await fetch(url);
      const data = await response.json();

      // Ajusta estos nombres a lo que te devuelva tu API:
      const points = (data || []).map((p) =>
        new google.maps.LatLng(
          p.lat ?? p.latitud ?? p.latitude,
          p.lng ?? p.longitud ?? p.longitude
        )
      );

      // 4. Crear o actualizar la capa de heatmap
      if (!heatmapRef.current) {
        heatmapRef.current = new HeatmapLayer({
          data: points,
          radius: 40,
        });
        heatmapRef.current.setMap(mapInstanceRef.current);
      } else {
        heatmapRef.current.setData(points);
      }
    }

    init().catch((err) => {
      console.error("Error inicializando heatmap:", err);
    });
  }, [categoria, anio, mes]);

  // Este div es el contenedor del mapa (el equivalente al div con ref del ejemplo)
  return (
    <div
      ref={mapRef}
      className="w-full h-[520px] rounded-[24px] border-t border-white/10"
    />
  );
}
