import { mountCityScene } from "./scenes/city-scene.js";

const host = document.querySelector("#city-preview");
const status = document.querySelector("#preview-status");
const pause = document.querySelector("#preview-pause");
const reset = document.querySelector("#preview-reset");
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
document.body.dataset.capture = String(new URLSearchParams(location.search).get("capture") === "1");
document.querySelector("#preview-download").href = `${import.meta.env.BASE_URL}assets/models/accessible-city-animated.glb`;

try {
  const controller = mountCityScene(host, {
    paused: reducedMotion.matches,
    layout: new URLSearchParams(location.search).get("layout") === "hero" ? "hero" : "contained",
    onPauseChange(value) { pause.textContent = value ? "Putar" : "Jeda"; },
    onError() {
      document.body.dataset.state = "error";
      status.textContent = "Tampilan 3D tidak tersedia. Model tetap bisa diunduh.";
      status.hidden = false;
    },
  });
  window.cityPreview = controller;
  controller.ready.then(() => {
    document.body.dataset.state = "ready";
    status.hidden = true;
    pause.disabled = reset.disabled = false;
    pause.textContent = controller.paused ? "Putar" : "Jeda";
  }).catch(() => {
    controller.destroy();
    document.body.dataset.state = "error";
    status.textContent = "Kota belum berhasil dimuat. Muat ulang halaman untuk mencoba lagi.";
    status.hidden = false;
  });
  pause.addEventListener("click", () => controller.setPaused(!controller.paused));
  reset.addEventListener("click", () => controller.setTime(0));
  reducedMotion.addEventListener("change", event => { if (event.matches) controller.setPaused(true); });
  if (import.meta.hot) import.meta.hot.dispose(() => controller.destroy());
} catch {
  document.body.dataset.state = "error";
  status.textContent = "Tampilan 3D tidak tersedia di perangkat ini. Model tetap bisa diunduh.";
}
