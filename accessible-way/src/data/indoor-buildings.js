// Denah, isi ruang, dan ukuran berikut adalah simulasi untuk prototipe.
// Koordinat SVG adalah titik referensi pintu/ruangan, bukan data survei gedung.
const featureLabels = {
  wideDoor: ["Pintu lebar", "door"], turning: ["Ruang putar kursi roda", "accessibility"],
  seating: ["Kursi duduk", "chair"], desk: ["Meja kerja / layanan", "desk"],
  lowCounter: ["Meja layanan rendah", "desk"], sink: ["Wastafel", "sink"],
  handrail: ["Pegangan penyangga", "accessibility"], bed: ["Tempat tidur / pemeriksaan", "bed"],
  books: ["Rak buku", "library"], wifi: ["Wi-Fi", "wifi"], outlets: ["Stopkontak", "plug"],
  display: ["Area pajangan", "gallery"], lockers: ["Loker penyimpanan", "grid"],
  accessibleWC: ["Toilet aksesibel", "toilet"], lowSink: ["Wastafel rendah", "sink"],
  lift: ["Lift antarlantai", "lift"], lowButtons: ["Panel tombol rendah", "lift"],
  automaticDoor: ["Pintu otomatis", "door"], steps: ["Anak tangga", "stairs"],
  floorSigns: ["Penanda lantai", "layers"], ramp: ["Ramp pintu masuk", "ramp"],
  information: ["Papan informasi", "info"], medicine: ["Loket obat", "hospital"],
};
const packs = {
  service: ["wideDoor", "lowCounter", "seating", "information"],
  consult: ["wideDoor", "turning", "desk", "sink"],
  care: ["wideDoor", "bed", "sink", "seating"],
  lounge: ["wideDoor", "turning", "seating", "information"],
  library: ["wideDoor", "books", "seating", "desk"],
  study: ["wideDoor", "desk", "wifi", "outlets"],
  office: ["wideDoor", "desk", "seating", "information"],
  gallery: ["wideDoor", "display", "seating", "information"],
  storage: ["wideDoor", "lockers", "desk"],
};
const typeLabels = { service: "Layanan", consult: "Konsultasi", care: "Perawatan", lounge: "Area bersama", library: "Koleksi buku", study: "Ruang belajar", office: "Administrasi", gallery: "Pameran", storage: "Penyimpanan", lift: "Penghubung lantai", stairs: "Penghubung lantai", toilet: "Fasilitas" };
const typeIcons = { service: "desk", consult: "hospital", care: "bed", lounge: "chair", library: "library", study: "desk", office: "public", gallery: "gallery", storage: "grid", lift: "lift", stairs: "stairs", toilet: "toilet" };
const features = ids => ids.map(id => ({ id, label: featureLabels[id][0], icon: featureLabels[id][1] }));
const room = (id, name, kind, extras) => ({ id, name, kind, features: extras ?? packs[kind], accessible: true });

