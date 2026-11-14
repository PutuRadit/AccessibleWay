# Accessible Way — Tahap 1: Navbar dan Hero

> Pembaruan: paket kota 3D melanjutkan tahap ini. Untuk Hero terbaru yang memakai
> GLB animasi, baca `HERO_3D.md`. Catatan di bawah menjelaskan versi tahap pertama.
> How It Works sudah dilanjutkan pada tahap 2; baca `HOW_IT_WORKS.md`.

Implementasi ini mengikuti frame desktop berukuran 1280 px dari file Figma yang
dikirim. Desain di bawah Navbar/Hero serta halaman login/register dikerjakan pada
tahap berikutnya. README utama, model Blender, GLB, dan gambar desain tetap utuh.

## 1. Pasang hasil ke folder proyek

Ekstrak paket ke folder sementara terlebih dahulu. Salin isi folder
`WebDev/accessible-way/` ke folder `accessible-way` milikmu. Periksa perubahan
sebelum menimpa file apabila kamu sudah mengeditnya setelah mengirim ZIP.
Paket hasil tidak menyertakan `.git`, `node_modules`, atau `dist`.

## 2. Jalankan Vite

Buka terminal di folder yang berisi `package.json`, bukan di folder WebDev paling
luar. Contoh pada komputer kamu:

```powershell
cd D:\Kuliah\WebDev\accessible-way
npm ci
npm run dev
```

Buka alamat yang ditampilkan Vite di terminal. `npm ci` memasang versi dependensi
yang tercatat dalam `package-lock.json`; jalankan ulang jika dependensi berubah
atau `node_modules` belum ada. Selanjutnya cukup gunakan `npm run dev`.

Untuk memeriksa build:

```powershell
npm run build
npm run preview
```

Gunakan versi Node yang memenuhi syarat Vite pada `package-lock.json`. Buka
halaman lewat Vite; modul JavaScript tidak dijalankan dengan klik dua kali HTML.

## 3. Pahami file yang digunakan

| File/folder | Tanggung jawab |
| --- | --- |
| `index.html` | Dokumen HTML, metadata, tautan lompat ke konten |
| `src/main.js` | Memuat CSS, merender halaman, memasang interaksi |
| `src/pages/landing.js` | Menyusun Navbar dan Hero menjadi halaman |
| `src/components/navbar.js` | HTML Navbar dan perilaku menu mobile |
| `src/components/hero.js` | HTML Hero dan animasi masuk GSAP |
| `src/styles/global.css` | Font lokal, warna Figma, reset, aturan umum |
| `src/styles/landing.css` | Layout, ukuran, tombol, breakpoint responsif |
| `src/assets/fonts/` | Inter, Plus Jakarta Sans, dan lisensi OFL |
| `public/assets/images/` | Gambar Hero asli dari Figma |
| `public/assets/icons/` | Ikon SVG asli dari Figma |

Urutan membacanya: `main.js` → `landing.js` → `navbar.js`/`hero.js` → CSS.
Komponen di sini adalah fungsi JavaScript yang menghasilkan HTML. Struktur
folder repository lama tetap dipakai; implementasi menggunakan HTML/CSS/JS biasa.

## 4. Cocokkan dengan Figma

Bandingkan pada lebar viewport 1280 px dan zoom browser 100%:

- Navbar setinggi 80 px; jarak tepi 32 px.
- Judul memakai Plus Jakarta Sans Bold 40/48 px; isi memakai Inter 18/28 px.
- Warna latar `#f8f9ff`, warna judul `#003769`, tombol utama `#164e8a`.
- Dua kolom Hero masing-masing 584 px, dengan jarak 48 px.
- Gambar memakai crop asli Figma, bingkai putih, radius, bayangan, dan glow.
- Pada layar kecil, kolom bertumpuk dan navigasi berubah menjadi menu mobile.

Figma yang dikirim hanya menyediakan desain desktop. Penyesuaian mobile dibuat
agar teks, tombol, dan gambar tetap terbaca tanpa scroll horizontal.

Uji menu mobile dengan klik, Tab, Escape, dan klik di luar menu. Animasi GSAP
berhenti jika perangkat menggunakan preferensi **Reduce motion**. Font dan gambar
dimuat dari file lokal sehingga tidak memerlukan URL aset Figma saat dibuka.

## 5. Batas tahap ini dan langkah berikutnya

Tahap ini menyelesaikan tampilan **Navbar + Hero**, menu mobile, dan animasi masuk.
Home dan logo berfungsi. Tujuan berikut sudah disiapkan, tetapi halaman/bagiannya
belum dirender sehingga belum berfungsi pada tahap ini:

| Tautan | Tujuan yang akan dibuat |
| --- | --- |
| How It Works / Learn How It Works | `#cara-kerja` |
| About Us | `#tentang-kami` |
| Contact | `#kontak` |
| Sign In | `login` |
| Register | `register` |
| Find Your Way | `explore` (aplikasi utama) |

Urutan lanjutan:

1. How It Works: layout, indikator langkah, serta tombol Previous/Next.
2. Three.js: muat GLB yang sudah ada dan hubungkan perpindahan kamera dengan
   langkah cerita melalui GSAP. Model belum perlu dimuat pada tahap Navbar/Hero.
3. About, Contact, dan Footer sesuai Figma.
4. Tampilan Login/Register, validasi form, lalu integrasi autentikasi sesuai
   kebutuhan aplikasi. Desain form saja belum menjadi sistem autentikasi.

Paket `three` sudah dipasang untuk tahap 3D, namun belum diimpor atau dimuat oleh
halaman ini. Ruang 3D pada desain How It Works dan gambar About terlihat kosong
pada Figma; aset tersebut perlu ditentukan saat mengerjakan bagiannya.

Teks pemasaran dipertahankan mengikuti Figma. Ruang lingkup aplikasi utama tetap
**Indoor Navigation**; tidak ada implementasi navigasi outdoor pada tahap ini.

## Pemeriksaan yang sudah dijalankan

- `npm run build` berhasil.
- Hasil build dibuka di Chromium: tidak ada error JavaScript.
- Semua lima font dan lima gambar/ikon berhasil dimuat dari file lokal.
- Lebar 320, 390, 768, 979, 980, 1024, 1280, dan 1440 px tidak menimbulkan
  scroll horizontal.
- Menu mobile diuji untuk buka/tutup, urutan Tab, Escape, pengembalian fokus,
  klik di luar menu, dan perpindahan ke lebar desktop.
- Animasi GSAP serta perubahan preferensi reduced motion diuji.
- Pada viewport 1280 px, hasil pengukuran sesuai Figma: Navbar 80 px,
  badge di (32, 220), dan bingkai gambar di (664, 189) berukuran 584 × 442 px.

## Referensi

- Desain: https://www.figma.com/design/DxDcFrkQeM7iDrCZZLq1yR/Untitled?node-id=1-2
- Vite: https://vite.dev/guide/
- GSAP dan reduced motion: https://gsap.com/docs/v3/GSAP/gsap.matchMedia/
- Font: Google Fonts — Inter dan Plus Jakarta Sans; lisensi ada di folder font.
