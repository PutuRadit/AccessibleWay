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
                <source media="(max-width: 979px)" srcset="${assetBase}/images/hero-city-mobile-hd.webp" />
                <img class="hero-city-poster"
                     src="${assetBase}/images/hero-city-desktop-hd.webp"
                     alt="Kota inklusif dengan rumah, toko, taman, pejalan kaki, pengguna kursi roda, dan kendaraan."
                     width="2560" height="1080" fetchpriority="high" decoding="async" />
              </picture>
              <div class="hero-city-host" role="img" aria-label="Animasi kota inklusif dengan pejalan kaki, pengguna kursi roda, dan kendaraan.">
                <video class="hero-city-video" width="2560" height="1080"
                       muted loop playsinline preload="metadata" aria-hidden="true"
                       disablepictureinpicture disableremoteplayback></video>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function initHero(root) {
  return initCityVideo(root);
}

function initCityVideo(root) {
  const viewport = root.querySelector(".hero-visual__viewport");
  const video = root.querySelector(".hero-city-video");
  const poster = root.querySelector(".hero-city-poster");
  const compact = matchMedia("(max-width: 979px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const listen = (target, type, callback) => target.addEventListener(type, callback, { signal: events.signal });
  let disposed = false, inView = false;
  let blocked = false, failed = false, source = "", restoreTime = null, generation = 0, playPromise = null;

  function motionAllowed() {
    return !reducedMotion.matches && !navigator.connection?.saveData;
  }

  function shouldPlay() {
    return !disposed && inView && !document.hidden && motionAllowed() && !blocked && !failed;
  }

  function updatePlaybackState() {
    viewport.dataset.playback = shouldPlay() && !video.paused ? "playing" : "paused";
  }

  function showFrame() {
    if (disposed || blocked || failed || video.readyState < 2 || video.seeking || restoreTime !== null) return;
    viewport.classList.add("hero-city-ready");
    poster.setAttribute("aria-hidden", "true");
  }

  function selectSource() {
    const next = compact.matches ? "mobile" : "desktop";
    if (source === next) return;
    const currentTime = restoreTime ?? (video.currentTime || 0);
    generation++;
    playPromise = null;
    video.pause();
    source = next;
    restoreTime = currentTime;
    viewport.classList.remove("hero-city-ready");
    poster.removeAttribute("aria-hidden");
    video.src = `${assetBase}/videos/hero-city-${next}-hd.mp4`;
    video.load();
  }

  function syncPlayback() {
    if (disposed) return;
    if (!shouldPlay()) {
      video.pause();
      updatePlaybackState();
      return;
    }
    selectSource();
    if (video.paused && !playPromise) {
      const token = generation;
      playPromise = video.play().catch(error => {
        if (!disposed && token === generation && error.name !== "AbortError" && shouldPlay()) {
          blocked = true;
          video.pause();
          viewport.classList.remove("hero-city-ready");
          poster.removeAttribute("aria-hidden");
          updatePlaybackState();
        }
      }).finally(() => {
        if (token !== generation) return;
        playPromise = null;
        if (shouldPlay() && video.paused) syncPlayback();
      });
    }
    updatePlaybackState();
  }

  video.muted = true;
  listen(video, "loadedmetadata", () => {
    if (restoreTime === null) return;
    const time = Number.isFinite(video.duration) && video.duration > 0 ? restoreTime % video.duration : 0;
    restoreTime = null;
    if (time > 0) video.currentTime = time;
    showFrame();
  });
  for (const event of ["loadeddata", "seeked", "playing"]) listen(video, event, () => { showFrame(); updatePlaybackState(); });
  listen(video, "pause", updatePlaybackState);
  listen(video, "error", () => {
    if (disposed) return;
    failed = true;
    video.pause();
    viewport.classList.remove("hero-city-ready");
    poster.removeAttribute("aria-hidden");
    updatePlaybackState();
  });
  listen(compact, "change", () => {
    // Only the layout breakpoint changes the file. Scroll/resize keeps its playback time.
    if (source) selectSource();
    syncPlayback();
  });
  listen(reducedMotion, "change", syncPlayback);
  listen(document, "visibilitychange", syncPlayback);
  if (navigator.connection?.addEventListener) listen(navigator.connection, "change", syncPlayback);
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    syncPlayback();
  }, { rootMargin: "0px" });
  observer.observe(viewport);
  updatePlaybackState();

  return () => {
    if (disposed) return;
    disposed = true;
    generation++;
    events.abort();
    observer.disconnect();
    video.pause();
    video.removeAttribute("src");
    video.load();
  };
}
