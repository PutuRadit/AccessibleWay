const baseUrl = import.meta.env.BASE_URL;

const navigationItems = [
  { label: "Home", href: "#beranda", current: true },
  { label: "How It Works", href: "#cara-kerja" },
  { label: "About Us", href: "#tentang-kami" },
  { label: "Contact", href: "#kontak" },
];

export function renderNavbar() {
  const links = navigationItems.map(({ label, href, current }) => `
    <a class="navbar__link${current ? " navbar__link--active" : ""}"
       href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>
  `).join("");

  return `
    <div class="navbar-space">
    <header class="navbar" data-figma-node="1:3" data-visibility="shown">
      <div class="navbar__inner page-container">
        <a class="brand" href="${baseUrl}" aria-label="Accessible Way — Beranda">
          <span class="brand__mark" aria-hidden="true">
            <img src="${baseUrl}assets/icons/accessibility.svg" alt="" />
          </span>
          <span class="brand__name">ACCESSIBLE WAY</span>
        </a>
        <button class="navbar__toggle" type="button" aria-expanded="false"
                aria-controls="main-navigation" aria-label="Buka menu navigasi">
          <span></span><span></span><span></span>
        </button>
        <div class="navbar__panel" id="main-navigation">
          <nav class="navbar__links" aria-label="Navigasi utama">
            <span class="navbar__indicator" aria-hidden="true"></span>${links}
          </nav>
          <div class="navbar__actions">
            <a class="navbar__auth navbar__auth--primary" href="${baseUrl}login/">Sign In</a>
            <a class="navbar__auth navbar__auth--secondary" href="${baseUrl}register/">Register</a>
          </div>
        </div>
      </div>
    </header>
    </div>
  `;
}

export function initNavbar(root) {
  const header = root.querySelector(".navbar");
  const hero = root.querySelector("#beranda");
  const toggle = header.querySelector(".navbar__toggle");
  const panel = header.querySelector(".navbar__panel");
  const navigation = header.querySelector(".navbar__links");
  const indicator = navigation.querySelector(".navbar__indicator");
  const links = [...navigation.querySelectorAll(".navbar__link")];
  const mobileQuery = window.matchMedia("(max-width: 979px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const IDLE_HIDE_MS = 1500;
  let active = links[0], idleTimer = 0, sectionTimer = 0, disposed = false;

  function moveIndicator(immediate = false) {
    if (!active || !navigation.offsetWidth || panel.hidden) return;
    const props = { x: active.offsetLeft, y: active.offsetTop,
      width: active.offsetWidth, height: active.offsetHeight };
    gsap.killTweensOf(indicator);
    if (immediate || reducedMotion.matches || !navigation.dataset.indicator) {
      gsap.set(indicator, props);
      navigation.dataset.indicatorState = "idle";
    } else {
      navigation.dataset.indicatorState = "moving";
      gsap.to(indicator, { ...props, duration: .48, ease: "back.out(1.35)", overwrite: true,
        onComplete() { navigation.dataset.indicatorState = "idle"; } });
    }
    navigation.dataset.indicator = "ready";
  }

  function setActive(link, immediate = false) {
    if (!link) return;
    const changed = active !== link;
    active = link;
    links.forEach(item => {
      const current = item === link;
      item.classList.toggle("navbar__link--active", current);
      if (current) item.setAttribute("aria-current", "location");
      else item.removeAttribute("aria-current");
    });
    if (changed || immediate) moveIndicator(immediate);
  }

  function isInteracting() {
    return header.matches(":hover") || header.contains(document.activeElement)
      || toggle.getAttribute("aria-expanded") === "true";
  }

  function show() {
    header.classList.remove("navbar--hidden");
    header.dataset.visibility = "shown";
  }

  function isInHero() {
    return hero && hero.getBoundingClientRect().bottom > header.offsetHeight;
  }

  function scheduleHide() {
    window.clearTimeout(idleTimer);
    if (disposed) return;
    if (isInHero()) {
      show();
      return;
    }
    idleTimer = window.setTimeout(() => {
      if (disposed) return;
      // A resize or return scroll can bring Hero back before this timer fires.
      if (isInHero()) { show(); return; }
      if (isInteracting()) return;
      header.classList.add("navbar--hidden");
      header.dataset.visibility = "hidden";
    }, IDLE_HIDE_MS);
  }

  function updateSection() {
    let current;
    for (const link of links) {
      const section = root.querySelector(link.getAttribute("href"));
      if (section && section.getBoundingClientRect().top <= Math.max(110, innerHeight * .34)) current = link;
    }
    if (current) setActive(current);
  }

  function onScroll() {
    show();
    scheduleHide();
    window.clearTimeout(sectionTimer);
    sectionTimer = window.setTimeout(updateSection, 180);
  }

  function setOpen(open, restoreFocus = false) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Tutup menu navigasi" : "Buka menu navigasi");
    panel.hidden = mobileQuery.matches && !open;
    header.classList.toggle("navbar--open", open && mobileQuery.matches);
    show();
    scheduleHide();
    moveIndicator(true);
    if (restoreFocus) toggle.focus();
  }

  function handleViewportChange() { setOpen(false); }

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  }, { signal: events.signal });
  panel.addEventListener("click", (event) => {
    const link = event.target.closest(".navbar__link");
    if (link) {
      window.clearTimeout(sectionTimer);
      setActive(link);
      show();
      scheduleHide();
    }
    if (mobileQuery.matches && event.target.closest("a")) setOpen(false);
  }, { signal: events.signal });
  document.addEventListener("click", (event) => {
    if (mobileQuery.matches && !header.contains(event.target)) setOpen(false);
  }, { signal: events.signal });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  }, { signal: events.signal });
  mobileQuery.addEventListener("change", handleViewportChange);
  function onMotionChange() { moveIndicator(true); }
  reducedMotion.addEventListener("change", onMotionChange);
  window.addEventListener("scroll", onScroll, { passive: true, signal: events.signal });
  window.addEventListener("pointermove", event => {
    if (event.clientY <= 18) { show(); scheduleHide(); }
  }, { passive: true, signal: events.signal });
  header.addEventListener("pointerenter", () => { show(); window.clearTimeout(idleTimer); }, { signal: events.signal });
  header.addEventListener("pointerleave", scheduleHide, { signal: events.signal });
  header.addEventListener("focusin", () => { show(); window.clearTimeout(idleTimer); }, { signal: events.signal });
  header.addEventListener("focusout", scheduleHide, { signal: events.signal });
  const resizeObserver = new ResizeObserver(entries => {
    if (entries.some(entry => entry.target === navigation)) moveIndicator(true);
    if (entries.some(entry => entry.target === hero)) scheduleHide();
  });
  resizeObserver.observe(navigation);
  if (hero) resizeObserver.observe(hero);
  document.fonts.ready.then(() => { if (!disposed) moveIndicator(true); });
  handleViewportChange();
  updateSection();

  return () => {
    disposed = true;
    window.clearTimeout(idleTimer);
    window.clearTimeout(sectionTimer);
    events.abort();
    resizeObserver.disconnect();
    gsap.killTweensOf(indicator);
    mobileQuery.removeEventListener("change", handleViewportChange);
    reducedMotion.removeEventListener("change", onMotionChange);
  };
}
import { gsap } from "gsap";

