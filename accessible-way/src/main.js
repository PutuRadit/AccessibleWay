import "./styles/global.css";
const app = document.querySelector("#app");
const path = window.location.pathname.replace(import.meta.env.BASE_URL, "").replace(/^\/+|\/+$/g, "");
const inferred = /^(login|register)(\/index\.html)?$/.exec(path)?.[1];
const page = document.body.dataset.page ?? inferred ?? "landing";
let cleanup = () => {}, disposed = false;

async function mount() {
  if (page === "login" || page === "register") {
    const { renderAuth, initAuth } = await import("./pages/auth.js");
    if (disposed) return;
    app.innerHTML = renderAuth(page);
    cleanup = initAuth(app, page);
  } else {
    const { renderLanding, initLanding } = await import("./pages/landing.js");
    if (disposed) return;
    app.innerHTML = renderLanding();
    cleanup = initLanding(app);
  }
  // Jalankan tautan bagian setelah isi halaman selesai dipasang secara dinamis.
  let fragment = window.location.hash.slice(1);
  try { fragment = decodeURIComponent(fragment); } catch { /* Abaikan encoding fragmen yang tidak valid. */ }
  const target = fragment ? document.getElementById(fragment) : null;
  if (target) requestAnimationFrame(() => { if (!disposed && target.isConnected) target.scrollIntoView({ behavior: "instant", block: "start" }); });
}
mount().catch(() => {
  if (!disposed) app.innerHTML = '<main id="main-content" tabindex="-1"><p role="alert">Halaman belum dapat dimuat. Silakan muat ulang halaman ini.</p></main>';
});

// Hindari event listener dan animasi ganda saat Vite memperbarui modul.
if (import.meta.hot) import.meta.hot.dispose(() => { disposed = true; cleanup(); });
