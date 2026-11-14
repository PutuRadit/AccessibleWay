# Accessible Way — Kota 3D besar sebagai latar Hero

> Pembaruan terbaru: Hero sekarang memutar video HD dari model kota ini.
> Panduan aktif ada di `HERO_VIDEO_HD.md`. Kamera dan renderer 3D di bawah
> tetap tersedia pada `city-preview.html` untuk memeriksa model sumber.

Hero kini memakai kota 3D tanpa bingkai, dengan judul, deskripsi, dan CTA di
depannya. Gradasi vertikal memenuhi tinggi Hero, dengan blur tipis yang semakin
berkurang ke kiri. Tidak ada panel kaca atau tepian membulat; teks tetap tajam.
Tombol pause pada Hero dihapus sesuai revisi.

Kota dibuat sebagai model 3D asli berdasarkan ilustrasi konsep yang disetujui.
Semua bentuk dimodelkan dari geometri; terdapat bangunan, karakter dengan rig,
kendaraan, jalan melingkar, taman, ramp, dan fasilitas pejalan kaki. Komposisinya
mengikuti konsep dengan detail yang disesuaikan untuk penggunaan di website.

## Isi kota dan animasi

- 10 bangunan: apartemen, kantor, klinik, toko, rumah, serta kafe sudut.
- 12 karakter: pejalan kaki, dua pengguna kursi roda, satu pengguna walker, dan
  dua warga yang duduk di taman.
- Lima kendaraan: bus, tiga mobil, dan skuter dengan pengendara.
- Siklus 24 detik: kendaraan mengikuti jalan, karakter berjalan atau bergerak
  di trotoar/plaza, roda berputar, dan karakter memakai animasi tulang.
- Kamera isometrik tetap. Model tidak memerlukan gerakan mouse untuk dilihat.
- Empat belas objek yang masuk ke badan jalan dibersihkan dari master Blender
  dan GLB: empat lampu, enam semak, tiga pohon, dan satu petak bunga.

Animasi tersimpan di GLB. Three.js memutarnya melalui `AnimationMixer` dan
`LoopRepeat`. Kecepatan di website **0,5×**, sehingga siklus dasar GLB 24 detik
diputar selama sekitar **48 detik**. GSAP menangani animasi kemunculan Hero.
Video 24 detik dalam paket merupakan preview siklus dasar model; kecepatan
website dikendalikan lewat `playbackRate`.

## Jalankan website

Hentikan server Vite yang berjalan dengan Ctrl+C. Salin hasil
`WebDev/accessible-way/` ke folder proyekmu, dengan memeriksa perubahan lokal
sebelum menimpa file. Pertahankan folder `.git` yang sudah ada. Dependensi sama
dengan paket kota sebelumnya, sehingga pembaruan ini dapat langsung dijalankan:

```powershell
cd D:\Kuliah\WebDev\accessible-way
npm.cmd run dev
```

Buka alamat yang ditampilkan Vite untuk melihat Hero. Untuk melihat kota dalam
halaman tersendiri, buka `city-preview.html` pada alamat Vite yang sama, misalnya
`http://localhost:5173/city-preview.html` jika Vite menggunakan port 5173.

Untuk pemasangan pertama atau jika `node_modules` belum ada, jalankan
`npm.cmd ci` terlebih dahulu ketika server Vite sudah berhenti.

```powershell
npm.cmd run build
npm.cmd run preview
```

How It Works sudah ditambahkan pada tahap berikutnya; panduannya ada di
`HOW_IT_WORKS.md`. About, Contact, Login/Register, dan aplikasi navigasi belum
ditambahkan.

## Berkas penting

