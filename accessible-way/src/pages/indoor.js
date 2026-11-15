import "../styles/indoor.css";
import { renderAppHeader } from "../components/app-header.js";
import { indoorIcon as icon } from "../components/indoor-icons.js";
import { getIndoorBuilding } from "../data/indoor-buildings.js";
import { mobilityProfiles, getMobilityProfile, resolveIndoorPreferences } from "../data/mobility-profiles.js";
import { findIndoorRoute } from "../services/indoor-routing.js";
import { renderIndoorSvg, updateIndoorSvg } from "../components/indoor-map.js";
import { createIndoorViewport } from "../components/indoor-viewport.js";
const base=import.meta.env.BASE_URL;
const esc=value=>String(value).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
const context=()=>getIndoorBuilding(new URL(window.location.href).searchParams.get("place")??"rs-harmoni");
const optionsFor=building=>'<option value="">Pilih ruangan…</option>'+building.floors.map(floor=>`<optgroup label="${floor.label} · ${esc(floor.name)}">${floor.rooms.map(room=>`<option value="${room.id}">${esc(room.name)} · ${room.floorLabel}</option>`).join("")}</optgroup>`).join("");
const mobilityChoices=name=>mobilityProfiles.map(profile=>`<label class="indoor-mobility-choice"><input type="radio" name="${name}" value="${profile.id}" /><span>${icon(profile.icon,21)}<strong>${profile.label}</strong><i aria-hidden="true"></i></span></label>`).join("");

