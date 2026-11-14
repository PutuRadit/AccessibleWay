# Accessible Way — About Us

About Us memakai informasi proyek dan nama tim yang diberikan, dengan tema
biru–putih yang mengikuti landing page. Isi dibagi menjadi tiga kelompok visual:

1. **Pengenalan, latar belakang, dan misi.** Kartu utama menampilkan penjelasan
   Accessible Way, fokus rumah sakit tiga lantai, foto ilustrasi kolaborasi
   inklusif, serta dua kartu latar belakang dan misi.
2. **Apa yang ditawarkan.** Empat kartu berisi informasi lokasi, fasilitas
   aksesibilitas, denah digital, dan panduan rute indoor melalui lift/ramp.
3. **Tim pengembang.** Kartu nama Anisa Dwi Ramahdani, Putu Radit Ardika, dan
   M Farel Raditya Wicaksono dengan foto bulat serta tagline proyek.

Foto hanya menjadi ilustrasi kolaborasi, bukan foto anggota tim. Deskripsi
proyek berfokus pada indoor navigation; tidak mencantumkan kemitraan atau
layanan tambahan yang belum dinyatakan oleh tim.

## Memasang pembaruan pada proyek yang sudah ada

1. Hentikan Vite dengan Ctrl+C.
2. Ekstrak ZIP ke folder sementara. Dari `WebDev/accessible-way/`, salin
   file berikut ke lokasi yang sama pada proyekmu:

   - `src/components/about.js`
   - `src/styles/about.css`
   - `src/motion/landing-motion.js`
   - `public/assets/images/about-inclusive-collaboration.webp`
   - Folder `public/assets/images/team/` beserta ketiga foto di dalamnya

3. Jika belum memasang About Us versi sebelumnya, salin juga `src/main.js`,
   `src/pages/landing.js`, dan `public/assets/icons/about-collaboration.svg`.
4. Jalankan `npm.cmd run dev`, lalu tekan Ctrl+F5 di browser.
5. Klik About Us, lalu scroll untuk melihat kartu fitur dan anggota tim.

Tidak ada dependensi baru. File kamera, How It Works, dan model 3D tidak perlu
disalin ulang; pengaturan kamera pribadi dapat tetap digunakan.

## Mengubah isi dan tampilan

| Bagian | Lokasi |
| --- | --- |
| Judul, paragraf, latar belakang, dan misi | `src/components/about.js` |
| Isi empat kartu fitur | Array `features` di komponen yang sama |
| Nama, foto, dan inisial cadangan anggota | Array `members` di komponen yang sama |
| Foto anggota tim | `public/assets/images/team/` |
| Pembingkaian wajah | Aturan `.about__avatar--anisa`, `--putu`, dan `--farel` di `src/styles/about.css` |
| Foto | `public/assets/images/about-inclusive-collaboration.webp` |
| Warna, jarak, ukuran, responsivitas, hover | `src/styles/about.css` |
| Animasi masuk | Entri `.about__…` di `src/motion/landing-motion.js` |

Foto disimpan lokal dalam format WebP 1200 × 800, sekitar 70 KB. Saat hover,
foto membesar 3,5%, frame naik 4 piksel, dan bayangan melembut. Di ponsel
konten ditumpuk, sedangkan kartu fitur dan anggota tetap mudah dibaca.
Animasi mengikuti preferensi reduced motion dari perangkat.

## Foto anggota dan efek hover

Pemasangan foto mengikuti koreksi tim:

| Anggota | Foto | File |
| --- | --- | --- |
| Anisa Dwi Ramahdani | Berjilbab | `public/assets/images/team/anisa.webp` |
| Putu Radit Ardika | Berbaju hitam | `public/assets/images/team/putu.webp` |
| M Farel Raditya Wicaksono | Berkacamata | `public/assets/images/team/farel.webp` |

Foto diubah menjadi WebP ringan dengan rasio aslinya. Tampilan bulat dan
posisi wajah diatur melalui CSS. Ukuran foto 56 piksel pada desktop dan
48 piksel pada layar yang lebih kecil.

Saat kursor menyentuh kartu, kartu terangkat 8 piksel dengan bayangan yang
lebih tebal dan foto membesar sedikit. Efek kembali halus saat kursor keluar.
Gerakan hover tidak diterapkan pada perangkat sentuh atau saat reduced
motion aktif. Animasi masuk saat scroll tetap menggunakan sistem sebelumnya.

Jika sudah memasang About Us versi sebelumnya, cukup salin ulang
`src/components/about.js`, `src/styles/about.css`, dan folder foto `team/`.

## Sumber foto

- Foto: **People Sitting at the Table**, Ivan S, Pexels.
- Halaman asli: https://www.pexels.com/photo/people-sitting-at-the-table-8127703/
- Lisensi: https://www.pexels.com/license/ (diakses 14 November 2026).
- Versi lokal hanya diubah ukuran dan formatnya; kredit serta label foto
  ilustrasi ditampilkan di bawah gambar.
