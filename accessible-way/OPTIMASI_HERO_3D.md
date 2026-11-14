# Accessible Way — Hero 3D lebih ringan

> Catatan versi lama: Hero sekarang memakai video HD. Ikuti
> `HERO_VIDEO_HD.md` untuk pemasangan dan pengaturan Hero saat ini.
> Penjelasan di bawah disimpan sebagai dokumentasi optimasi renderer 3D.

Hero tetap memakai Three.js dan animasi GLB secara langsung. Optimasi berfokus
pada pekerjaan renderer, resolusi gambar, dan penjadwalan frame.

## Yang diubah

- Model khusus Hero dibuat sebelum dipasang ke web. Sebanyak 138 mesh statis
  digabung menjadi 19 kelompok material; jumlah mesh yang dirender turun
  dari 233 menjadi 114. Semua 180.886 segitiga tetap tersedia.
- Karakter, kendaraan, target animasi, kaca transparan, dan bagian yang tidak
  aman digabung tetap dipertahankan terpisah. Transformasi 101 target animasi
  diperiksa pada beberapa waktu sepanjang animasi 24 detik.
- Browser memuat model yang sudah disiapkan, sehingga penggabungan geometri
  tidak perlu dilakukan ketika pengunjung membuka halaman.
- Transformasi lokal yang tidak ditulis animasi dibekukan agar tidak dihitung
  ulang setiap frame. Target yang bergerak tetap diperbarui.
- Antialiasing MSAA pada Hero dinonaktifkan. DPR dibatasi maksimum 1, dengan
  target sekitar satu juta piksel render pada desktop dan 650 ribu pada
  profil ringkas. Kamera tetap mengikuti ukuran CSS, bukan resolusi buffer.
- Resolusi dapat diturunkan lagi jika rata-rata interval frame terlalu lama.
  Penyesuaian ini tidak menaik-turunkan zoom atau mengganti model.
- Penjadwalan frame menyimpan sisa interval sehingga batas 30 FPS desktop /
  24 FPS profil ringkas tidak kehilangan waktu setiap siklus.
- Frame ditahan selama scroll aktif dan dilanjutkan setelah jeda 140 ms.
  Di luar viewport atau tab tersembunyi, Hero tidak menggambar frame.
- Posisi kamera, perhitungan framing, pencahayaan, dan kecepatan animasi 0,5×
  mengikuti pengaturan sebelumnya. Bayangan statis tetap di-cache.

Model baru sekitar 7,8 MB, sedangkan model asal sekitar 7,4 MB. Nama
"optimized" merujuk pada jumlah pekerjaan render yang lebih kecil, bukan
kompresi unduhan. Ini tidak mengurangi jumlah segitiga atau mengubah bentuk
desain untuk mengecilkan berkas.

## Memasang pada proyek yang sudah ada

1. Hentikan Vite lalu ekstrak ZIP ke folder sementara.
2. Dari `WebDev/accessible-way/`, salin ke lokasi yang sama:

   - `src/components/hero.js`
   - `src/scenes/city-scene.js`
   - `src/scenes/city-optimization.js`
   - `public/assets/models/accessible-city-hero-optimized.glb`

3. Jalankan `npm.cmd run dev`, lalu tekan Ctrl+F5.
4. Cek animasi di Hero, scroll ke bawah, lalu kembali ke Hero. Model dan
   canvas dipakai kembali tanpa mengunduh ulang atau mengganti kamera.

Penghapusan latar Login/Register yang diminta sebelumnya juga disertakan
di `src/pages/auth.js`. Jika perubahan itu sudah dilakukan secara manual,
cukup memasang empat berkas Hero di atas.

Tidak ada dependensi baru. File How It Works, model asal, dan master Blender
tidak perlu disalin ulang.

## Menyesuaikan kualitas

Pilihan `mountCityScene()` di `src/components/hero.js` dapat ditambah sesuai
kebutuhan perangkat, misalnya:

```js
optimize: true,
modelUrl: `${assetBase}/models/accessible-city-hero-optimized.glb`,
maxPixelRatio: 1,
pixelBudget: 1000000,
targetFps: 30,
adaptiveQuality: true,
pauseWhileScrolling: true,
```

Tanpa nilai tambahan, fungsi memilih 24 FPS pada profil ringkas dan 30 FPS
pada desktop. `pixelBudget` mengatur beban resolusi; mengubahnya tidak mengatur
zoom. Kamera dan framing tetap berada di `src/scenes/city-scene.js`.

## Menyiapkan ulang model

Jika model asal diubah, jalankan dari folder `accessible-way`:

```bash
node tools/optimize-hero-model.mjs
```

Alat tersebut menulis ulang model khusus Hero setelah memeriksa jumlah
segitiga, batas kota, durasi animasi, dan transformasi target animasi.
Model asal `accessible-city-animated.glb` tetap menjadi sumber. Skrip ini
dijalankan saat menyiapkan aset; tidak dijalankan oleh browser.

## Pemeriksaan

Pemeriksaan mencakup pelestarian geometri dan animasi, perbandingan render
dengan kamera sama, loop animasi, jeda di luar viewport/tab, jeda scroll,
penyesuaian resolusi, pemakaian ulang canvas, serta fallback WebGL.
Pengukuran pada Chromium tanpa GPU fisik merupakan pembanding lokal;
kelancaran pada perangkat pengunjung bergantung pada perangkat dan browser.

Referensi:

- https://threejs.org/manual/pages/optimize-lots-of-objects.html
- https://threejs.org/manual/pages/responsive.html
