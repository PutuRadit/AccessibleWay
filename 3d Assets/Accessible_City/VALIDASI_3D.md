# Pemeriksaan model dan integrasi

## Model

- Master Blender berhasil dibuka kembali dengan 12 armature dan 37 root objek
  beranimasi. Rentang frame 0–576 pada 24 fps, sehingga durasi satu siklus 24 detik.
- Posisi root pada awal dan akhir siklus sama; selisih maksimum terukur 0.
- GLB memuat 12 skin dan satu clip `Accessible_Way_City_Loop_24s` berdurasi 24 detik.
- Khronos glTF Validator: **0 error**. Ada 12 warning `NODE_SKINNED_MESH_NON_ROOT`
  karena mesh karakter berada dalam hierarki rig. Gerak dan penempatan karakter
  sudah diperiksa di Three.js. Pertahankan hierarki rig saat mengedit GLB, atau
  gunakan master Blender untuk mengubah karakter.
- File GLB 7.434.884 byte (sekitar 7,4 MB), dengan 180.886 segitiga pada tampilan uji.
- Render GLB memakai 233 draw call dan 12 skinned mesh setelah penggabungan
  material karakter/roda melalui vertex color.

## Website

- `npm run build` berhasil untuk beranda dan `city-preview.html`.
- GLB serta semua rig dimuat di Three.js tanpa error JavaScript.
- Hasil render berubah saat animasi berjalan; hasil pada detik 0 dan 24 sama.
- Putar/jeda, reduced motion, dan penghentian scene tersembunyi diuji.
- Tata letak, aset lokal, dan menu diperiksa pada lebar 320, 390, 768, 1024,
  1280, dan 1440 px. Tidak ada scroll horizontal pada lebar tersebut.
- Kontrol pemutar model pada halaman preview diuji dengan klik dan keyboard.
  Pada Hero terbaru tombol pause dihapus sesuai permintaan.
- Kegagalan pemuatan GLB mempertahankan poster. Tombol mencoba lagi berhasil
  memuat model setelah kegagalan dihilangkan.
- Simulasi WebGL tidak tersedia tetap mempertahankan judul, tombol utama,
  gambar kota, dan navigasi.
- Save Data memakai poster sampai pengguna meminta tampilan 3D; tampilan tetap
  aktif setelah pengguna menggulir keluar dan masuk lagi.

Uji render menggunakan Chromium headless Linux dengan ANGLE/SwiftShader pada
viewport 960 × 720. Ini bukan pengukuran pada laptop atau HP pengguna; perangkat
fisik tersebut belum diuji. Preview PNG dan video dibuat dari GLB yang sama.

## Revisi Hero tanpa bingkai

- Kota memenuhi latar Hero; teks tajam berada di depan lapisan blur bergradasi.
- Kecepatan pemutar website 0,5×, dengan durasi satu siklus sekitar 48 detik.
- Pemeriksaan layout mencakup 1920 × 1080, 1920 × 828, 1440 × 900, 1280 × 800,
  1024 × 768, 768 × 1024, 390 × 844, serta 320 × 800.
- Bingkai/bayangan kartu kota dan tombol pause pada Hero dihapus.
- Poster desktop dirender ulang memakai kamera Hero. Fallback dan tombol untuk
  mencoba pemuatan 3D kembali tetap berfungsi.

## Revisi gradasi dan pembersihan jalan

- Efek kaca membulat diganti gradasi vertikal sepanjang tinggi Hero. Mask linier
  menghaluskan blur 3 px dan menguranginya ke kiri; judul tetap tajam.
- Kamera Hero desktop memakai `halfHeight = 9.3`, sekitar 15% lebih dekat, dengan
  pergeseran `halfWidth * 0.30` agar kota lebih ke kanan.
- Empat lampu, enam semak, tiga pohon, dan satu petak bunga yang masuk ke badan
  jalan dibuang saat membangun model. Master Blender dan GLB sama-sama diperbarui.
  Rincian 14 objek ada pada `road_clearance_report.json`.
- Pemeriksaan geometri master memakai raycast terhadap mesh jalan yang sebenarnya:
  dari 13.863 vertex bagian bawah properti yang diperiksa, tidak ditemukan vertex
  di atas permukaan aspal. Pemeriksaan ini mencakup properti taman dan lampu,
  bukan kendaraan atau karakter yang memang beranimasi.
- Build, delapan ukuran viewport, pemuatan GLB, fallback, tombol coba lagi, dan
  menu mobile lulus pemeriksaan setelah revisi. Siklus website tetap 48 detik.
- Poster, render Hero, dan video pratinjau dirender ulang dari GLB yang sudah
  dibersihkan. Animasi tetap berubah di tengah siklus dan menyambung pada detik 24.