const definitions = {
  "rs-harmoni": {
    title: "Rumah Sakit Harmoni", shortName: "RS Harmoni",
    floors: [
      { name: "Pelayanan utama", rooms: [room("pendaftaran", "Pendaftaran", "service"), room("poli-umum", "Poli Umum", "consult"), room("apotek", "Apotek", "service", ["wideDoor", "medicine", "seating", "lowCounter"]), room("laboratorium", "Laboratorium", "care"), room("ruang-tunggu", "Ruang Tunggu", "lounge"), room("lobi", "Lobi Utama", "lounge", ["ramp", "wideDoor", "seating", "information"]), room("radiologi", "Radiologi", "care")] },
      { name: "Poliklinik & konsultasi", rooms: [room("poli-anak", "Poli Anak", "consult"), room("poli-gigi", "Poli Gigi", "consult"), room("poli-dalam", "Poli Penyakit Dalam", "consult"), room("konsultasi", "Ruang Konsultasi", "consult"), room("tindakan", "Ruang Tindakan", "care"), room("ruang-tunggu", "Area Tunggu", "lounge"), room("perawat", "Ruang Perawat", "office")] },
      { name: "Rawat inap", rooms: [room("rawat-301", "Rawat Inap 301", "care"), room("rawat-302", "Rawat Inap 302", "care"), room("rawat-303", "Rawat Inap 303", "care"), room("rawat-304", "Rawat Inap 304", "care"), room("perawat", "Pos Perawat", "office"), room("keluarga", "Ruang Keluarga", "lounge"), room("konseling", "Ruang Konseling", "consult")] },
    ],
  },
  "perpustakaan-cendekia": {
    title: "Perpustakaan Cendekia", shortName: "Perpustakaan",
    floors: [
      { name: "Koleksi & layanan", rooms: [room("keanggotaan", "Keanggotaan", "service"), room("koleksi-umum", "Koleksi Umum", "library"), room("koleksi-anak", "Koleksi Anak", "library"), room("baca", "Ruang Baca", "library"), room("loker", "Area Loker", "storage"), room("lobi", "Lobi Utama", "lounge", ["wideDoor", "ramp", "information", "seating"]), room("peminjaman", "Peminjaman Buku", "service")] },
      { name: "Belajar & referensi", rooms: [room("referensi", "Koleksi Referensi", "library"), room("diskusi-a", "Ruang Diskusi A", "study"), room("diskusi-b", "Ruang Diskusi B", "study"), room("digital", "Ruang Digital", "study"), room("arsip", "Arsip & Jurnal", "library"), room("belajar", "Belajar Mandiri", "study"), room("pengelola", "Ruang Pengelola", "office")] },
    ],
  },
  "galeri-nusantara": {
    title: "Galeri Nusantara", shortName: "Galeri Nusantara",
    floors: [{ name: "Pameran & budaya", rooms: [room("pameran-a", "Galeri Pameran A", "gallery"), room("pameran-b", "Galeri Pameran B", "gallery"), room("multimedia", "Ruang Multimedia", "gallery", ["wideDoor", "seating", "display", "outlets"]), room("lokakarya", "Ruang Lokakarya", "study"), room("tiket", "Loket Tiket", "service"), room("lobi", "Lobi Utama", "lounge", ["wideDoor", "ramp", "information", "seating"]), room("koleksi", "Ruang Koleksi", "gallery")] }],
  },
  "layanan-warga": {
    title: "Pusat Layanan Warga", shortName: "Layanan Warga",
    floors: [
      { name: "Pelayanan administrasi", rooms: [room("kependudukan", "Kependudukan", "service"), room("perizinan", "Layanan Perizinan", "service"), room("pembayaran", "Loket Pembayaran", "service"), room("informasi", "Pusat Informasi", "service"), room("tunggu", "Ruang Tunggu", "lounge"), room("lobi", "Lobi Utama", "lounge", ["ramp", "wideDoor", "information", "seating"]), room("pengaduan", "Layanan Pengaduan", "office")] },
      { name: "Konsultasi & pertemuan", rooms: [room("konsultasi-a", "Konsultasi A", "office"), room("konsultasi-b", "Konsultasi B", "office"), room("rapat", "Ruang Pertemuan", "study"), room("administrasi", "Ruang Administrasi", "office"), room("arsip", "Ruang Arsip", "storage"), room("tunggu", "Area Tunggu", "lounge"), room("petugas", "Ruang Petugas", "office")] },
    ],
  },
};

export const INDOOR_VIEW = Object.freeze({ width: 1120, height: 780, metersPerUnit: .08, corridorY: 380 });
const slots = [
  { x: 120, y: 140, w: 180, h: 170, bank: "top" },
  { x: 320, y: 140, w: 180, h: 170, bank: "top" },
  { x: 520, y: 140, w: 180, h: 170, bank: "top" },
  { x: 720, y: 140, w: 180, h: 170, bank: "top" },
  { x: 320, y: 450, w: 180, h: 170, bank: "bottom" },
  { x: 520, y: 450, w: 180, h: 170, bank: "bottom" },
  { x: 720, y: 450, w: 180, h: 170, bank: "bottom" },
];

