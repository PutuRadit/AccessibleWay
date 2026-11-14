import "./styles/global.css";
import "./styles/landing.css";
import "./styles/how-it-works.css";
import { renderLanding, initLanding } from "./pages/landing.js";

const app = document.querySelector("#app");
app.innerHTML = renderLanding();
const cleanup = initLanding(app);

// Hindari event listener dan animasi ganda saat Vite memperbarui modul.
if (import.meta.hot) import.meta.hot.dispose(cleanup);
