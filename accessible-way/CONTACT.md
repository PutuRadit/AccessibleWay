# Accessible Way — Contact

Bagian Contact mengikuti susunan Figma `1:186`: informasi di kiri dan kartu
formulir putih di kanan, dengan tema biru–putih, Plus Jakarta Sans, Inter,
bidang isian biru muda, dan lima ikon asli yang disimpan lokal.

Isi disesuaikan dengan proyek Accessible Way: pertanyaan proyek, saran dan
masukan, serta kolaborasi. Kontak contoh, klaim layanan audit, hotline,
Juru Bahasa Isyarat, dan janji waktu balasan pada desain tidak digunakan
sebagai layanan nyata tim.

## Memasang di atas versi sebelumnya

1. Hentikan Vite, lalu ekstrak ZIP ke folder sementara.
2. Dari `WebDev/accessible-way/`, salin ke lokasi yang sama pada proyekmu:

   - `src/components/contact.js`
   - `src/config/contact.js`
   - `src/styles/contact.css`
   - `src/main.js`
   - `src/pages/landing.js`
   - `src/motion/landing-motion.js`
   - Folder `public/assets/icons/contact/` beserta kelima SVG di dalamnya

3. Jalankan `npm.cmd run dev`, lalu tekan Ctrl+F5.
4. Klik Contact pada navbar. Indikator biru dan halaman berpindah ke `#kontak`.

Tidak ada dependensi baru. Pembaruan ini tidak memerlukan penyalinan file
kamera, model 3D, atau komponen How It Works.

## Mengisi alamat email penerima

Alamat email tim belum diberikan. Isi satu pengaturan di
`src/config/contact.js`:

```js
export const contactConfig = Object.freeze({
  email: "alamat-email-tim-yang-benar",
});
```

Ganti teks di atas dengan alamat email asli. Alamat yang valid akan tampil
di Contact dan mengaktifkan tombol **Buka Draf Email** pada pratinjau.
Alamat ini bersifat publik; tidak memerlukan kunci API atau kata sandi.

Alur yang tersedia:

1. Pilih topik pesan.
2. Isi nama, email, serta catatan/pertanyaan. Gedung/tempat dan kota opsional.
3. Klik **Tinjau Pesan**. Formulir memeriksa data dan membuka pratinjau.
4. Salin pesan, atau buka draf di aplikasi email jika penerima sudah diisi.
5. Pengunjung sendiri menekan Kirim di aplikasi email.

Formulir belum terhubung ke server pengiriman email. Membuka pratinjau atau
menyalin pesan tidak mengirimkannya. Saat penerima masih kosong, pratinjau
menjelaskan bahwa alamat belum ditambahkan dan pesan belum dikirim.
Isian tidak dikirim melalui jaringan atau disimpan ke penyimpanan browser
oleh komponen ini.

## Pengaturan isi, desain, dan animasi

| Bagian | File |
| --- | --- |
| Alamat email penerima | `src/config/contact.js` |
| Judul, paragraf, topik, formulir, pratinjau | `src/components/contact.js` |
| Warna, jarak, ukuran isian, hover, responsivitas | `src/styles/contact.css` |
| Animasi scroll | Empat entri `.contact__…` di `src/motion/landing-motion.js` |
| Ikon Figma asli | `public/assets/icons/contact/` |

Formulir memiliki label, pesan kesalahan per kolom, fokus ke isian yang
perlu diperbaiki, penghitung karakter, dan pratinjau yang dapat ditutup
dengan Escape. Topik dapat dipilih melalui keyboard. Reduced motion
menampilkan isi tanpa animasi. Pembersihan event mengikuti siklus HMR Vite.

## Pengaturan foto tim terbaru

ZIP juga memuat nilai pembingkaian yang diberikan terakhir:

```css
.about__avatar--anisa { --portrait-width: 125%; --portrait-left: -25%; --portrait-top: -37%; }
.about__avatar--putu { --portrait-width: 125%; --portrait-left: -13%; --portrait-top: -24%; }
.about__avatar--farel { --portrait-width: 170%; --portrait-left: -10%; --portrait-top: -8%; }
```

Jika proyek lokal memiliki penyesuaian CSS lain, cukup terapkan tiga aturan
tersebut pada `src/styles/about.css`.

Referensi: https://www.figma.com/design/DxDcFrkQeM7iDrCZZLq1yR/Untitled?node-id=1-186
