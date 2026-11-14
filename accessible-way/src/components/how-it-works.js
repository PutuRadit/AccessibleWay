import { initStepMotion } from "../motion/how-step-motion.js";
import { storyMedia } from "../scenes/story-media.js";

const assetBase = `${import.meta.env.BASE_URL}assets`;

export const storySteps = [
  {
    label: "Selamat Datang",
    title: "Selamat Datang di Accessible Way",
    description: "Accessible Way membantu setiap orang menjelajahi ruang publik dengan rasa percaya diri dan kemandirian yang lebih tinggi.",
    imageDescription: "Rumah dengan akses ramp dan pengguna kursi roda yang bersiap memulai perjalanan.",
  },
  {
    label: "Pilih Destinasi",
    title: "Temukan Tempat yang Ingin Anda Tuju",
    description: "Jelajahi tempat publik di Explore Places. Pilih lokasi untuk melihat informasi tempat dan fasilitas aksesibilitas sebelum berkunjung.",
    imageDescription: "Pengguna kursi roda di dalam rumah membuka ponsel dan memilih rumah sakit pada gelembung peta.",
  },
  {
    label: "Periksa Fasilitas",
    title: "Kenali Akses Sebelum Berkunjung",
    description: "Lihat fasilitas aksesibilitas yang tersedia, seperti ramp, lift, dan toilet aksesibel. Sesuaikan pilihan tempat dengan kebutuhan mobilitas Anda sebelum berkunjung.",
    imageDescription: "Pengguna tetap di dalam rumah. Gelembung konfirmasi berubah dari tiga titik menjadi OK.",
  },
  {
    label: "Rute Tepat",
    title: "Rencanakan Rute di Dalam Gedung",
    description: "Tentukan titik awal, ruangan tujuan, dan kebutuhan mobilitas Anda. Accessible Way membantu menemukan jalur di dalam gedung berdasarkan informasi aksesibilitas yang tersedia.",
    imageDescription: "Pengguna keluar dari rumah mengikuti jalur biru dan berhenti di depan gedung kedua setelah rumah.",
  },
  {
    label: "Tiba di Lokasi",
    title: "Masuk Melalui Akses yang Sesuai",
    description: "Kenali pintu masuk dan fasilitas akses yang sesuai dengan kebutuhan Anda. Gunakan informasi tempat untuk memulai kunjungan dengan lebih nyaman dan mandiri.",
    imageDescription: "Pengguna kursi roda bergerak melalui ramp hingga depan pintu masuk rumah sakit.",
  },
  {
    label: "Peta Dalam Gedung",
    title: "Temukan Ruangan dengan Lebih Mudah",
    description: "Ikuti rute pada denah dan petunjuk langkah demi langkah menuju ruangan tujuan. Jalur disesuaikan dengan kebutuhan mobilitas Anda serta data aksesibilitas yang tersedia.",
    imageDescription: "Pengguna masuk ke rumah sakit dan mengikuti jalur biru sampai ruang farmasi di belakang.",
  },
];

const poster = index => `${assetBase}/video/how-it-works-${index + 1}.jpg`;