export function renderIndoor(){
  const building=context();
  if(!building)return `${renderAppHeader()}<main class="indoor-not-found" id="main-content" tabindex="-1">${icon("map",40)}<h1>Tempat belum ditemukan</h1><p>Pilih tempat dari Explore Places untuk membuka denahnya.</p><a href="${base}explore/">Kembali ke Explore Places ${icon("arrow",17)}</a></main>`;
  return `<div class="indoor-shell">${renderAppHeader()}<main class="indoor-page" id="main-content" tabindex="-1">
    <div class="indoor-page-heading"><div><a class="indoor-back" href="${base}explore/?place=${encodeURIComponent(building.id)}">${icon("back",16)}Kembali ke Explore Places</a><p class="indoor-eyebrow">INDOOR NAVIGATION</p><h1>${esc(building.title)}</h1><p class="indoor-subtitle">Kenali ruangannya. Temukan jalan yang sesuai kebutuhanmu.</p></div><div class="indoor-building-badges"><span>${icon("layers",16)}${building.floors.length} lantai</span><span>${icon("info",15)}Denah contoh</span></div></div>
    <div class="indoor-mobile-switch" role="group" aria-label="Tampilan Indoor Map"><button type="button" data-indoor-view="map" aria-pressed="true">${icon("map",17)}Denah</button><button type="button" data-indoor-view="details" aria-pressed="false">${icon("route",17)}Rute & info</button></div>
    <div class="indoor-layout" data-mobile-view="map">
      <aside class="indoor-sidebar" aria-label="Rute dan informasi ruangan">
        <section class="indoor-route-card"><div class="indoor-card-heading"><div><p class="indoor-eyebrow">LANGKAH BERIKUTNYA</p><h2>Rencanakan rute</h2></div><button type="button" class="indoor-icon-button" data-indoor-reset aria-label="Reset titik awal, tujuan, dan rute" title="Reset">${icon("reset",19)}</button></div>
          <form data-indoor-route-form><div class="indoor-endpoints"><div class="indoor-fields">
            <div class="indoor-field"><div><label for="indoor-start">Titik awal</label><button type="button" data-pick-mode="start" data-open-map>Pilih di denah</button></div><div class="indoor-field__control"><span class="indoor-point-badge indoor-point-badge--start">A</span><select id="indoor-start" name="from">${optionsFor(building)}</select></div></div>
            <div class="indoor-field"><div><label for="indoor-end">Tujuan</label><button type="button" data-pick-mode="end" data-open-map>Pilih di denah</button></div><div class="indoor-field__control"><span class="indoor-point-badge">B</span><select id="indoor-end" name="to">${optionsFor(building)}</select></div></div>
          </div><button type="button" class="indoor-swap" data-swap aria-label="Tukar titik awal dan tujuan" title="Tukar titik awal dan tujuan">${icon("swap",18)}</button></div>
          <fieldset class="indoor-mobility" aria-describedby="indoor-mobility-hint"><legend>Kebutuhan mobilitas</legend><div class="indoor-mobility-grid">${mobilityChoices("mobility")}</div><p id="indoor-mobility-hint" data-mobility-hint>Pilih kebutuhan mobilitas sebelum menampilkan rute.</p></fieldset>
          <label class="indoor-access-option"><span>${icon("accessibility",20)}<span><strong>Hindari tangga</strong><small data-stairs-hint>Gunakan akses tanpa anak tangga.</small></span></span><input type="checkbox" data-avoid-stairs aria-describedby="indoor-mobility-hint" checked /></label>
          <p class="indoor-form-message" role="alert" data-route-error hidden></p><button class="indoor-primary-button" type="submit">${icon("route",19)}Temukan rute${icon("arrow",18)}</button></form>
          <div class="indoor-route-result" data-route-result hidden></div>
          <div class="indoor-route-empty" data-route-empty>${icon("route",22)}<p>Pilih ruangan di denah atau dari daftar, lalu temukan rutenya.</p></div>
        </section>
        <section class="indoor-room-card" data-room-info aria-label="Informasi ruangan yang dipilih"></section>
        <p class="indoor-demo-note">${icon("info",14)}Denah dan fasilitas merupakan simulasi, bukan hasil survei gedung nyata.</p>
      </aside>
      <section class="indoor-map-card" aria-label="Denah interaktif gedung">
        <div class="indoor-map-heading"><div><p class="indoor-eyebrow">JELAJAHI SETIAP LANTAI</p><h2>Indoor Map</h2><p data-floor-name></p></div><div class="indoor-floor-tabs" role="tablist" aria-label="Pilih lantai">${building.floors.map(floor=>`<button type="button" role="tab" id="floor-tab-${floor.number}" aria-controls="indoor-floor-panel" aria-selected="${floor.number===1}" tabindex="${floor.number===1?0:-1}" data-floor-tab="${floor.number}">${floor.label}<span class="indoor-route-dot" aria-hidden="true"></span></button>`).join("")}</div></div>
        <div class="indoor-pick-toolbar"><span data-pick-prompt>Pilih ruangan tujuan di denah</span><div role="group" aria-label="Fungsi pilihan ruangan"><button type="button" data-pick-mode="start" aria-pressed="false"><span>A</span>Titik awal</button><button type="button" data-pick-mode="end" aria-pressed="true"><span>B</span>Tujuan</button><button type="button" data-pick-mode="info" aria-pressed="false">${icon("info",14)}Info</button></div></div>
        <div class="indoor-board" role="tabpanel" id="indoor-floor-panel" aria-labelledby="floor-tab-1">
          <div class="indoor-map-canvas" data-indoor-canvas tabindex="0" aria-label="Denah yang dapat digeser dan diperbesar. Gunakan tombol panah untuk menggeser, tambah atau kurang untuk zoom, dan nol untuk melihat seluruh denah."></div>
          <div class="indoor-zoom-controls" role="group" aria-label="Kontrol denah"><button type="button" class="indoor-icon-button" data-zoom="in" aria-label="Perbesar denah" title="Perbesar">${icon("plus",20)}</button><span data-zoom-level>100%</span><button type="button" class="indoor-icon-button" data-zoom="out" aria-label="Perkecil denah" title="Perkecil">${icon("minus",20)}</button><span class="indoor-control-divider"></span><button type="button" class="indoor-icon-button" data-zoom="fit" aria-label="Tampilkan seluruh denah" title="Lihat seluruh denah">${icon("fit",19)}</button></div>
          <div class="indoor-floor-transfer" data-floor-transfer hidden></div>
          <div class="indoor-room-dock" data-room-dock hidden><button type="button" class="indoor-icon-button indoor-room-dock__close" data-close-room aria-label="Tutup ringkasan ruangan">${icon("x",15)}</button><span class="indoor-room-dock__type" data-dock-type></span><strong data-dock-name></strong><p data-dock-facilities></p><button type="button" data-open-room-info>Lihat fasilitas ruangan${icon("arrow",15)}</button></div>
          <span class="indoor-drag-hint">${icon("fit",13)}Geser denah · zoom untuk detail</span>
        </div>
        <div class="indoor-map-footer"><div class="indoor-map-legend"><span><i class="indoor-legend-room"></i>Ruangan</span><span><i class="indoor-legend-service"></i>Fasilitas</span><span><b>A</b>Awal</span><span><b class="indoor-legend-end">B</b>Tujuan</span><span><i class="indoor-legend-route"></i>Rute</span></div><span data-floor-caption>Denah simulasi</span></div>
      </section>
    </div><p class="indoor-sr-only" aria-live="polite" role="status" data-indoor-announcer></p>
  </main>
  <dialog class="indoor-mobility-dialog" aria-labelledby="indoor-mobility-dialog-heading" aria-describedby="indoor-mobility-dialog-description" data-mobility-dialog>
    <div class="indoor-mobility-dialog__hero"><button type="button" class="indoor-icon-button indoor-mobility-dialog__close" data-close-mobility aria-label="Tutup pilihan mobilitas" autofocus>${icon("x",18)}</button><span class="indoor-mobility-dialog__symbol">${icon("route",27)}</span><p class="indoor-eyebrow">RUTE YANG SESUAI UNTUKMU</p><h2 id="indoor-mobility-dialog-heading">Pilih kebutuhan mobilitasmu</h2><p id="indoor-mobility-dialog-description">Pilih salah satu terlebih dahulu agar rute bisa disesuaikan dengan kebutuhanmu.</p></div>
    <form class="indoor-mobility-dialog__form" data-mobility-dialog-form><fieldset class="indoor-mobility" aria-describedby="indoor-dialog-mobility-hint"><legend class="indoor-sr-only">Kebutuhan mobilitas untuk rute</legend><div class="indoor-mobility-grid">${mobilityChoices("mobility-choice")}</div><p id="indoor-dialog-mobility-hint" data-dialog-mobility-hint aria-live="polite">Pilih salah satu opsi untuk melanjutkan.</p></fieldset><button type="submit" class="indoor-primary-button" data-confirm-mobility disabled>${icon("route",18)}Tampilkan rute${icon("arrow",18)}</button><button type="button" class="indoor-mobility-dialog__back" data-close-mobility>Kembali</button></form>
  </dialog></div>`;
}

