# Accessible Way — Hero video HD

Hero memakai video dari model kota yang sama. Model tidak dirender oleh
Three.js di Hero, sehingga pengunjung cukup memutar video. Animasi masuk
saat scroll tetap ditangani oleh GSAP pada pembungkus Hero.

## Aset

| Layar | Video | Ukuran |
| --- | --- | --- |
| Desktop, mulai 980 px | `public/assets/videos/hero-city-desktop-hd.mp4` | 2560 × 1080 |
| Ponsel/tablet, di bawah 980 px | `public/assets/videos/hero-city-mobile-hd.mp4` | 1440 × 1080, komposisi 4:3 |

Keduanya H.264, 30 FPS, tanpa suara, dengan loop 48 detik. Gerakan mengikuti
clip 24 detik pada kecepatan 0,5×. Render memakai antialiasing dan tidak
membesarkan video lama yang hanya 960 × 720.

Poster WebP dengan nama yang sama berada di `public/assets/images/`. Poster
dirender dari kamera dan frame awal yang sama agar pergantian gambar ke video
tidak mengubah ukuran kota. Video MP4 memakai fast-start agar metadata berada
di awal berkas.

## Memasang pembaruan

Untuk pembaruan penghapusan tombol Hero pada proyek yang sudah memakai video
HD, cukup salin `src/components/hero.js` dan `src/styles/landing.css`. Ini
memungkinkan pengaturan Story Scene yang sudah Anda sesuaikan tetap dipakai
pada proyek Anda. Video dan poster HD yang sudah ada tidak perlu disalin ulang.

Ekstrak ZIP ke folder sementara. Dari `WebDev/accessible-way/`, salin:

1. `src/components/hero.js`
2. `src/styles/landing.css`
3. Kedua MP4 di `public/assets/videos/`
4. Kedua WebP `hero-city-*-hd.webp` di `public/assets/images/`

Kemudian jalankan `npm.cmd run dev` dan muat ulang dengan Ctrl+F5.
Untuk pemasangan pertama, jalankan `npm.cmd ci` terlebih dahulu. Pemeriksaan
build menggunakan `npm.cmd run build` lalu `npm.cmd run preview`.

## Ukuran dan posisi

Atur di `src/styles/landing.css`:

- `.hero__grid`: tinggi Hero desktop.
- `.hero-visual`: area video; aturan di media query mengatur ukuran mobile.
- `.hero-city-poster, .hero-city-video`: `object-fit: cover` menjaga proporsi
  dan `object-position: 65% center` menempatkan kota di desktop.
- Di bawah 980 px, `object-position: center` dipakai bersama versi 4:3.
- `.hero::before` dan `.hero::after`: gradasi dan blur tipis di belakang teks.

Ubah posisi poster dan video bersama-sama. Tidak ada kamera WebGL aktif pada
Hero. Mengubah kamera di `src/scenes/city-scene.js` hanya memengaruhi viewer
3D/hasil render baru, bukan video yang sudah diekspor. Jangan membesarkan video
secara berlebihan karena ketajamannya tetap dibatasi resolusi sumber.

## Pemutaran dan scroll

`src/components/hero.js` mengatur sumber video dan putar/jeda. Video otomatis
diputar tanpa suara saat terlihat, dijeda ketika keluar layar atau tab
disembunyikan, lalu melanjutkan waktu yang sama saat kembali. Scroll tidak
memuat ulang video atau mengubah framing. Saat melewati breakpoint desktop /
mobile, sumber diganti dengan waktu pemutaran tetap dipertahankan.

Tombol putar/jeda manual beserta handler klik dan CSS-nya sudah dihapus.
Preferensi Reduce Motion dan Save Data menampilkan poster tanpa mengunduh
video. Jika autoplay diblokir atau video gagal dimuat, poster HD tetap tampil.
Pemutaran dan jeda otomatis saat Hero keluar layar tetap dipakai untuk
membatasi pekerjaan browser.

Animasi kemunculan Hero berada di `src/motion/landing-motion.js`. Animasi
tersebut tetap bekerja pada pembungkus `.hero-visual` dan tulisan Hero,
terpisah dari pemutaran video.

How It Works tetap menggunakan adegan 3D interaktif yang sudah ada. Sumber
Blender, GLB, dan `city-preview.html` dipertahankan untuk mengedit serta
memeriksa model. Latar ilustrasi pada Login/Register tetap dihapus.