function makeBuilding(id, definition) {
  const nodes = {}, edges = [], allRooms = [];
  const addNode = node => { nodes[node.id] = node; return node.id; };
  const addEdge = (from, to, kind = "corridor", accessible = true, distance) => {
    const a = nodes[from], b = nodes[to];
    edges.push({ from, to, kind, accessible, distance: distance ?? Math.hypot(a.x - b.x, a.y - b.y) * INDOOR_VIEW.metersPerUnit });
  };
  const floors = definition.floors.map((definitionFloor, index) => {
    const number = index + 1;
    const hallXs = [210, 410, 610, 810, 960];
    hallXs.forEach(x => addNode({ id: `f${number}-hall-${x}`, floor: number, x, y: 380, kind: "corridor" }));
    hallXs.slice(1).forEach((x, i) => addEdge(`f${number}-hall-${hallXs[i]}`, `f${number}-hall-${x}`));
    const floorRooms = definitionFloor.rooms.map((item, i) => ({ ...item, rect: slots[i], code: `${number}${String(i + 1).padStart(2, "0")}` }));
    const hasLevels = definition.floors.length > 1;
    floorRooms.push(
      { id: hasLevels ? "lift" : "info", name: hasLevels ? "Lift" : "Informasi", kind: hasLevels ? "lift" : "service", features: hasLevels ? ["lift", "lowButtons", "automaticDoor", "handrail"] : ["lowCounter", "information", "wideDoor"], accessible: true, code: hasLevels ? "LF" : "INF", rect: { x: 920, y: 140, w: 80, h: 170, bank: "top" } },
      { id: hasLevels ? "stairs" : "lounge", name: hasLevels ? "Tangga" : "Area Istirahat", kind: hasLevels ? "stairs" : "lounge", features: hasLevels ? ["steps", "handrail", "floorSigns"] : ["seating", "turning", "wideDoor"], accessible: !hasLevels, code: hasLevels ? "ST" : "RST", rect: { x: 120, y: 450, w: 180, h: 170, bank: "bottom" } },
      { id: "toilet", name: "Toilet Aksesibel", kind: "toilet", features: ["accessibleWC", "handrail", "lowSink", "turning"], accessible: true, code: "WC", rect: { x: 920, y: 450, w: 80, h: 170, bank: "bottom" } },
    );
    const rooms = floorRooms.map(item => {
      const roomId = `f${number}-${item.id}`;
      const x = item.rect.x + item.rect.w / 2;
      const doorY = item.rect.bank === "top" ? 310 : 450;
      const y = item.rect.bank === "top" ? 282 : 478;
      const nodeId = addNode({ id: `${roomId}-point`, floor: number, x, y, kind: "room", roomId });
      const doorId = addNode({ id: `${roomId}-door`, floor: number, x, y: doorY, kind: "door", roomId });
      addEdge(nodeId, doorId, "door", item.accessible);
      addEdge(doorId, `f${number}-hall-${x}`, "connector", item.accessible);
      const result = { ...item, id: roomId, localId: item.id, floor: number, floorLabel: `${number}F`, nodeId, anchor: [x, y], door: [x, doorY], facilities: features(item.features), type: typeLabels[item.kind], icon: typeIcons[item.kind], description: item.kind === "stairs" ? "Penghubung antarlantai dengan anak tangga. Pilih lift untuk akses tanpa tangga." : item.kind === "lift" ? "Penghubung lantai untuk perjalanan tanpa tangga. Rute berganti lantai melalui titik lift ini." : "Ruangan terhubung ke koridor utama. Pilih sebagai titik awal atau tujuan, lalu lihat fasilitas contoh yang tersedia." };
      allRooms.push(result);
      return result;
    });
    return { number, label: `${number}F`, name: definitionFloor.name, rooms };
  });
  for (let floor = 1; floor < floors.length; floor++) {
    addEdge(`f${floor}-lift-point`, `f${floor + 1}-lift-point`, "lift", true, 4);
    addEdge(`f${floor}-stairs-point`, `f${floor + 1}-stairs-point`, "stairs", false, 7);
  }
  return { id, ...definition, floors, rooms: allRooms, defaultStart: "f1-lobi", graph: { nodes, edges } };
}

export const indoorBuildings = Object.fromEntries(Object.entries(definitions).map(([id, definition]) => [id, makeBuilding(id, definition)]));
export function getIndoorBuilding(id) { return Object.hasOwn(indoorBuildings,id) ? indoorBuildings[id] : null; }