export function initIndoor(root){
  document.body.classList.add("indoor-page-active");
  const building=context();
  document.title=building?`${building.title} · Indoor Map — Accessible Way`:"Tempat belum ditemukan — Accessible Way";
  if(!building)return()=>document.body.classList.remove("indoor-page-active");
  document.querySelector('meta[name="description"]')?.setAttribute("content",`Denah simulasi interaktif ${building.title}: pilih ruangan, fasilitas, lantai, titik awal, dan tujuan.`);
  const parameters=new URL(window.location.href).searchParams;
  const roomById=new Map(building.rooms.map(room=>[room.id,room]));
  const initialStart=roomById.has(parameters.get("from"))?parameters.get("from"):building.defaultStart;
  const initialEnd=roomById.has(parameters.get("to"))?parameters.get("to"):"";
  const initialFloor=Number(parameters.get("floor"));
  const preferences=resolveIndoorPreferences({mobility:parameters.get("mobility"),avoidStairs:parameters.get("stairs")!=="1"});
  const state={start:initialStart,end:initialEnd,floor:building.floors.some(f=>f.number===initialFloor)?initialFloor:1,mode:initialEnd?"info":"end",selectedRoom:initialEnd||null,mobility:preferences.mobility,avoidStairs:preferences.avoidStairs,route:null,error:""};
  const events=new AbortController(),eventOptions={signal:events.signal};
  const mobile=window.matchMedia("(max-width:760px)");
  const layout=root.querySelector(".indoor-layout"),host=root.querySelector("[data-indoor-canvas]"),startField=root.querySelector("#indoor-start"),endField=root.querySelector("#indoor-end");
  const info=root.querySelector("[data-room-info]");
  const mobilityDialog=root.querySelector("[data-mobility-dialog]"),mobilityDialogForm=root.querySelector("[data-mobility-dialog-form]"),confirmMobility=root.querySelector("[data-confirm-mobility]");
  let renderedFloor=null,infoRoom=null,disposed=false,pendingRoute=null,draftMobility="";
  const announce=message=>{root.querySelector("[data-indoor-announcer]").textContent=message;};
  const viewport=createIndoorViewport(host,{onRoom:selectRoom,onZoom:percent=>{root.querySelector("[data-zoom-level]").textContent=percent+"%";}});
  function syncUrl(){
    const url=new URL(window.location.href);url.searchParams.set("place",building.id);url.searchParams.set("floor",String(state.floor));
    for(const [key,value] of [["from",state.start],["to",state.end],["mobility",state.mobility],["stairs",state.avoidStairs?"":"1"],["route",state.route?.ok?"1":""]]){if(value)url.searchParams.set(key,value);else url.searchParams.delete(key);}
    window.history.replaceState(null,"",url);
  }
  function setMobileView(view){
    layout.dataset.mobileView=view;
    root.querySelectorAll("[data-indoor-view]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.indoorView===view)));
    const selected=roomById.get(state.selectedRoom);
    if(view==="map"&&mobile.matches){if(state.route?.ok)focusRouteFloor();else if(selected?.floor===state.floor)viewport.focusRoom(selected);}
  }
  function clearRoute(){state.route=null;state.error="";}
  function drawFloor(){
    if(renderedFloor!==state.floor){host.innerHTML=renderIndoorSvg(building,state.floor);viewport.setSvg(host.querySelector("svg"));renderedFloor=state.floor;}
    updateIndoorSvg(host.querySelector("svg"),building,state);
    root.querySelector("#indoor-floor-panel").setAttribute("aria-labelledby",`floor-tab-${state.floor}`);
    root.querySelector("[data-floor-name]").textContent=building.floors.find(f=>f.number===state.floor).name;
    for(const tab of root.querySelectorAll("[data-floor-tab]")){
      const active=Number(tab.dataset.floorTab)===state.floor;
      tab.setAttribute("aria-selected",String(active));tab.tabIndex=active?0:-1;
      tab.classList.toggle("has-route",!!state.route?.ok&&state.route.floors.includes(Number(tab.dataset.floorTab)));
    }
    const transfer=state.route?.ok?state.route.transfers.find(t=>state.floor>=Math.min(t.fromFloor,t.toFloor)&&state.floor<=Math.max(t.fromFloor,t.toFloor)):null;
    const transferBox=root.querySelector("[data-floor-transfer]");transferBox.hidden=!transfer;
    if(transfer){const arrived=state.floor===transfer.toFloor;transferBox.innerHTML=`${icon(transfer.kind,18)}<span>${arrived?`Keluar dari ${transfer.kind==="lift"?"lift":"tangga"} di ${state.floor}F`:`Gunakan ${transfer.kind==="lift"?"lift":"tangga"} menuju ${transfer.toFloor}F`}</span>${arrived?"":`<button type="button" data-show-floor="${transfer.toFloor}">Buka ${transfer.toFloor}F ${icon("arrow",14)}</button>`}`;}
    root.querySelector("[data-floor-caption]").textContent=state.route?.ok?(state.route.floors.includes(state.floor)?`Jalur rute · ${state.floor}F`:`Rute berada di ${state.route.floors.map(f=>f+"F").join(" → ")}`):"Denah simulasi";
  }
  function renderRoomInfo(){
    const room=roomById.get(state.selectedRoom);
    const dock=root.querySelector("[data-room-dock]");dock.hidden=!room||room.floor!==state.floor||!!state.route?.ok;
    if(!room){info.innerHTML=`<div class="indoor-room-placeholder">${icon("door",25)}<h2>Kenali ruangannya</h2><p>Pilih ruangan di denah untuk melihat fasilitas dan mengatur rute.</p></div>`;infoRoom=null;return;}
    if(infoRoom!==room.id){
      info.innerHTML=`<div class="indoor-room-info-content"><div class="indoor-room-title"><span>${icon(room.icon,22)}</span><div><p class="indoor-eyebrow">RUANGAN DIPILIH · ${room.floorLabel}</p><h2>${esc(room.name)}</h2></div></div><p class="indoor-room-description">${room.description}</p><div class="indoor-room-tags"><span>${esc(room.type)}</span><span>${room.accessible?"Akses tanpa tangga":"Akses bertangga"}</span></div><h3>Fasilitas di dalam ruangan</h3><ul class="indoor-facility-list">${room.facilities.map(feature=>`<li>${icon(feature.icon,18)}<span>${esc(feature.label)}</span></li>`).join("")}</ul><div class="indoor-assign-actions"><button type="button" data-assign="start" aria-pressed="false"><span>A</span>Jadikan awal</button><button type="button" data-assign="end" aria-pressed="false"><span>B</span>Jadikan tujuan</button></div></div>`;
      infoRoom=room.id;
    }
    info.querySelectorAll("[data-assign]").forEach(button=>button.setAttribute("aria-pressed",String(state[button.dataset.assign]===room.id)));
    root.querySelector("[data-dock-type]").textContent=`${room.floorLabel} · ${room.type}`;
    root.querySelector("[data-dock-name]").textContent=room.name;
    root.querySelector("[data-dock-facilities]").textContent=room.facilities.slice(0,2).map(f=>f.label).join(" · ");
  }
  function renderRouteResult(){
    const result=root.querySelector("[data-route-result]"),route=state.route;
    result.hidden=!route?.ok;root.querySelector("[data-route-empty]").hidden=!!route?.ok;
    const error=root.querySelector("[data-route-error]");error.hidden=!state.error;error.textContent=state.error;
    if(!route?.ok){result.innerHTML="";return;}
    const profile=getMobilityProfile(route.mobility);
    result.innerHTML=`${profile?`<p class="indoor-route-mobility">${icon(profile.icon,17)}<span>Rute untuk <strong>${profile.label}</strong></span></p>`:""}<div class="indoor-route-summary"><div><strong>${Math.max(1,Math.round(route.distance))}<small>m</small></strong><span>Perkiraan jarak</span></div><div><strong>${route.floors.length}<small>lantai</small></strong><span>${route.edges.some(edge=>edge.kind==="stairs")?"Melalui tangga":"Tanpa tangga"}</span></div></div><div class="indoor-steps-heading"><h3>Petunjuk perjalanan</h3><span>${route.steps.length} langkah</span></div><ol class="indoor-route-steps">${route.steps.map((step,index)=>`<li style="--step-index:${index}"><button type="button" data-show-floor="${step.floor}" aria-label="Tampilkan ${step.floor}F: ${esc(step.title)}"><span class="indoor-step-icon">${step.kind==="start"?"A":step.kind==="end"?"B":icon(step.kind==="walk"?"route":step.kind,16)}</span><span><strong>${esc(step.title)}</strong><small>${esc(step.detail)}</small></span><b>${step.floor}F</b></button></li>`).join("")}</ol><p class="indoor-route-estimate">Perkiraan berdasarkan denah simulasi.</p>`;
  }
  function update(){
    startField.value=state.start;endField.value=state.end;
    const profile=getMobilityProfile(state.mobility),stairs=root.querySelector("[data-avoid-stairs]");
    root.querySelectorAll('input[name="mobility"]').forEach(input=>{input.checked=input.value===state.mobility;});
    root.querySelector("[data-mobility-hint]").textContent=profile?.hint??"Pilih kebutuhan mobilitas sebelum menampilkan rute.";
    stairs.checked=state.avoidStairs;stairs.disabled=!!profile?.stepFreeOnly;
    root.querySelector("[data-stairs-hint]").textContent=profile?.stepFreeOnly?"Selalu aktif untuk rute kursi roda.":"Gunakan akses tanpa anak tangga.";
    root.querySelector("[data-swap]").disabled=!state.start||!state.end;
    root.querySelectorAll("[data-pick-mode]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.pickMode===state.mode)));
    root.querySelector("[data-pick-prompt]").textContent=state.mode==="start"?"Pilih ruangan untuk titik awal":state.mode==="end"?"Pilih ruangan tujuan di denah":"Pilih ruangan untuk melihat fasilitas";
    drawFloor();renderRoomInfo();renderRouteResult();syncUrl();
  }
  function focusRouteFloor(){if(state.route?.ok){const segment=state.route.segments.find(s=>s.floor===state.floor);if(segment)viewport.fitPoints(segment.points);}}
  function showRoomInfo(){
    if(mobile.matches){setMobileView("details");requestAnimationFrame(()=>{if(!disposed)info.scrollIntoView({block:"nearest",behavior:"instant"});});}
    else {const side=root.querySelector(".indoor-sidebar");side.scrollTo({top:side.scrollTop+info.getBoundingClientRect().top-side.getBoundingClientRect().top,behavior:window.matchMedia("(prefers-reduced-motion:reduce)").matches?"instant":"smooth"});}
  }
  function setFloor(number){if(!building.floors.some(f=>f.number===number))return;state.floor=number;drawFloor();renderRoomInfo();focusRouteFloor();syncUrl();announce(`Lantai ${number}F ditampilkan.`);}
  function setEndpoint(which,id,{focusRoom=false}={}){
    if(id&&!roomById.has(id))return;
    state[which]=id;clearRoute();
    if(id){const room=roomById.get(id);state.selectedRoom=id;state.floor=room.floor;}
    state.mode=!state.start?"start":!state.end?"end":"info";update();
    if(id&&focusRoom)viewport.focusRoom(roomById.get(id));
    announce(id?`${roomById.get(id).name} menjadi ${which==="start"?"titik awal":"tujuan"}. Tekan Temukan rute untuk melanjutkan.`:"Pilihan ruangan dikosongkan.");
  }
  function selectRoom(id){
    const room=roomById.get(id);if(!room)return;
    const inspecting=state.mode==="info";
    state.selectedRoom=id;
    if(state.mode!=="info"){
      const which=state.mode;state[which]=id;clearRoute();state.mode=which==="start"?"end":"info";
      announce(`${room.name} dipilih sebagai ${which==="start"?"titik awal":"tujuan"}.`);
    }else announce(`${room.name}, ${room.floorLabel}. ${room.facilities.map(f=>f.label).join(", ")}.`);
    update();
    if(inspecting)showRoomInfo();
  }
  function requestMobility(options){
    pendingRoute=options;draftMobility="";mobilityDialogForm.reset();confirmMobility.disabled=true;
    root.querySelector("[data-dialog-mobility-hint]").textContent="Pilih salah satu opsi untuk melanjutkan.";
    if(!mobilityDialog.open)mobilityDialog.showModal();
    announce("Pilih kebutuhan mobilitas terlebih dahulu untuk menampilkan rute.");
  }
  function calculate({preserveFloor=false}={}){
    const route=findIndoorRoute(building,state.start,state.end,{avoidStairs:state.avoidStairs,mobility:state.mobility});
    if(!route.ok){state.route=null;state.error=route.code==="mobility-required"?"":route.message;update();if(route.code==="mobility-required"){requestMobility({preserveFloor});return;}if(!state.start)startField.focus();else if(!state.end)endField.focus();announce(route.message);return;}
    state.route=route;state.error="";state.mode="info";if(!preserveFloor)state.floor=route.start.floor;update();
    if(mobile.matches)setMobileView("map");else root.querySelector(".indoor-sidebar").scrollTo({top:0,behavior:"instant"});
    focusRouteFloor();
    announce(`Rute tersedia${state.mobility?` untuk ${getMobilityProfile(state.mobility).label}`:""}. Sekitar ${Math.max(1,Math.round(route.distance))} meter melalui ${route.floors.map(f=>f+"F").join(", ")}.`);
  }
  root.querySelector("[data-indoor-route-form]").addEventListener("submit",event=>{event.preventDefault();calculate();},eventOptions);
  startField.addEventListener("change",()=>setEndpoint("start",startField.value,{focusRoom:true}),eventOptions);
  endField.addEventListener("change",()=>setEndpoint("end",endField.value,{focusRoom:true}),eventOptions);
  root.querySelectorAll('input[name="mobility"]').forEach(input=>input.addEventListener("change",()=>{
    state.mobility=input.value;state.avoidStairs=true;clearRoute();update();
    announce(`${getMobilityProfile(state.mobility).label} dipilih. Hindari tangga aktif. Temukan rute kembali untuk menyesuaikan jalur.`);
  },eventOptions));
  root.querySelectorAll('input[name="mobility-choice"]').forEach(input=>input.addEventListener("change",()=>{
    draftMobility=input.value;const profile=getMobilityProfile(draftMobility);confirmMobility.disabled=!profile;
    root.querySelector("[data-dialog-mobility-hint]").textContent=profile?.hint??"Pilih salah satu opsi untuk melanjutkan.";
  },eventOptions));
  mobilityDialogForm.addEventListener("submit",event=>{
    event.preventDefault();if(!getMobilityProfile(draftMobility))return;
    const options=pendingRoute??{};
    state.mobility=draftMobility;state.avoidStairs=true;clearRoute();update();mobilityDialog.close();calculate(options);
    if(mobile.matches&&state.route?.ok)host.focus({preventScroll:true});
  },eventOptions);
  mobilityDialog.addEventListener("close",()=>{pendingRoute=null;draftMobility="";confirmMobility.disabled=true;},eventOptions);
  mobilityDialog.addEventListener("keydown",event=>{
    if(event.key!=="Tab")return;
    const first=mobilityDialog.querySelector("[data-close-mobility]"),last=mobilityDialog.querySelector(".indoor-mobility-dialog__back");
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  },eventOptions);
  root.querySelector("[data-avoid-stairs]").addEventListener("change",event=>{state.avoidStairs=event.target.checked;clearRoute();update();announce("Pilihan akses diubah. Temukan rute kembali untuk memperbarui jalur.");},eventOptions);
  root.addEventListener("click",event=>{
    const button=event.target.closest("button");if(!button)return;
    if(button.hasAttribute("data-close-mobility"))mobilityDialog.close();
    else if(button.hasAttribute("data-floor-tab"))setFloor(Number(button.dataset.floorTab));
    else if(button.hasAttribute("data-show-floor")){setFloor(Number(button.dataset.showFloor));setMobileView("map");}
    else if(button.hasAttribute("data-indoor-view"))setMobileView(button.dataset.indoorView);
    else if(button.hasAttribute("data-pick-mode")){state.mode=button.dataset.pickMode;update();if(button.hasAttribute("data-open-map")){setMobileView("map");requestAnimationFrame(()=>{if(!disposed)host.focus({preventScroll:true});});}else if(state.mode==="info"&&state.selectedRoom)showRoomInfo();}
    else if(button.hasAttribute("data-assign")){if(state.selectedRoom){setEndpoint(button.dataset.assign,state.selectedRoom);if(mobile.matches)root.querySelector(".indoor-route-card").scrollIntoView({block:"start",behavior:"instant"});else root.querySelector(".indoor-sidebar").scrollTo({top:0,behavior:"instant"});}}
    else if(button.hasAttribute("data-swap")){if(state.start&&state.end){[state.start,state.end]=[state.end,state.start];clearRoute();state.floor=roomById.get(state.start).floor;update();announce("Titik awal dan tujuan ditukar.");}}
    else if(button.hasAttribute("data-indoor-reset")){state.start=building.defaultStart;state.end="";state.floor=1;state.mode="end";state.selectedRoom=null;clearRoute();update();viewport.fit();announce("Rute direset. Pilih ruangan tujuan.");}
    else if(button.hasAttribute("data-zoom")){if(button.dataset.zoom==="in")viewport.zoomIn();else if(button.dataset.zoom==="out")viewport.zoomOut();else viewport.fit();}
    else if(button.hasAttribute("data-close-room")){state.selectedRoom=null;renderRoomInfo();drawFloor();host.focus({preventScroll:true});}
    else if(button.hasAttribute("data-open-room-info"))showRoomInfo();
  },eventOptions);
  root.addEventListener("keydown",event=>{
    const tab=event.target.closest("[data-floor-tab]");if(!tab||!["ArrowLeft","ArrowRight","Home","End"].includes(event.key))return;
    event.preventDefault();const floors=building.floors.map(f=>f.number),index=floors.indexOf(Number(tab.dataset.floorTab));
    const next=event.key==="Home"?floors[0]:event.key==="End"?floors.at(-1):floors[(index+(event.key==="ArrowRight"?1:-1)+floors.length)%floors.length];
    setFloor(next);root.querySelector(`[data-floor-tab="${next}"]`).focus();
  },eventOptions);
  update();
  if(parameters.get("route")==="1"&&state.start&&state.end)calculate({preserveFloor:true});
  return()=>{disposed=true;events.abort();if(mobilityDialog.open)mobilityDialog.close();viewport.destroy();document.body.classList.remove("indoor-page-active");};
}
