const paths = {
  search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/>',
  map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Z"/><path d="M9 3v16M15 5v16"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  hospital: '<path d="M5 21V5h14v16M2 21h20M9 21v-5h6v5M9 8h6M12 5v6M8 13h1M15 13h1"/>',
  library: '<path d="M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2Z"/><path d="m6 8 3 1m6 0 3-1"/>',
  public: '<path d="m3 8 9-5 9 5ZM5 10v8m7-8v8m7-8v8M3 21h18M2 18h20"/>',
  gallery: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m3 16 5-5 5 5 3-3 5 5"/><circle cx="16" cy="8" r="1.5"/>',
  park: '<path d="m12 2-5 7h3l-5 7h6v6h2v-6h6l-5-7h3Z"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
  accessibility: '<circle cx="12" cy="4" r="2"/><path d="m5 9 7 1 7-1m-7 1v5m0 0-4 7m4-7 4 7"/>',
  ramp: '<path d="M3 20h18V8ZM3 5h3m4 0h3m4 0h3M5 5v3m7-3v3m7-3v3"/>',
  lift: '<rect x="4" y="2" width="16" height="20" rx="3"/><path d="M12 7v10m-3-7 3-3 3 3m-6 4 3 3 3-3"/>',
  toilet: '<circle cx="9" cy="4" r="2"/><path d="M9 8v7h8l3 6M9 10h6M6 12a6 6 0 1 0 8 8"/>',
  parking: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>',
  sliders: '<path d="M4 7h5m5 0h6M4 17h10m5 0h1"/><circle cx="11.5" cy="7" r="2.5"/><circle cx="16.5" cy="17" r="2.5"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H4m6-6-6 6 6 6"/>',
  chevron: '<path d="m9 5 7 7-7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  x: '<path d="m6 6 12 12M6 18 18 6"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  target: '<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3m0 14v3M2 12h3m14 0h3"/>',
  fit: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/>',
  layers: '<path d="m3 7 9-5 9 5-9 5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
  reset: '<path d="M3 11a9 9 0 1 1 3 8M3 4v7h7"/>',
};

export function icon(name, size = 20) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] ?? paths.pin}</svg>`;
}

// Ilustrasi vektor lokal, bukan foto bangunan nyata.
export function placeIllustration(type) {
  const drawings = {
    hospital: '<path d="M76 171V73h166v98" fill="#fff"/><path d="M62 171h198v12H62zM82 62h154v14H82z" fill="#86b5dc"/><path d="M136 171v-40h46v40" fill="#5186b2"/><path d="M157 131v40" stroke="#cce4f4" stroke-width="3"/><path d="M104 91h20v17h-20zm90 0h20v17h-20z" fill="#b5d9ed"/><rect x="142" y="82" width="34" height="34" rx="9" fill="#e5f1fb"/><path d="M159 89v20m-10-10h20" stroke="#4280b6" stroke-width="6"/><path d="m202 171 40-18 7 8-26 17" fill="#b4cddb"/>',
    library: '<path d="M75 90h169v82H75z" fill="#fff8eb"/><path d="m62 91 97-44 98 44" fill="#d3b89b"/><path d="M84 100h16v72H84zm42 0h15v72h-15zm52 0h15v72h-15zm42 0h15v72h-15z" fill="#e7d3b8"/><path d="M145 172v-36a15 15 0 0 1 30 0v36" fill="#9ab3c1"/><path d="M66 172h187v12H66z" fill="#bfa78d"/>',
    gallery: '<path d="M68 172V93l70-29v108" fill="#fff4f1"/><path d="M138 64h105v108H138z" fill="#e4bdad"/><path d="M152 82h74v57h-74z" fill="#faf1df"/><circle cx="189" cy="110" r="18" fill="#bd8272"/><path d="M79 114h46v58H79z" fill="#9eb9c5"/><path d="M92 114v58m18-58v58" stroke="#fff" stroke-width="3"/><path d="M62 172h190v12H62z" fill="#c5b3a8"/>',
    public: '<path d="M70 86h179v86H70z" fill="#f4fcfa"/><path d="M61 76h197v15H61z" fill="#7facac"/><path d="M84 104h23v36H84zm38 0h23v36h-23zm54 0h23v36h-23zm39 0h20v36h-20z" fill="#b5d9d6"/><path d="M145 172v-48h30v48" fill="#60908e"/><path d="M61 172h197v12H61z" fill="#96b6b0"/><path d="M161 76V37m0 2h35v22h-35" stroke="#658c92" stroke-width="3" fill="#aacad2"/>',
    park: '<path d="M100 183c25-19 32-40 64-40s28 21 56 40" fill="#e9dfc3"/><path d="M83 163V82m151 81V89" stroke="#947d60" stroke-width="9"/><circle cx="82" cy="83" r="37" fill="#93baa0"/><circle cx="62" cy="110" r="30" fill="#81ab91"/><circle cx="103" cy="109" r="32" fill="#a6c5a8"/><circle cx="233" cy="89" r="33" fill="#9ebe9d"/><circle cx="216" cy="113" r="28" fill="#88ae93"/><path d="M126 135h62v11h-62zm-2 19h67v8h-67z" fill="#bf9d70"/><path d="M133 162v16m49-16v16" stroke="#7e8780" stroke-width="5"/>',
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="216" viewBox="0 0 320 216" aria-hidden="true"><rect width="320" height="216" fill="${({ hospital: "#e6f0f9", library: "#f2eee5", gallery: "#f5e9e6", public: "#e4f0ee", park: "#eaf0e5" })[type]}"/><circle cx="250" cy="43" r="21" fill="#fff" opacity=".65"/><path d="M22 183 152 143l149 40-131 29Z" fill="#c2d0cb" opacity=".35"/>${drawings[type] ?? drawings.hospital}<path d="M41 174v-20m-8 9 8-12 8 12" stroke="#78a593" stroke-width="4" stroke-linecap="round" fill="none"/></svg>`;
}
