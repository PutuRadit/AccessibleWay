// Peta dasar nyata; lokasi dan fasilitas pada dataset awal adalah simulasi.
// Ganti penyedia di sini bila tema atau kebutuhan pemakaian peta berubah.
export const mapConfig = Object.freeze({
  tileUrl: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
  center: [-6.178, 106.824],
  initialZoom: 14,
  minZoom: 3,
  maxZoom: 19,
  areaLabel: "Jakarta Pusat",
});
