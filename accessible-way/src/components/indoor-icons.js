import { icon as sharedIcon } from "./explore-icons.js";
const paths = {
  wheelchair: '<circle cx="13" cy="4" r="2"/><path d="m12 8-1 6h6l3 6 2-1M12 10h6M8 10a6 6 0 1 0 7 9"/>',
  walker: '<path d="M6 21 8 4h8l2 17M7 14h10M4 5h4m8 0h4M9 4V2m6 2V2M5 21h3m8 0h3"/>',
  crutches: '<path d="m4 3 8 4m-7-1 6 3-3 6-3-1ZM8 15l-3 7M15 2l6 3m-6 0 5 3-3 6-3-1ZM16 14l-3 7"/>',
  walking: '<circle cx="14" cy="4" r="2"/><path d="m11 9 3-2 3 5 3 1M5 12l6-3-1 7-4 5m4-5 5 5M11 9l3 5"/>',
  route: '<circle cx="5" cy="5" r="2"/><circle cx="19" cy="19" r="2"/><path d="M7 5h9a4 4 0 0 1 0 8H8a3 3 0 0 0 0 6h9"/>',
  swap: '<path d="M8 3v16m-4-4 4 4 4-4M16 21V5m-4 4 4-4 4 4"/>',
  door: '<path d="M5 21V4l12-2v19M3 21h18M13 12h.01"/>',
  chair: '<path d="M6 14V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M4 14h16v4H4ZM6 18v4m12-4v4"/>',
  desk: '<path d="M3 9h18v4H3ZM5 13v8m14-8v8M8 9V4h8v5"/>',
  sink: '<path d="M3 11h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5ZM12 11V5a3 3 0 0 1 6 0v1M9 19v3m6-3v3"/>',
  bed: '<path d="M3 18V6m18 12v-7a2 2 0 0 0-2-2h-8v9M3 14h18M3 18v3m18-3v3"/><circle cx="7" cy="10" r="2"/>',
  wifi: '<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0M12 20h.01"/>',
  plug: '<path d="M8 2v6m8-6v6M6 8h12v4a6 6 0 0 1-12 0ZM12 18v4"/>',
  stairs: '<path d="M3 20h5v-5h5v-5h5V5h3M3 10l10-8M3 5v5h5"/>',
};
export function indoorIcon(name, size = 20) {
  if (!paths[name]) return sharedIcon(name, size);
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name]}</svg>`;
}
