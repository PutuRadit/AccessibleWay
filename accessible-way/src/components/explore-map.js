import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import { icon } from "./explore-icons.js";
import { mapConfig } from "../config/map.js";

export function createExploreMap(host, { onSelect, onStatus }) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const map = L.map(host, {
    center: mapConfig.center, zoom: mapConfig.initialZoom,
    minZoom: mapConfig.minZoom, maxZoom: mapConfig.maxZoom,
    zoomControl: false, attributionControl: true,
    fadeAnimation: !reducedMotion.matches, zoomAnimation: !reducedMotion.matches,
  });
  map.attributionControl.setPrefix(false);
  const tiles = L.tileLayer(mapConfig.tileUrl, {
    attribution: mapConfig.attribution, maxZoom: mapConfig.maxZoom,
    updateWhenIdle: true, keepBuffer: 1,
  });
  let failedTiles = 0, loadedTiles = 0, userMarker = null, disposed = false;
  const markerById = new Map();
  function notify(message = "", failed = false) { if (!disposed) onStatus(message, failed); }
  tiles.on("loading", () => { failedTiles = 0; loadedTiles = 0; });
  tiles.on("tileload", () => { loadedTiles++; if (!failedTiles) notify(); });
  tiles.on("tileerror", () => { failedTiles++; });
  tiles.on("load", () => {
    if (failedTiles) notify(loadedTiles ? "Sebagian peta belum termuat." : "Peta belum dapat dimuat.", true);
    else notify();
  });
  tiles.addTo(map);
  const observer = new ResizeObserver(() => { if (!disposed) map.invalidateSize({ pan: false }); });
  observer.observe(host);

  function fitPlaces(items, animate = true) {
    if (!items.length) return;
    const bounds = L.latLngBounds(items.map(item => item.coordinates));
    map.fitBounds(bounds, { padding: [76, 92], maxZoom: items.length === 1 ? 16 : 14,
      animate: animate && !reducedMotion.matches, duration: .5 });
  }
  function setPlaces(items, selectedId) {
    const visible = new Set(items.map(place => place.id));
    for (const [id, marker] of markerById) {
      if (!visible.has(id) && map.hasLayer(marker)) marker.remove();
    }
    for (const place of items) {
      let marker = markerById.get(place.id);
      if (!marker) {
        marker = L.marker(place.coordinates, {
          icon: L.divIcon({ className: `aw-pin aw-pin--${place.visual}`, html: `<span class="aw-pin__shape">${icon(place.icon, 22)}</span>`, iconSize: [48, 56], iconAnchor: [24, 52], tooltipAnchor: [0, -54] }),
          title: `${place.name} — lokasi contoh`, alt: place.name,
          keyboard: true, riseOnHover: true,
        });
        marker.bindTooltip(place.name, { direction: "top", offset: [0, 0], className: "aw-pin-label", opacity: 1 });
        marker.on("click", () => onSelect(place.id, "marker"));
        marker.on("add", () => marker.getElement()?.addEventListener("keydown", event => {
          if (event.code === "Space") { event.preventDefault(); marker.fire("click"); }
        }));
        markerById.set(place.id, marker);
      }
      if (!map.hasLayer(marker)) marker.addTo(map);
      const selected = place.id === selectedId;
      marker.setZIndexOffset(selected ? 1000 : 0);
      const element = marker.getElement();
      element?.classList.toggle("is-selected", selected);
      element?.setAttribute("aria-pressed", String(selected));
      element?.setAttribute("aria-label", `${place.name}, ${place.type}, lokasi contoh. Tampilkan informasi.`);
    }
  }
  return {
    setPlaces, fitPlaces,
    resize() { map.invalidateSize({ pan: false }); },
    focusPlace(place, animate = true) {
      const shouldAnimate = animate && !reducedMotion.matches;
      map.stop();
      map.setView(place.coordinates, Math.max(map.getZoom(), 15), { animate: shouldAnimate, reset: !shouldAnimate });
    },
    focusMarker(id) { markerById.get(id)?.getElement()?.focus({ preventScroll: true }); },
    zoomIn() { map.zoomIn(); }, zoomOut() { map.zoomOut(); },
    showUserLocation(coordinates) {
      if (userMarker) userMarker.remove();
      userMarker = L.circleMarker(coordinates, { radius: 8, fillColor: "#164e8a", fillOpacity: 1, color: "white", weight: 3 }).addTo(map).bindTooltip("Lokasi Anda");
      map.setView(coordinates, 15, { animate: !reducedMotion.matches });
    },
    retry() { notify("Memuat ulang peta…"); tiles.redraw(); },
    destroy() { disposed = true; observer.disconnect(); map.remove(); markerById.clear(); },
  };
}