export function renderHowItWorks() {
  const first = storySteps[0];
  return `
    <section class="hiw" id="cara-kerja" aria-labelledby="how-heading" data-figma-node="1:72">
      <div class="hiw__inner page-container">
        <header class="hiw__intro" data-figma-node="1:73">
          <h2 class="hiw__heading" id="how-heading">Bagaimana Accessible Way Membimbing Anda?</h2>
          <p class="hiw__subtitle">Eksplorasi perjalanan mobilitas inklusif dari persiapan hingga navigasi interior gedung melalui panggung simulasi di bawah ini.</p>
        </header>
        <div class="hiw__tabs" role="tablist" aria-label="Langkah penggunaan Accessible Way" data-figma-node="1:86">
          <span class="hiw__tab-indicator" aria-hidden="true"></span>
          ${storySteps.map((step, index) => `
            <button class="hiw__tab" type="button" role="tab" id="how-tab-${index}"
                    aria-controls="how-panel" aria-selected="${index === 0}" tabindex="${index === 0 ? 0 : -1}" data-step="${index}">
              <span class="hiw__number" aria-hidden="true">${index + 1}</span>
              <span>${step.label}</span>
            </button>`).join("")}
        </div>
        <div class="hiw__stage" data-step="0" data-scene-state="idle" data-figma-node="1:118">
          <div class="hiw__visual">
            <picture class="hiw__picture">
              <source media="(max-width: 979px)" srcset="${poster(0)}" />
              <img class="hiw__poster" src="${poster(0)}" alt="${first.imageDescription}"
                   width="1440" height="640" loading="lazy" decoding="async" />
            </picture>
            <video class="hiw__clip" muted playsinline preload="metadata" aria-hidden="true" hidden></video>
            <div class="hiw__scene-host"></div>
            <div class="hiw__fallback-bubble story-bubble" data-kind="map" hidden aria-hidden="true">
              <div class="story-bubble__map"><span class="story-bubble__label">Pilih tujuan</span><span class="story-bubble__map-art"><i></i><b>+</b></span><span class="story-bubble__destination">Rumah Sakit</span></div>
              <span class="story-bubble__thinking">…</span><span class="story-bubble__ok">✓ OK</span>
            </div>
            <p class="hiw__scene-status" role="status" hidden>Memuat simulasi…</p>
          </div>
          <div class="hiw__blur" aria-hidden="true"></div>
          <div class="hiw__panel" id="how-panel" role="tabpanel" aria-labelledby="how-tab-0" data-figma-node="1:121">
            <div class="hiw__progress-row" data-figma-node="1:123">
              <p class="hiw__step-count">LANGKAH <span data-step-number>01</span> / 06</p>
              <div class="hiw__segments" aria-hidden="true">${storySteps.map((_, i) => `<span class="hiw__segment${i === 0 ? " hiw__segment--filled" : ""}"></span>`).join("")}</div>
            </div>
            <h3 class="hiw__title" data-step-title data-figma-node="1:135">${first.title}</h3>
            <p class="hiw__description" data-step-description data-figma-node="1:138">${first.description}</p>
            <div class="hiw__actions" data-figma-node="1:139">
              <button class="hiw__button hiw__button--previous" type="button" data-previous aria-label="Langkah sebelumnya" disabled>
                <img src="${assetBase}/icons/arrow-left.svg" alt="" /><span>Previous</span>
              </button>
              <button class="hiw__button hiw__button--next" type="button" data-next aria-label="Langkah berikutnya">
                <span>Next</span><img src="${assetBase}/icons/arrow-right.svg" alt="" />
              </button>
            </div>
          </div>
        </div>
        <p class="hiw__announcement" role="status" aria-live="polite" aria-atomic="true"></p>
      </div>
    </section>
  `;
}