| Berkas | Kegunaan |
| --- | --- |
| `public/assets/models/accessible-city-animated.glb` | Model beserta seluruh animasi, dimuat oleh website |
| `public/assets/images/accessible-city-poster.png` | Render model yang sama untuk tampilan awal dan fallback |
| `public/assets/images/accessible-city-hero-background.png` | Render kamera Hero untuk fallback desktop tanpa bingkai |
| `src/scenes/city-scene.js` | Kamera, lampu, pemuatan GLB, pemutar animasi, pengaturan ukuran, dan pembersihan renderer |
| `src/components/hero.js` | Kota sebagai latar Hero, teks di depan, serta kecepatan 0,5× |
| `city-preview.html` dan `src/city-preview.js` | Viewer tersendiri, tombol putar/jeda, ulangi, dan unduh GLB |
| `vite.config.js` | Mem-build beranda dan halaman preview |

Sumber model yang dapat diedit ada di `WebDev/3d Assets/Accessible_City/`:

- `Accessible_Way_City_Master.blend`: model Blender beserta rig, kamera, lampu,
  dan keyframe pada frame 0–576, 24 fps.
- `Accessible_Way_City_Animated.glb`: hasil ekspor model dan animasinya.
- `build_accessible_city.py`: script pembuat model agar hasil dapat direproduksi.
- `city_manifest.json`: isi kota dan pengaturan kamera.
- `road_clearance_report.json`: daftar properti taman/jalan yang dipertahankan
  atau dibuang saat membangun ulang kota.

Untuk memutar animasi di Blender, buka master, gunakan kamera aktif, lalu tekan
Space pada timeline. Pada viewer GLB lain, pilih clip animasi dan aktifkan loop
jika viewer tersebut tidak memutarnya otomatis.

## Perilaku di halaman

- Hero berjalan otomatis tanpa tombol pause. Halaman `city-preview.html` tetap
  memiliki kontrol putar/jeda untuk pemeriksaan model.
- Preferensi **Reduce motion** menampilkan kota dalam keadaan berhenti.
- Animasi berhenti ketika kotak Hero berada di luar layar atau tab disembunyikan.
- Font, poster, dan GLB berasal dari file lokal proyek.
- Jika WebGL atau model gagal dimuat, poster kota tetap tampil dan tersedia
  tombol untuk mencoba tampilan 3D lagi.
- Perangkat dengan Save Data menampilkan poster dahulu; tampilan 3D dapat
  dimuat melalui tombol.
- Resolusi renderer dibatasi dan bayangan bangunan diperbarui satu kali;
  model baru dimuat saat Hero mendekati area layar.

Kinerja nyata bergantung pada perangkat. Pemeriksaan di lingkungan pengembangan
dicatat bersama hasil uji; tidak ada klaim frame rate untuk laptop atau HP yang
belum diuji.

## Mengubah kamera

Pada `src/scenes/city-scene.js`, posisi kamera ditentukan oleh `camera.position`
dan arah pandang oleh `camera.lookAt`. Hero desktop memakai `halfHeight = 9.3`;
nilai lebih kecil memperbesar kota. Kamera digeser agar kota berada di belakang
dan di sebelah kanan teks, dengan `shift = halfWidth * 0.30`. Kota sekitar 15%
lebih besar daripada revisi sebelumnya. Tampilan mobile serta preview model
memakai framing yang menampilkan keseluruhan kota.

Pada `src/components/hero.js`, `playbackRate: 0.5` mengatur kecepatan animasi.
Efek gradasi berada pada `.hero::before`, sedangkan blur tipis 3 px dengan mask
linier berada pada `.hero::after` di `src/styles/landing.css`. Kedua lapisan
memenuhi tinggi Hero sehingga tidak membentuk panel di sekitar tulisan.

## Membuat ulang model

Dengan Blender tersedia pada PATH, jalankan dari folder `Accessible_City`:

```powershell
blender --background --factory-startup --python build_accessible_city.py
```

Script menyusun model dari geometri berdasarkan ilustrasi konsep dan dapat
dipakai untuk mengubah bangunan, karakter, jalur, serta pengaturan animasi.
