# Accessible Way — How It Works

Label dan judul memakai versi awal. Animasi mengikuti urutan rumah,
perjalanan singkat, kedatangan rumah sakit, lalu navigasi ke farmasi.

## Menjalankan pembaruan

1. Hentikan Vite dengan Ctrl+C.
2. Ekstrak ZIP ke folder sementara. Salin isi `WebDev/accessible-way/` ke folder
   proyekmu, dengan mempertahankan perubahan lokal lain yang sudah kamu buat.
3. Dependensi tidak berubah. Jika sudah terpasang, jalankan:

   ```powershell
   cd D:\Kuliah\WebDev\accessible-way
   npm.cmd run dev
   ```

4. Buka How It Works. Jika browser masih menampilkan versi lama, tekan Ctrl+F5.

## Adegan tiap langkah

| Langkah | Label | Animasi |
| --- | --- | --- |
| 1 | Selamat Datang | Duduk diam di kursi roda di dalam rumah |
| 2 | Pilih Destinasi | Mengangkat ponsel dan menampilkan bubble peta |
| 3 | Periksa Fasilitas | Tetap di rumah; bubble `…` berubah menjadi `✓ OK` |
| 4 | Rute Tepat | Gerak pendek dekat gedung kedua, sekitar 3,3 detik |
| 5 | Tiba di Lokasi (Arrival) | Bergerak sekitar 2,1 meter menuju area depan pintu rumah sakit, sekitar 2,9 detik |
| 6 | Peta Dalam Gedung (Indoor Map) | Mulai di pintu masuk, lalu melewati koridor sampai farmasi; sekitar 6,9 detik |

Saat langkah dipilih, lokasi adegannya langsung sesuai langkah tersebut.
Arrival dan Indoor Map kemudian memainkan perjalanan masing-masing, bukan
langsung diam di tujuan. Memilih langkah lain membatalkan animasi sebelumnya.
Klik tab yang sedang aktif untuk mengulang gerakan.
Previous memutar kursi roda sebelum bergerak kembali, termasuk pada animasi cadangan. Ulangi mengembalikan
pengguna ke rumah.

Bubble mengikuti titik di atas kepala karakter, termasuk ketika ukuran layar berubah.

Garis di depan karakter berwarna pucat, lalu menjadi biru terang setelah
dilewati. Putaran roda dan gerak tangan mengikuti perjalanan. Gerak mulai dan
berhenti memakai easing. Adegan luar menggunakan rumah utuh dari model kota,
sedangkan rumah cutaway hanya terlihat pada tiga langkah pertama.

Ini simulasi cerita pada landing page. Perhitungan rute aplikasi utama tetap
khusus navigasi di dalam gedung.

## Berkas utama

| Berkas | Isi |
| --- | --- |
| `src/components/how-it-works.js` | `storySteps`: label, judul, paragraf, tab dan tombol |
| `src/scenes/story-scene.js` | Adegan, animasi, pembingkaian kamera, pintu dan progres jalur |
| `src/scenes/story-path.js` | Titik jalur rumah, kota, pintu rumah sakit dan farmasi |
| `src/scenes/wheelchair-resident.js` | Karakter, roda, gerak tangan dan ponsel |
| `src/styles/how-it-works.css` | Border, blur halus, bubble dan tampilan responsif |
| `public/assets/models/accessible-story.glb` | Model rumah, kota dan rumah sakit |

Pada `story-scene.js`, `ARRIVAL_TRAVEL_METRES` mengatur jarak gerak Arrival,
`INDOOR_TRAVEL_SECONDS` durasi perjalanan indoor, dan `SHORT_TRAVEL_METRES`
jarak clip langkah keempat. Indeks langkah di kode dimulai dari 0.

Sudut kamera depan-atas, batas kartu dan gradasi blur dipertahankan. Saat
preferensi reduced motion aktif, langkah langsung menampilkan keadaan akhir.
Mode tampilan dipilih sekali saat bagian ini pertama dibuka. WebGL yang berhasil
dimuat tetap memakai scene dan kamera yang sama. Jika WebGL gagal atau mode hemat
data aktif, video lokal dari scene 3D yang sama memainkan tiap langkah. Scroll
hanya menjeda dan melanjutkan tampilan yang sudah dipilih; tidak memuat ulang
model atau berpindah mode. Gambar terakhir tersedia jika video tidak dapat dibuka.
Pada reduced motion, klik tab yang sedang aktif untuk memutar adegan secara sengaja.
Tombol Lihat simulasi 3D dan Putar ulang animasi telah dihapus.

Video dan gambar berada di `public/assets/video/`; koordinat kepala ada dalam
`src/scenes/story-media.js`. Seluruh folder ini wajib ikut disalin saat memperbarui proyek.
