const assetBase = `${import.meta.env.BASE_URL}assets`;

export function renderHero() {
  return `
    <section class="hero" id="beranda" aria-labelledby="hero-heading" data-figma-node="1:25">
      <div class="hero__grid">
        <div class="hero__copy">
          <p class="hero__badge" data-hero-reveal>
            <img src="${assetBase}/icons/accessibility-standard.svg" alt="" />
            <span>Standar Aksesibilitas Nasional &amp; Global</span>
          </p>
          <h1 class="hero__heading" id="hero-heading" data-hero-reveal>
            <span>Setiap Tempat,</span>
            <span>Dalam Jangkauanmu.</span>
          </h1>
          <p class="hero__description" data-hero-reveal>
            Temukan tempat publik yang ramah disabilitas, eksplorasi fasilitas
            inklusif, dan dapatkan panduan rute ramah mobilitas di dalam
            maupun sekitar gedung sesuai kebutuhan Anda.
          </p>
          <div class="hero__actions" data-hero-reveal>
            <a class="hero__button hero__button--primary" href="${import.meta.env.BASE_URL}explore">
              <img src="${assetBase}/icons/compass.svg" alt="" />
              <span>Find Your Way</span>
            </a>
            <a class="hero__button hero__button--secondary" href="#cara-kerja">
              <img src="${assetBase}/icons/play-circle.svg" alt="" />
              <span>Learn How It Works</span>
            </a>
          </div>
        </div>
        <div class="hero-visual" data-figma-node="1:66">
          <div class="hero-visual__card">
            <div class="hero-visual__viewport">
              <picture class="hero-city-picture">
                <source media="(max-width: 979px)" srcset="${assetBase}/images/accessible-city-poster.png" />
                <img class="hero-city-poster"
                     src="${assetBase}/images/accessible-city-hero-background.png"
                     alt="Kota inklusif dengan rumah, toko, taman, pejalan kaki, pengguna kursi roda, dan kendaraan."
                     width="1920" height="1000" fetchpriority="high" decoding="async" />
              </picture>
              <div class="hero-city-host"></div>
              <span class="hero-city-status" role="status">Memuat kota…</span>
              <button class="hero-city-retry" type="button" hidden>Coba tampilan 3D</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initHero(root) {
  return initCityHero(root);
}

function initCityHero(root) {
  const viewport = root.querySelector(".hero-visual__viewport");
  const host = root.querySelector(".hero-city-host");
  const poster = root.querySelector(".hero-city-poster");
  const status = root.querySelector(".hero-city-status");
  const retry = root.querySelector(".hero-city-retry");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  let controller, loading = false, disposed = false, inView = false;

  function showPoster() {
    viewport.classList.remove("hero-city-ready");
    poster.removeAttribute("aria-hidden");
    status.hidden = true;
    retry.hidden = false;
  }

  async function load() {
    if (loading || controller || disposed) return;
    loading = true;
    status.hidden = false;
    retry.hidden = true;
    try {
      const { mountCityScene } = await import("../scenes/city-scene.js");
      if (disposed) return;
      controller = mountCityScene(host, {
        paused: reducedMotion.matches,
        layout: "hero",
        playbackRate: 0.5,
        onError() {
          showPoster();
          controller?.destroy();
          controller = null;
        },
      });
      controller.setVisible(inView);
      await controller.ready;
      if (disposed) { controller?.destroy(); return; }
      viewport.classList.add("hero-city-ready");
      poster.setAttribute("aria-hidden", "true");
      status.hidden = true;
    } catch {
      controller?.destroy();
      controller = null;
      if (!disposed) showPoster();
    } finally { loading = false; }
  }

  retry.addEventListener("click", load, { signal: events.signal });
  function onReducedMotion(event) { controller?.setPaused(event.matches); }
  reducedMotion.addEventListener("change", onReducedMotion);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    controller?.setVisible(inView);
    if (inView && !controller) {
      if (navigator.connection?.saveData) showPoster();
      else load();
    }
  }, { rootMargin: "80px" });
  observer.observe(viewport);

  return () => {
    disposed = true;
    events.abort();
    observer.disconnect();
    reducedMotion.removeEventListener("change", onReducedMotion);
    controller?.destroy();
  };
}