export function initHowItWorks(root) {
  const section = root.querySelector(".hiw");
  const stage = section.querySelector(".hiw__stage");
  stage.dataset.revision = "9";
  stage.dataset.renderer = "pending";
  const host = section.querySelector(".hiw__scene-host");
  const panel = section.querySelector(".hiw__panel");
  const tabs = [...section.querySelectorAll("[role=tab]")];
  const title = section.querySelector("[data-step-title]");
  const description = section.querySelector("[data-step-description]");
  const previous = section.querySelector("[data-previous]");
  const next = section.querySelector("[data-next]");
  const image = section.querySelector(".hiw__poster");
  const clip = section.querySelector(".hiw__clip");
  const status = section.querySelector(".hiw__scene-status");
  const fallbackBubble = section.querySelector(".hiw__fallback-bubble");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const events = new AbortController();
  const stepMotion = initStepMotion(section);
  let selected = 0, controller, loading = false, disposed = false, inView = false, loadAttempted = false;
  let rendererMode = "pending";
  let forceMotion = false, clipShouldPlay = false, reverseClip = false, clipAnimationSeconds = 0;
  clip.muted = true;

  function positionBubble() {
    const show = selected === 1 || selected === 2;
    fallbackBubble.hidden = !show;
    if (!show) return;
    const media = storyMedia[selected];
    const still = reducedMotion.matches && !forceMotion;
    fallbackBubble.dataset.kind = selected === 1 ? "map" : still || clip.currentTime >= .7 ? "confirmed" : "thinking";
    const reference = stage.dataset.sceneState === "video" ? clip : image;
    const visual = section.querySelector(".hiw__visual").getBoundingClientRect();
    const rect = reference.getBoundingClientRect();
    const size = Math.min(rect.width, rect.height);
    const headX = rect.left - visual.left + (rect.width - size) / 2 + media.head.x * size;
    const headY = rect.top - visual.top + (rect.height - size) / 2 + media.head.y * size;
    const half = fallbackBubble.offsetWidth / 2;
    const center = Math.max(half + 8, Math.min(visual.width - half - 8, headX));
    fallbackBubble.style.left = `${center}px`;
    fallbackBubble.style.top = `${headY - 16}px`;
    fallbackBubble.style.setProperty("--tail-x", `${headX - center + half}px`);
    fallbackBubble.dataset.headX = headX.toFixed(2);
    fallbackBubble.dataset.headY = headY.toFixed(2);
    fallbackBubble.dataset.positioned = "true";
  }

  function showFallback() {
    rendererMode = "media";
    stage.dataset.renderer = "media";
    stage.dataset.sceneState = clip.readyState >= 2 ? "video" : "fallback";
    image.removeAttribute("aria-hidden");
    status.hidden = true;
    positionBubble();
    syncClip();
  }

  function syncClip() {
    if (rendererMode !== "media" || !inView || document.hidden || !clipShouldPlay || clip.ended) clip.pause();
    else clip.play().catch(() => { /* Selecting the active step can replay it. */ });
  }

  function playClip() {
    const media = storyMedia[selected];
    const returning = reverseClip && media.reverseUrl;
    const source = `${assetBase}/video/${returning ? media.reverseUrl : media.url}`;
    clipAnimationSeconds = returning ? media.reverseAnimationSeconds : media.animationSeconds;
    clip.dataset.direction = returning ? "previous" : "next";
    clipShouldPlay = selected > 0 && (!reducedMotion.matches || forceMotion);
    clip.hidden = false;
    clip.dataset.step = String(selected);
    clip.poster = poster(selected);
    if (clip.getAttribute("src") !== source) {
      clip.src = source;
      clip.load();
    } else if (clip.readyState >= 1) {
      clip.currentTime = clipShouldPlay ? 0 : clipAnimationSeconds;
      syncClip();
    }
    positionBubble();
  }

  clip.addEventListener("loadeddata", () => {
    if (disposed) return;
    if (!clipShouldPlay) clip.currentTime = clipAnimationSeconds;
    if (rendererMode === "media") showFallback();
    syncClip();
  }, { signal: events.signal });
  clip.addEventListener("timeupdate", positionBubble, { signal: events.signal });
  clip.addEventListener("seeked", positionBubble, { signal: events.signal });
  clip.addEventListener("error", () => {
    if (rendererMode === "media") {
      clip.hidden = true;
      stage.dataset.sceneState = "fallback";
      positionBubble();
    }
  }, { signal: events.signal });
  image.addEventListener("load", positionBubble, { signal: events.signal });

  function select(index, { focusTab = false, restart = false, animate = false } = {}) {
    if (index < 0 || index >= storySteps.length) return;
    const changed = selected !== index;
    const direction = index >= selected ? 1 : -1;
    reverseClip = index < selected && index >= 3;
    selected = index;
    forceMotion = animate;
    const step = storySteps[index];
    stage.dataset.step = String(index);
    tabs.forEach((tab, i) => {
      tab.setAttribute("aria-selected", String(i === index));
      tab.tabIndex = i === index ? 0 : -1;
    });
    panel.setAttribute("aria-labelledby", tabs[index].id);
    section.querySelector("[data-step-number]").textContent = String(index + 1).padStart(2, "0");
    section.querySelectorAll(".hiw__segment").forEach((segment, i) => segment.classList.toggle("hiw__segment--filled", i <= index));
    title.textContent = step.title;
    description.textContent = step.description;
    image.src = poster(index);
    section.querySelector(".hiw__picture source").srcset = poster(index);
    image.alt = step.imageDescription;
    previous.disabled = index === 0;
    next.querySelector("span").textContent = index === storySteps.length - 1 ? "Ulangi" : "Next";
    next.setAttribute("aria-label", index === storySteps.length - 1 ? "Ulangi dari langkah pertama" : "Langkah berikutnya");
    if (focusTab) tabs[index].focus({ preventScroll: true });
    const strip = section.querySelector(".hiw__tabs");
    const active = tabs[index];
    if (active.offsetLeft < strip.scrollLeft || active.offsetLeft + active.offsetWidth > strip.scrollLeft + strip.clientWidth) {
      strip.scrollTo({ left: active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2,
        behavior: reducedMotion.matches ? "instant" : "smooth" });
    }
    if (changed || restart) {
      playClip();
      controller?.setStep(index, { immediate: reducedMotion.matches && !animate, animate });
      section.querySelector(".hiw__announcement").textContent = `Langkah ${index + 1} dari 6. ${step.title}`;
      stepMotion.select(index, { animate: changed, direction });
    }
    positionBubble();
  }

  section.querySelector(".hiw__tabs").addEventListener("click", event => {
    const tab = event.target.closest("[data-step]");
    if (tab) {
      const index = Number(tab.dataset.step);
      select(index, { restart: true, animate: index === selected && reducedMotion.matches });
    }
  }, { signal: events.signal });
  section.querySelector(".hiw__tabs").addEventListener("keydown", event => {
    const current = tabs.indexOf(event.target);
    if (current < 0) return;
    const targets = { ArrowRight: (current + 1) % tabs.length, ArrowLeft: (current + tabs.length - 1) % tabs.length,
      Home: 0, End: tabs.length - 1 };
    if (event.key in targets) { event.preventDefault(); select(targets[event.key], { focusTab: true }); }
  }, { signal: events.signal });
  previous.addEventListener("click", () => select(selected - 1), { signal: events.signal });
  next.addEventListener("click", () => select((selected + 1) % storySteps.length), { signal: events.signal });

  async function load() {
    if (loadAttempted || loading || controller || disposed) return;
    loadAttempted = true;
    loading = true;
    stage.dataset.sceneState = "loading";
    status.hidden = false;
    try {
      const { mountStoryScene } = await import("../scenes/story-scene.js");
      if (disposed) return;
      controller = mountStoryScene(host, {
        initialStep: selected, reducedMotion: reducedMotion.matches,
        onError() { controller?.destroy(); controller = null; if (!disposed) showFallback(); },
      });
      controller.setVisible(inView);
      const currentController = controller;
      await currentController.ready;
      if (disposed || controller !== currentController) { currentController.destroy(); return; }
      if (reverseClip && selected >= 3) {
        currentController.setStep(selected + 1, { immediate: true });
        currentController.setStep(selected, { animate: forceMotion });
      } else if (forceMotion) currentController.setStep(selected, { animate: true });
      currentController.setVisible(inView);
      rendererMode = "3d";
      stage.dataset.renderer = "3d";
      stage.dataset.sceneState = "ready";
      clip.pause();
      image.setAttribute("aria-hidden", "true");
      status.hidden = true;
    } catch {
      controller?.destroy();
      controller = null;
      if (!disposed) showFallback();
    } finally { loading = false; }
  }

  function onReducedMotion(event) {
    forceMotion = false;
    stepMotion.select(selected, { animate: false });
    controller?.setReducedMotion(event.matches);
    playClip();
  }
  reducedMotion.addEventListener("change", onReducedMotion);
  document.addEventListener("visibilitychange", syncClip, { signal: events.signal });
  const resizeObserver = new ResizeObserver(positionBubble);
  resizeObserver.observe(section.querySelector(".hiw__visual"));
  const observer = new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    controller?.setVisible(inView);
    if (inView && !clip.getAttribute("src")) playClip();
    syncClip();
    // Mount once. Scrolling only pauses/resumes the chosen renderer, retaining
    // its camera, current step and animation time. A fallback never upgrades
    // itself to a differently framed GLB when the visitor returns.
    if (inView && !loadAttempted) {
      if (navigator.connection?.saveData) { loadAttempted = true; showFallback(); }
      else load();
    }
  }, { rootMargin: "100px" });
  observer.observe(stage);

  return () => {
    disposed = true;
    events.abort();
    observer.disconnect();
    resizeObserver.disconnect();
    reducedMotion.removeEventListener("change", onReducedMotion);
    stepMotion.destroy();
    controller?.destroy();
    clip.pause();
    clip.removeAttribute("src");
    clip.load();
  };
}
