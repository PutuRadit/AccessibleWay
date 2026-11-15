import { indoorIcon as icon } from "./indoor-icons.js";
import { INDOOR_VIEW } from "../data/indoor-buildings.js";
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
function wrap(text, limit) {
  const lines = [];
  for (const word of text.split(" ")) {
    if (!lines.length || (lines.at(-1) + " " + word).length > limit) lines.push(word);
    else lines[lines.length - 1] += " " + word;
  }
  return lines;
}
function renderRoom(room) {
  const r = room.rect, cx = r.x + r.w / 2, lines = wrap(room.name, r.w < 100 ? 10 : 21);
  const baseline = r.y + 78 - (lines.length - 1) * 9;
  const doorY = room.door[1];
  const fixture = room.kind === "stairs" ? `<g class="indoor-fixture">${Array.from({length:6},(_,i)=>`<path d="M${r.x+28} ${r.y+118+i*6}h${r.w-56}"/>`).join("")}</g>` : r.w > 100 ? `<g class="indoor-fixture"><rect x="${r.x+22}" y="${r.y+136}" width="25" height="16" rx="3"/><rect x="${r.x+r.w-47}" y="${r.y+136}" width="25" height="16" rx="3"/></g>` : "";
  return `<g class="indoor-room indoor-room--${room.kind}" data-room-id="${room.id}" role="button" tabindex="0" aria-pressed="false" aria-label="${esc(room.name)}, lantai ${room.floorLabel}, ${room.facilities.length} fasilitas. Pilih ruangan.">
    <rect class="indoor-room__shape" x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="6"/>
    <text class="indoor-room__code" x="${r.x+r.w-12}" y="${r.y+19}" text-anchor="end">${room.code}</text>
    <g class="indoor-room__icon" transform="translate(${cx-12} ${r.y+27})">${icon(room.icon,24)}</g>
    <text class="indoor-room__name${r.w<100 ? " indoor-room__name--small" : ""}" x="${cx}" y="${baseline}" text-anchor="middle">${lines.map((line,i)=>`<tspan x="${cx}" dy="${i?18:0}">${esc(line)}</tspan>`).join("")}</text>
    ${r.w>100 ? `<text class="indoor-room__type" x="${cx}" y="${baseline+(lines.length-1)*18+23}" text-anchor="middle">${room.type}</text>` : ""}
    ${fixture}<path class="indoor-door-gap" d="M${cx-14} ${doorY}h28"/>
    <path class="indoor-door-swing" d="M${cx-14} ${doorY}v${r.bank==="top"?-25:25}a25 25 0 0 ${r.bank==="top"?1:0} 25 ${r.bank==="top"?25:-25}"/>
  </g>`;
}
export function renderIndoorSvg(building, floorNumber) {
  const floor = building.floors.find(f => f.number === floorNumber);
  return `<svg class="indoor-svg" data-floor-svg viewBox="0 0 ${INDOOR_VIEW.width} ${INDOOR_VIEW.height}" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Denah ${esc(building.title)}, lantai ${floor.label}. Pilih ruangan dengan klik atau tombol Enter.">
    <title>${esc(building.title)} · ${floor.label}</title><desc>Denah simulasi interaktif. Ruangan tersambung melalui koridor tengah. Penghubung lantai hanya melalui lift atau tangga yang ditandai.</desc>
    <defs><pattern id="indoor-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r=".8" fill="#cdd9e6"/></pattern></defs>
    <rect width="1120" height="780" fill="#f7faff"/><rect width="1120" height="780" fill="url(#indoor-dot-grid)" opacity=".62"/>
    <text class="indoor-plan-title" x="90" y="68">${floor.label} · ${esc(floor.name)}</text>
    <g class="indoor-compass" transform="translate(1020 57)"><path d="m0-16-7 20 7-4 7 4Z"/><text x="0" y="24" text-anchor="middle">N</text></g>
    <rect class="indoor-building-wall" x="85" y="105" width="950" height="560" rx="10"/>
    <rect class="indoor-corridor" x="110" y="310" width="900" height="140"/>
    <path class="indoor-corridor-guide" d="M130 380H990"/>
    <text class="indoor-corridor-label" x="560" y="356" text-anchor="middle">KORIDOR UTAMA</text>
    <g data-room-layer>${floor.rooms.map(renderRoom).join("")}</g>
    ${floorNumber===1 ? '<path class="indoor-entry-gap" d="M594 665h32"/><path class="indoor-entry-ramp" d="M591 621v91h38v-91M598 692l12-20 12 20"/><text class="indoor-entry-label" x="610" y="742" text-anchor="middle">Pintu masuk · ramp</text>' : '<text class="indoor-entry-label" x="560" y="715" text-anchor="middle">Akses antarlantai melalui lift / tangga</text>'}
    <g data-route-layer aria-hidden="true" pointer-events="none"></g><g data-endpoint-layer aria-hidden="true" pointer-events="none"></g>
  </svg>`;
}
export function updateIndoorSvg(svg, building, state) {
  for (const group of svg.querySelectorAll("[data-room-id]")) {
    const id=group.dataset.roomId;
    group.classList.toggle("is-selected",id===state.selectedRoom);
    group.classList.toggle("is-start",id===state.start);
    group.classList.toggle("is-end",id===state.end);
    group.setAttribute("aria-pressed",String(id===state.selectedRoom));
  }
  const segments=state.route?.ok ? state.route.segments.filter(segment=>segment.floor===state.floor && segment.points.length>1) : [];
  const routeLayer=svg.querySelector("[data-route-layer]"),routeKey=segments.map(segment=>segment.points.map(point=>point.join(",")).join(";")).join("|");
  if(routeLayer.dataset.routeKey!==routeKey){routeLayer.dataset.routeKey=routeKey;routeLayer.innerHTML=segments.map(segment=>{
    const d=segment.points.map(([x,y],i)=>`${i?"L":"M"}${x} ${y}`).join(" ");
    return `<path class="indoor-route-line" d="${d}" pathLength="100"/><path class="indoor-route-flow" d="${d}" pathLength="100"/>`;
  }).join("");}
  const endpointLayer=svg.querySelector("[data-endpoint-layer]"),endpointKey=`${state.start}|${state.end}|${state.floor}`;
  if(endpointLayer.dataset.endpointKey!==endpointKey){endpointLayer.dataset.endpointKey=endpointKey;endpointLayer.innerHTML=[[state.start,"A","start"],[state.end,"B","end"]].map(([id,label,type])=>{
    const room=building.rooms.find(room=>room.id===id && room.floor===state.floor);
    if(!room) return "";
    return `<g class="indoor-endpoint indoor-endpoint--${type}" transform="translate(${room.anchor[0]} ${room.anchor[1]})"><circle r="17"/><text text-anchor="middle" dominant-baseline="central">${label}</text></g>`;
  }).join("");}
}
