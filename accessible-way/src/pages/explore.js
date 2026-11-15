import "../styles/explore.css";
import { places, placeCategories, facilityOptions } from "../data/places.js";
import { mapConfig } from "../config/map.js";
import { icon } from "../components/explore-icons.js";
import { createExploreMap } from "../components/explore-map.js";
import { renderAppHeader } from "../components/app-header.js";

const base = import.meta.env.BASE_URL;
const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const facility = id => facilityOptions.find(item => item.id === id);
const badge = id => { const item = facility(id); return item ? `<span class="facility-badge" title="${item.label}">${icon(item.icon, 14)}${id === "stepFree" ? "Tanpa tangga" : item.label}</span>` : ""; };
const photo = (place, loading = "lazy") => `<img src="${base}${escapeHtml(place.photo.src)}" alt="${escapeHtml(place.photo.alt)}" width="1200" height="800" loading="${loading}" decoding="async" />`;

export function renderExplore() {
  return `<div class="explore-shell">
    ${renderAppHeader()}
    <div class="explore-view-switch" role="group" aria-label="Tampilan Explore Places">
      <button type="button" data-view="list" aria-pressed="true">${icon("grid", 17)}Daftar tempat</button>
      <button type="button" data-view="map" aria-pressed="false">${icon("map", 17)}Lihat peta</button>
    </div>
    <main class="explore-workspace" id="main-content" tabindex="-1" data-mobile-view="list">
      <section class="explore-panel" aria-label="Cari dan pilih tempat">
        <div class="explore-panel__top">
          <p class="explore-eyebrow">${icon("pin", 16)}EXPLORE PLACES</p>
          <h1>Temukan tempat.<br /><span>Lebih leluasa bergerak.</span></h1>
          <p class="explore-intro">Kenali fasilitas aksesibilitas sebelum melangkah ke tempat tujuanmu.</p>
          <form class="explore-search" role="search" aria-label="Cari tempat">
            ${icon("search", 20)}
            <label class="explore-sr-only" for="place-search">Cari nama atau jenis tempat</label>
            <input id="place-search" name="q" type="search" placeholder="Cari tempat yang ingin kamu tuju…" autocomplete="off" maxlength="120" />
            <button class="explore-search__clear" type="button" aria-label="Hapus pencarian" data-clear-search hidden>${icon("x", 17)}</button>
          </form>
          <div class="explore-toolbar">
            <p>${icon("pin", 14)}Area contoh: ${mapConfig.areaLabel}</p>
            <button class="explore-filter-toggle" type="button" aria-expanded="false" aria-controls="facility-filters" data-filter-toggle>${icon("sliders", 16)}Filter<span data-filter-count hidden></span></button>
          </div>
          <div class="explore-filters" id="facility-filters" hidden>
            <div class="explore-filters__heading"><strong>Fasilitas aksesibilitas</strong><button class="explore-icon-button" type="button" aria-label="Tutup filter" data-filter-close>${icon("x", 18)}</button></div>
            <p>Tampilkan tempat dengan semua fasilitas yang dipilih.</p>
            ${facilityOptions.map(item => `<label class="explore-filter-option"><span>${icon(item.icon, 18)}${item.label}</span><input type="checkbox" name="facility" value="${item.id}" /></label>`).join("")}
            <div class="explore-filters__footer"><button type="button" class="explore-text-button" data-reset-facilities>Hapus pilihan</button><button type="button" class="explore-small-button" data-filter-close>Tampilkan hasil</button></div>
          </div>
          <div class="explore-categories" role="group" aria-label="Kategori tempat">
            ${placeCategories.map(item => `<button type="button" class="explore-category${item.id === "all" ? " is-active" : ""}" data-category="${item.id}" aria-pressed="${item.id === "all"}">${icon(item.icon, 15)}${item.label}</button>`).join("")}
          </div>
        </div>
        <div class="explore-results-heading"><p data-results-count role="status" aria-live="polite"></p><label class="explore-sort">Urutkan<select aria-label="Urutkan tempat" data-sort><option value="default">Pilihan tempat</option><option value="name">Nama A–Z</option></select>${icon("down", 13)}</label></div>
        <div class="explore-results" data-results-scroll><ul class="place-list" data-place-list></ul></div>
      </section>
      <section class="explore-map-panel" aria-label="Peta tempat pilihan">
        <div id="explore-map" class="explore-map" aria-label="Peta interaktif. Gunakan tombol panah untuk menggeser serta tombol tambah dan kurang untuk memperbesar atau memperkecil."></div>
        <div class="explore-map-heading"><div class="explore-map-heading__icon">${icon("map", 22)}</div><div><span>AREA EKSPLORASI</span><strong>${mapConfig.areaLabel}</strong></div><button type="button" class="explore-demo-pill" data-demo-info>${icon("info", 13)}Data contoh</button></div>
        <div class="explore-map-controls" role="group" aria-label="Kontrol peta">
          <button type="button" class="explore-icon-button" data-map-action="locate" aria-label="Tampilkan lokasi saya" title="Lokasi saya">${icon("target", 21)}</button>
          <button type="button" class="explore-icon-button" data-map-action="fit" aria-label="Tampilkan semua hasil di peta" title="Tampilkan semua hasil">${icon("fit", 20)}</button>
          <span class="explore-map-controls__divider"></span>
          <button type="button" class="explore-icon-button" data-map-action="zoom-in" aria-label="Perbesar peta" title="Perbesar">${icon("plus", 22)}</button>
          <button type="button" class="explore-icon-button" data-map-action="zoom-out" aria-label="Perkecil peta" title="Perkecil">${icon("minus", 22)}</button>
        </div>
        <div class="explore-map-message" role="status" aria-live="polite" data-map-message hidden><span data-map-message-text></span><button type="button" data-map-retry hidden>Coba lagi</button></div>
        <div class="explore-map-preview" data-map-preview></div>
        <div class="explore-map-legend">${icon("pin", 14)}Pin lokasi pilihan<span></span>${icon("layers", 14)}Peta OpenStreetMap</div>
      </section>
    </main>
    <p class="explore-sr-only" role="status" aria-live="polite" data-announcer></p>
    <dialog class="place-dialog" aria-labelledby="place-dialog-title" data-place-dialog></dialog>
  </div>`;
}

