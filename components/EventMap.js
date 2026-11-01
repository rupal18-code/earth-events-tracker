"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { COLORS, FALLBACK_COLOR } from "../lib/categories";

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default function EventMap({ events, selectedId, onSelect }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const markers = useRef({});

  // create the map once
  useEffect(() => {
    map.current = L.map(el.current, { minZoom: 2, worldCopyJump: true }).setView([20, 0], 2);
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      maxZoom: 18,
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => {
      map.current.remove();
      map.current = null;
    };
  }, []);

  // redraw markers whenever the filtered events change
  useEffect(() => {
    layer.current.clearLayers();
    markers.current = {};
    events.forEach((e) => {
      const marker = L.circleMarker([e.lat, e.lon], {
        radius: 7,
        color: "#0b1a24",
        weight: 1.5,
        fillColor: COLORS[e.categoryId] || FALLBACK_COLOR,
        fillOpacity: 0.9,
      })
        .bindPopup(
          `<strong>${esc(e.title)}</strong><br/>${esc(e.category)}<br/>` +
            `${new Date(e.date).toLocaleDateString()}<br/>` +
            (e.link ? `<a href="${esc(e.link)}" target="_blank" rel="noreferrer">Source</a>` : "")
        )
        .on("click", () => onSelect(e.id))
        .addTo(layer.current);
      markers.current[e.id] = marker;
    });
  }, [events, onSelect]);

  // fly to the selected event
  useEffect(() => {
    const m = markers.current[selectedId];
    if (m && map.current) {
      map.current.flyTo(m.getLatLng(), Math.max(map.current.getZoom(), 5), { duration: 0.8 });
      m.openPopup();
    }
  }, [selectedId]);

  return <div ref={el} className="h-full w-full" aria-label="Map of natural events" />;
}
