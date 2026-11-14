import { renderNavbar, initNavbar } from "../components/navbar.js";
import { renderHero, initHero } from "../components/hero.js";
import { renderHowItWorks, initHowItWorks } from "../components/how-it-works.js";
import { initLandingMotion } from "../motion/landing-motion.js";

export function renderLanding() {
  return `
    ${renderNavbar()}
    <main class="landing-main" id="main-content" tabindex="-1">
      ${renderHero()}
      ${renderHowItWorks()}
    </main>
  `;
}

export function initLanding(root) {
  const disposeNavbar = initNavbar(root);
  const disposeHero = initHero(root);
  const disposeHowItWorks = initHowItWorks(root);
  const disposeMotion = initLandingMotion(root);
  return () => {
    disposeNavbar();
    disposeHero();
    disposeHowItWorks();
    disposeMotion();
  };
}
