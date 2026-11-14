# Pembaruan navbar dan animasi — 14 November 2026

Navbar mengikuti layar dan selalu terlihat selama Hero masih berada di bawah
navbar. Sesudah Hero terlewati dan How It Works mencapai bagian atas konten,
navbar muncul saat halaman digulir, lalu menghilang setelah sekitar 1,5 detik
tanpa aktivitas. Kembali ke Hero langsung memperlihatkan navbar dan membatalkan
timer sembunyi. Batas ini mengikuti tinggi Hero saat ukuran layar berubah.

Navbar tetap terbuka saat pointer berada di atasnya, fokus keyboard berada di
dalamnya, atau menu mobile sedang dibuka. Gerakkan pointer ke tepi atas layar
atau mulai scroll untuk memunculkannya lagi di bagian bawah halaman.

Indikator biru bergeser ke menu yang dipilih. Home dan How It Works juga
mengikuti bagian halaman yang sedang terlihat. Hero dan How It Works muncul
dengan gerakan bertahap ketika masuk layar dan bisa muncul lagi saat dikunjungi
ulang. Nomor langkah memantul ringan; latar tab, teks dan progres ikut bergerak.

## Memasang tanpa menimpa pengaturan kamera

1. Hentikan Vite dengan Ctrl+C.
2. Ekstrak ZIP ke folder sementara.
3. Untuk pembaruan perilaku navbar ini, cukup salin
   **`src/components/navbar.js`** dari `WebDev/accessible-way/` dalam ZIP
   ke lokasi yang sama pada proyekmu. Ini berlaku bila pembaruan Hero video
   dan animasi sebelumnya sudah terpasang.

4. Pertahankan isi `src/scenes/` milikmu, termasuk `story-scene.js`, agar
   perubahan sudut kamera dan zoom yang kamu lakukan tetap dipakai. Model,
   video dan dependensi tidak memerlukan pembaruan untuk perubahan ini.
5. Jalankan `npm.cmd run dev`, lalu tekan Ctrl+F5 di browser.

## Mengatur animasi

| Bagian | Lokasi | Parameter |
| --- | --- | --- |
| Jeda navbar sebelum menghilang | `src/components/navbar.js` | `IDLE_HIDE_MS = 1500`, dalam milidetik |
| Batas navbar selalu terlihat | `src/components/navbar.js` | `isInHero()`, menggunakan batas bawah Hero dan tinggi navbar |
| Kecepatan indikator biru | `src/components/navbar.js` | `moveIndicator`, `duration: .48` |
| Jarak dan durasi masuk saat scroll | `src/motion/landing-motion.js` | Array `groups`: `x`, `y`, `duration`, `stagger` |
| Gerakan nomor dan perpindahan langkah | `src/motion/how-step-motion.js` | Fungsi `select` dan `position` |
| Durasi navbar naik/turun | `src/styles/landing.css` | `transition` pada `.navbar` |

Pengaturan reduced motion tetap dihormati: isi dan nomor langkah langsung
terlihat tanpa gerakan dekoratif. Fokus keyboard juga langsung memperlihatkan
konten, sehingga animasi tidak menghalangi navigasi.

About Us, Contact, Login dan Register tetap menggunakan tujuan tautan yang
sudah disiapkan sebelumnya. Pembaruan ini tidak menambahkan halaman atau
bagian tersebut.
