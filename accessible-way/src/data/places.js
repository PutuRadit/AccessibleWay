// Nama, titik, alamat, fasilitas, dan jumlah lantai berikut adalah DATA CONTOH.
// Koordinat hanya untuk demonstrasi pada peta dasar nyata. Bukan direktori
// tempat nyata dan bukan hasil audit aksesibilitas. Jangan hapus penanda demo
// sebelum menggantinya dengan data lokasi yang telah diperiksa.
export const placeCategories = [
  { id: "all", label: "Semua", icon: "grid" },
  { id: "hospital", label: "Rumah sakit", icon: "hospital" },
  { id: "library", label: "Perpustakaan", icon: "library" },
  { id: "public", label: "Ruang publik", icon: "public" },
];

export const facilityOptions = [
  { id: "stepFree", label: "Akses tanpa tangga", icon: "accessibility" },
  { id: "ramp", label: "Ramp", icon: "ramp" },
  { id: "lift", label: "Lift", icon: "lift" },
  { id: "toilet", label: "Toilet aksesibel", icon: "toilet" },
  { id: "parking", label: "Parkir prioritas", icon: "parking" },
];

export const places = [
  {
    id: "rs-harmoni", name: "Rumah Sakit Harmoni", category: "hospital",
    type: "Rumah sakit", icon: "hospital", visual: "hospital",
    photo: { src: "assets/images/places/hospital.jpg", alt: "Foto contoh gedung rumah sakit dengan bangunan putih dan pepohonan", author: "Tom Fisk", source: "https://www.pexels.com/photo/white-hospital-building-1770818/" },
    coordinates: [-6.1778, 106.8154], area: "Area contoh A · Jakarta Pusat",
    description: "Contoh rumah sakit dengan informasi akses masuk, fasilitas pendukung mobilitas, dan denah interaktif tiga lantai.",
    facilities: ["stepFree", "ramp", "lift", "toilet", "parking"], floors: 3,
    entrance: "Contoh akses masuk melalui ramp di sisi depan gedung.",
    indoorAvailable: true,
  },
  {
    id: "perpustakaan-cendekia", name: "Perpustakaan Cendekia", category: "library",
    type: "Perpustakaan", icon: "library", visual: "library",
    photo: { src: "assets/images/places/library.jpg", alt: "Foto contoh interior perpustakaan dengan deretan rak buku", author: "Julio Lopez", source: "https://www.pexels.com/photo/modern-library-interior-with-vast-book-stacks-29492067/" },
    coordinates: [-6.1845, 106.8278], area: "Area contoh B · Jakarta Pusat",
    description: "Contoh ruang belajar bersama dengan area baca yang lapang dan fasilitas pendukung untuk beragam kebutuhan mobilitas.",
    facilities: ["stepFree", "lift", "toilet"], floors: 2,
    entrance: "Contoh pintu masuk sejajar dengan area pejalan kaki.",
    indoorAvailable: true,
  },
  {
    id: "galeri-nusantara", name: "Galeri Nusantara", category: "public",
    type: "Galeri & budaya", icon: "gallery", visual: "gallery",
    photo: { src: "assets/images/places/gallery.jpg", alt: "Foto contoh ruang galeri dengan karya seni di dinding", author: "Andrea De Santis", source: "https://www.pexels.com/photo/interior-design-of-a-museum-14012263/" },
    coordinates: [-6.1749, 106.8316], area: "Area contoh C · Jakarta Pusat",
    description: "Contoh galeri dengan jalur kunjungan yang terhubung dan area istirahat untuk menikmati pameran dengan nyaman.",
    facilities: ["stepFree", "ramp", "toilet"], floors: 1,
    entrance: "Contoh akses ramp menuju lobi dan ruang pamer utama.",
    indoorAvailable: true,
  },
  {
    id: "layanan-warga", name: "Pusat Layanan Warga", category: "public",
    type: "Layanan publik", icon: "public", visual: "public",
    photo: { src: "assets/images/places/public.jpg", alt: "Foto contoh bangunan pemerintahan dengan halaman hijau", author: "Pham Huynh Tuan Vy", source: "https://www.pexels.com/photo/sunny-day-at-vietnamese-government-building-32843673/" },
    coordinates: [-6.1902, 106.8196], area: "Area contoh D · Jakarta Pusat",
    description: "Contoh gedung layanan masyarakat dengan informasi fasilitas aksesibilitas dan akses ke area pelayanan.",
    facilities: ["stepFree", "ramp", "lift", "parking"], floors: 2,
    entrance: "Contoh ramp pada pintu masuk utama dekat area parkir prioritas.",
    indoorAvailable: true,
  },
];
