# Perbaikan zoom saat scroll — 14 November 2026

Mode How It Works kini dipilih sekali saat pemuatan awal. Scroll ke atas lalu
kembali ke bawah hanya menjeda dan melanjutkan adegan yang sama. Langkah,
posisi karakter, kamera dan waktu animasi dipertahankan. Pergantian otomatis
antara WebGL dan video saat scroll telah dihentikan.

Tombol **Lihat simulasi 3D** dan **Putar ulang animasi** sudah dihapus dari
HTML dan kode pengontrolnya. Klik nomor langkah yang sedang aktif untuk
memutar ulang adegannya. Previous/Next tetap berfungsi.

## Memasang sambil mempertahankan zoom yang sudah kamu atur

1. Hentikan Vite dengan Ctrl+C.
2. Ekstrak ZIP ke folder sementara.
3. Dari `WebDev/accessible-way/`, salin hanya dua file berikut ke lokasi yang
   sama di proyekmu:
   - `src/components/how-it-works.js`
   - `src/styles/how-it-works.css`
4. Pertahankan `src/scenes/story-scene.js` milikmu. Sudut `FRONT_VIEW` dan
   faktor zoom pada `state.halfHeight` tidak perlu diganti untuk perbaikan ini.
5. Jalankan `npm.cmd run dev`, lalu tekan Ctrl+F5 di browser.

Pembaruan ini digunakan di atas versi navbar/animasi sebelumnya. Jika belum
memasang versi itu, ikuti `UPDATE_NAV_ANIMASI.md` terlebih dahulu.

## Yang diperiksa

Next hingga Arrival, kembali ke bagian atas, lalu masuk lagi diuji berulang.
Parameter kamera, elemen canvas, nomor langkah dan jumlah pemuatan model
harus tetap sama. Adegan bergerak juga diuji berhenti saat keluar layar dan
melanjutkan saat kembali. Mode video diuji tetap mempertahankan mode,
framing dan langkah setelah koneksi model tersedia kembali. Lebar layar
390, 1024 dan 1280 piksel diperiksa.