export function initExplore(root) {
  document.title = "Explore Places — Accessible Way";
  document.querySelector('meta[name="description"]')?.setAttribute("content", "Jelajahi tempat dan informasi fasilitas aksesibilitas bersama Accessible Way. Pratinjau dengan lokasi serta fasilitas contoh.");
  const events = new AbortController();
  const options = { signal: events.signal };
  const workspace = root.querySelector(".explore-workspace");
  const list = root.querySelector("[data-place-list]");
  const search = root.querySelector("#place-search");
  const filters = root.querySelector("#facility-filters");
  const filterToggle = root.querySelector("[data-filter-toggle]");
  const preview = root.querySelector("[data-map-preview]");
  const dialog = root.querySelector("[data-place-dialog]");
  const mobile = window.matchMedia("(max-width: 760px)");
  const state = { query: "", category: "all", facilities: new Set(), sort: "default", selectedId: null };
  const initialId = new URL(window.location.href).searchParams.get("place");
  if (places.some(place => place.id === initialId)) state.selectedId = initialId;
  let visible = places, disposed = false, restoreFocus = null, locateRequest = 0, messageTimer = 0;

  const mapHost = root.querySelector("#explore-map");
  function setMessage(message = "", retry = false) {
    const box = root.querySelector("[data-map-message]");
    box.hidden = !message;
    box.querySelector("[data-map-message-text]").textContent = message;
    box.querySelector("[data-map-retry]").hidden = !retry;
  }
  const map = createExploreMap(mapHost, { onSelect: selectPlace, onStatus: setMessage });
  const normalize = value => value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("id").trim();

  function filteredPlaces() {
    const terms = normalize(state.query).split(/\s+/).filter(Boolean);
    const results = places.filter(place => {
      const text = normalize([place.name, place.type, place.area, place.description, ...place.facilities.map(id => facility(id).label)].join(" "));
      return (state.category === "all" || state.category === place.category)
        && [...state.facilities].every(id => place.facilities.includes(id))
        && terms.every(term => text.includes(term));
    });
    return state.sort === "name" ? results.sort((a, b) => a.name.localeCompare(b.name, "id")) : results;
  }
  function updateSelectionUrl() {
    const url = new URL(window.location.href);
    if (state.selectedId) url.searchParams.set("place", state.selectedId);
    else url.searchParams.delete("place");
    window.history.replaceState(null, "", url);
  }
  function renderCard(place, index) {
    const selected = state.selectedId === place.id;
    return `<li><article class="place-card${selected ? " is-selected" : ""}" data-card="${place.id}" style="--card-order:${index}">
      <button type="button" class="place-card__select" data-place="${place.id}" aria-pressed="${selected}" aria-label="Pilih ${escapeHtml(place.name)} di peta">
        <span class="place-card__image">${photo(place, index < 2 ? "eager" : "lazy")}</span>
        <span class="place-card__copy"><span class="place-card__type">${place.type}<span>Contoh</span></span><strong class="place-card__name">${place.name}</strong><span class="place-card__area">${icon("pin", 12)}${place.area.replace(" · Jakarta Pusat", "")}</span></span>
      </button>
      <div class="place-card__bottom"><div class="place-card__facilities">${place.facilities.slice(0, 2).map(badge).join("")}${place.facilities.length > 2 ? `<span class="facility-badge facility-badge--more" title="${place.facilities.length - 2} fasilitas lainnya">+${place.facilities.length - 2}</span>` : ""}</div><button type="button" class="place-card__details" data-detail="${place.id}" aria-label="Lihat detail ${escapeHtml(place.name)}">Lihat detail${icon("arrow", 14)}</button></div>
    </article></li>`;
  }
  function renderPreview() {
    const place = places.find(item => item.id === state.selectedId);
    if (!place) {
      preview.innerHTML = `<div class="explore-map-hint"><span>${icon("pin", 22)}</span><div><strong>Tujuan berikutnya, dalam jangkauan.</strong><p>Pilih pin atau tempat untuk mengenali fasilitasnya.</p></div></div>`;
      return;
    }
    preview.innerHTML = `<article class="map-place-card"><button type="button" class="map-place-card__close explore-icon-button" data-deselect aria-label="Tutup ringkasan tempat">${icon("x", 16)}</button><div class="map-place-card__image">${photo(place, "eager")}</div><div class="map-place-card__content"><span class="map-place-card__type">${place.type} · Contoh</span><h2>${place.name}</h2><p>${place.facilities.length} fasilitas contoh${place.floors ? ` · ${place.floors} lantai` : ""}</p><button type="button" data-detail="${place.id}">Lihat detail tempat${icon("arrow", 16)}</button></div></article>`;
  }
  function selectPlace(id, source = "card") {
    const place = visible.find(item => item.id === id);
    if (!place) return;
    const changed = state.selectedId !== id;
    state.selectedId = id;
    updateSelectionUrl();
    for (const card of list.querySelectorAll("[data-card]")) {
      const selected = card.dataset.card === id;
      card.classList.toggle("is-selected", selected);
      card.querySelector("[data-place]").setAttribute("aria-pressed", String(selected));
    }
    map.setPlaces(visible, id);
    if (changed) renderPreview();
    if (source !== "marker" && source !== "reveal" && mapHost.clientWidth) map.focusPlace(place);
    if (source === "marker" && !mobile.matches) list.querySelector(`[data-card="${id}"]`)?.scrollIntoView({ block: "nearest", behavior: "instant" });
    root.querySelector("[data-announcer]").textContent = `${place.name} dipilih. ${place.facilities.length} fasilitas contoh tersedia.`;
  }
  function renderResults({ fit = false } = {}) {
    visible = filteredPlaces();
    if (state.selectedId && !visible.some(place => place.id === state.selectedId)) { state.selectedId = null; updateSelectionUrl(); }
    list.innerHTML = visible.length ? visible.map(renderCard).join("") : `<li class="explore-empty">${icon("search", 34)}<h2>Tempat belum ditemukan</h2><p>Coba kata kunci lain atau kurangi pilihan filtermu.</p><button type="button" class="explore-small-button" data-reset-all>Hapus pencarian & filter</button></li>`;
    root.querySelector("[data-results-count]").innerHTML = `<strong>${visible.length} tempat</strong> ditemukan`;
    root.querySelector("[data-clear-search]").hidden = !state.query;
    root.querySelector("[data-filter-count]").hidden = !state.facilities.size;
    root.querySelector("[data-filter-count]").textContent = state.facilities.size;
    filterToggle.classList.toggle("has-filters", !!state.facilities.size);
    for (const button of root.querySelectorAll("[data-category]")) {
      const active = state.category === button.dataset.category;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    }
    map.setPlaces(visible, state.selectedId);
    renderPreview();
    if (fit && mapHost.clientWidth) map.fitPlaces(visible);
  }
  function setFilterOpen(open, focusBack = false) {
    filters.hidden = !open;
    filterToggle.setAttribute("aria-expanded", String(open));
    if (focusBack) filterToggle.focus();
  }
  function setView(view) {
    workspace.dataset.mobileView = view;
    root.querySelectorAll("[data-view]").forEach(button => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
    if (view === "map") requestAnimationFrame(() => {
      if (disposed) return;
      map.resize();
      const selected = visible.find(place => place.id === state.selectedId);
      if (selected) map.focusPlace(selected, false); else map.fitPlaces(visible, false);
    });
  }
  function openDialog(html) {
    restoreFocus = document.activeElement;
    if (dialog.open) dialog.close();
    dialog.innerHTML = html;
    dialog.showModal();
  }
  function openDetails(id) {
    const place = places.find(item => item.id === id);
    if (!place) return;
    selectPlace(id, "details");
    openDialog(`<button type="button" class="place-dialog__close explore-icon-button" data-dialog-close aria-label="Tutup detail tempat" autofocus>${icon("x", 21)}</button><div class="place-dialog__hero">${photo(place, "eager")}<span>FOTO ILUSTRASI · DATA CONTOH</span></div><div class="place-dialog__body"><p class="explore-eyebrow">${icon(place.icon, 16)}${place.type}</p><h2 id="place-dialog-title">${place.name}</h2><p class="place-dialog__location">${icon("pin", 16)}${place.area}</p><p class="place-dialog__description">${place.description}</p><a class="place-dialog__photo-credit" href="${escapeHtml(place.photo.source)}" target="_blank" rel="noopener noreferrer">Foto contoh: ${escapeHtml(place.photo.author)} · Pexels ${icon("arrow", 12)}</a><h3>Fasilitas contoh</h3><div class="place-dialog__facilities">${place.facilities.map(id => `<div>${icon(facility(id).icon, 19)}<span>${facility(id).label}</span>${icon("check", 15)}</div>`).join("")}</div><div class="place-dialog__entrance">${icon("accessibility", 20)}<div><strong>Akses masuk</strong><p>${place.entrance}</p></div></div><div class="place-dialog__indoor"><div>${icon("layers", 21)}<strong>Denah indoor</strong></div><span>${place.floors} lantai tersedia</span><p>Pilih ruangan, lihat fasilitasnya, dan temukan rute melalui denah setiap lantai.</p></div><a class="place-dialog__map-button" href="${base}indoor/?place=${encodeURIComponent(place.id)}">${icon("map", 18)}Lihat Indoor Map${icon("arrow", 18)}</a><p class="place-dialog__note">Nama, pin, dan fasilitas adalah simulasi. Foto adalah contoh suasana sesuai kategori tempat, bukan foto lokasi fiktif tersebut.</p></div>`);
  }
  function resetAll() {
    state.query = ""; state.category = "all"; state.facilities.clear(); search.value = "";
    filters.querySelectorAll("input").forEach(input => { input.checked = false; });
    renderResults({ fit: true });
    search.focus();
  }
  function locateUser(button) {
    if (!navigator.geolocation) { setMessage("Perangkat ini belum mendukung lokasi. Pilih tempat dari daftar."); return; }
    const request = ++locateRequest;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
    setMessage("Mencari lokasi Anda…");
    navigator.geolocation.getCurrentPosition(position => {
      if (disposed || request !== locateRequest) return;
      button.disabled = false; button.removeAttribute("aria-busy");
      map.showUserLocation([position.coords.latitude, position.coords.longitude]);
      setMessage("Lokasi Anda ditampilkan. Tempat contoh tetap berada di Jakarta Pusat.");
      window.clearTimeout(messageTimer);
      messageTimer = window.setTimeout(() => { if (!disposed) setMessage(); }, 6500);
    }, error => {
      if (disposed || request !== locateRequest) return;
      button.disabled = false; button.removeAttribute("aria-busy");
      setMessage(error.code === 1 ? "Izin lokasi belum diberikan. Kamu tetap bisa memilih tempat dari daftar." : "Lokasi belum ditemukan. Coba lagi dari tombol lokasi.");
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 });
  }

  root.querySelector(".explore-search").addEventListener("submit", event => event.preventDefault(), options);
  search.addEventListener("input", () => { state.query = search.value; renderResults(); }, options);
  root.querySelector("[data-sort]").addEventListener("change", event => { state.sort = event.target.value; renderResults(); }, options);
  filters.addEventListener("change", event => {
    const input = event.target.closest('input[name="facility"]');
    if (!input) return;
    if (input.checked) state.facilities.add(input.value); else state.facilities.delete(input.value);
    renderResults({ fit: true });
  }, options);
  root.addEventListener("click", event => {
    const target = event.target.closest("button");
    if (!target) return;
    if (target.hasAttribute("data-filter-toggle")) setFilterOpen(filters.hidden);
    else if (target.hasAttribute("data-filter-close")) setFilterOpen(false, true);
    else if (target.hasAttribute("data-clear-search")) { search.value = ""; state.query = ""; renderResults({ fit: true }); search.focus(); }
    else if (target.hasAttribute("data-category")) { state.category = target.dataset.category; renderResults({ fit: true }); }
    else if (target.hasAttribute("data-reset-all")) resetAll();
    else if (target.hasAttribute("data-reset-facilities")) { state.facilities.clear(); filters.querySelectorAll("input").forEach(input => { input.checked = false; }); renderResults({ fit: true }); }
    else if (target.hasAttribute("data-view")) setView(target.dataset.view);
    else if (target.hasAttribute("data-detail")) openDetails(target.dataset.detail);
    else if (target.hasAttribute("data-place")) selectPlace(target.dataset.place);
    else if (target.hasAttribute("data-deselect")) { const id = state.selectedId; state.selectedId = null; updateSelectionUrl(); renderResults(); map.focusMarker(id); }
    else if (target.hasAttribute("data-dialog-close")) dialog.close();
    else if (target.hasAttribute("data-map-retry")) map.retry();
    else if (target.hasAttribute("data-map-action")) {
      const action = target.dataset.mapAction;
      if (action === "zoom-in") map.zoomIn();
      else if (action === "zoom-out") map.zoomOut();
      else if (action === "fit") { map.fitPlaces(visible); if (!visible.length) setMessage("Belum ada hasil untuk ditampilkan. Ubah pencarian atau filter."); }
      else if (action === "locate") locateUser(target);
    } else if (target.hasAttribute("data-demo-info")) {
      openDialog(`<div class="place-dialog__body place-dialog__body--info"><button type="button" class="place-dialog__close explore-icon-button" data-dialog-close aria-label="Tutup informasi" autofocus>${icon("x", 21)}</button><span class="place-dialog__info-icon">${icon("info", 30)}</span><h2 id="place-dialog-title">Kenali pratinjau ini</h2><p>Peta menampilkan wilayah nyata. Nama tempat, posisi pin, dan fasilitas adalah contoh untuk mencoba Explore Places.</p><p>Data contoh ini tidak mewakili tempat nyata atau hasil pemeriksaan aksesibilitas. Denah indoor juga memakai ruang dan fasilitas contoh untuk mencoba alur navigasi.</p><button type="button" class="place-dialog__map-button" data-dialog-close>Mengerti${icon("check", 18)}</button></div>`);
    }
  }, options);
  document.addEventListener("click", event => {
    if (!filters.hidden && !filters.contains(event.target) && !filterToggle.contains(event.target)) setFilterOpen(false);
  }, options);
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !filters.hidden) { event.preventDefault(); setFilterOpen(false, true); }
  }, options);
  dialog.addEventListener("click", event => { if (event.target === dialog) dialog.close(); }, options);
  dialog.addEventListener("close", () => { if (restoreFocus?.isConnected) restoreFocus.focus({ preventScroll: true }); }, options);
  window.addEventListener("offline", () => setMessage("Koneksi terputus. Daftar tempat tetap bisa digunakan.", true), options);
  window.addEventListener("online", () => map.retry(), options);
  renderResults();
  if (mapHost.clientWidth) {
    if (state.selectedId) map.focusPlace(places.find(place => place.id === state.selectedId));
    else map.fitPlaces(visible, false);
  }
  if (!navigator.onLine) setMessage("Koneksi terputus. Daftar tempat tetap bisa digunakan.", true);
  return () => { disposed = true; locateRequest++; window.clearTimeout(messageTimer); if (dialog.open) dialog.close(); events.abort(); map.destroy(); };
}
