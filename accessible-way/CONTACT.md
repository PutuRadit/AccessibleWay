# Accessible Way — Contact

Contact memakai tema biru–putih dengan informasi dan pilihan topik di kiri,
serta kartu formulir di kanan.

## Memasang pembaruan

Dari `WebDev/accessible-way/` dalam ZIP, salin tiga berkas ini ke lokasi yang
sama pada proyek yang sudah berjalan:

- `src/components/contact.js`
- `src/styles/contact.css`
- `src/config/contact.js`

Lalu jalankan `npm.cmd run dev` dan muat ulang halaman dengan Ctrl+F5.
Tidak ada dependensi baru. Pengaturan kamera, teks How It Works/About,
video Hero, foto tim, dan animasi navbar tidak perlu disalin ulang.

Jika pembaruan popup sebelumnya sudah terpasang, cukup perbarui
`src/components/contact.js` dan `src/config/contact.js` untuk mengaktifkan
mode simulasi ini.

## Perilaku formulir

- Label tidak memakai bintang atau tulisan opsional.
- Tidak ada pemeriksaan saat mengetik atau berpindah kolom. Formulir tetap
  netral tanpa garis merah dan pesan kesalahan di bawah isian.
- Tombol bertuliskan **Kirim Pesan** dan tetap dapat diklik saat formulir kosong.
- Saat tombol ditekan, nama, email, gedung/tempat, kota/lokasi, dan pesan
  harus berisi teks. Spasi saja dianggap kosong.
- Jika ada isian kosong, popup kecil meminta pengguna melengkapi formulir.
  Sesudah ditutup, fokus berpindah ke kolom pertama yang belum lengkap.
- Email diperiksa formatnya ketika pengguna mengirim. Batas panjang isian
  tetap berlaku, tetapi tidak ada syarat minimum 10 karakter untuk pesan.
- Selama permintaan dikirim, tombol menampilkan **Mengirim…** dan kontrol
  dinonaktifkan sementara untuk mencegah pengiriman berulang.
- Dalam mode simulasi, formulir lengkap menampilkan popup **Pesan terkirim**
  dengan keterangan bahwa pengiriman masih berupa simulasi dan pesan belum
  dikirim ke tim. Tidak ada permintaan pengiriman ke jaringan atau penyimpanan
  data. Sesudah simulasi berhasil, isian dan penghitung karakter direset.
- Dalam mode API, popup berhasil baru tampil setelah API mengonfirmasi
  penerimaan. Isian dan penghitung karakter kemudian direset.
- Jika koneksi gagal, respons tidak mengonfirmasi penerimaan, atau permintaan
  melewati 15 detik, popup **Pesan belum terkirim** tampil. Isian tidak dihapus.
- Popup dapat ditutup dengan tombol, Escape, atau klik di luar popup.

## Mengaktifkan pengiriman nyata

ZIP ini memakai **mode simulasi** sesuai kebutuhan demo frontend:

```js
mode: "simulation",
```

Mode ini tidak membutuhkan backend atau alamat API. Semua pemeriksaan isian
tetap dipakai, tetapi tidak ada data yang dikirim ke tim atau disimpan.

Untuk pengiriman nyata, ganti mode menjadi `"api"` dan isi endpoint layanan
yang benar. Pada mode API, endpoint kosong tetap menampilkan popup belum
terkirim dan mempertahankan isian; kegagalan API tidak diganti simulasi.

Isi `src/config/contact.js` setelah backend siap:

```js
export const contactConfig = Object.freeze({
  mode: "api",
  email: "", // Kontak email publik bila ingin ditampilkan.
  endpoint: "/api/contact", // Ganti dengan rute API penerima yang sebenarnya.
});
```

Alamat di atas adalah contoh kontrak integrasi; ZIP ini tidak menyediakan
handler `/api/contact`. Jangan menaruh kata sandi atau kunci API rahasia pada
konfigurasi frontend.

Frontend mengirim **POST** dengan `Content-Type: application/json` dan data:

```json
{
  "topic": "masukan",
  "name": "Nama pengguna",
  "email": "pengguna@example.com",
  "building": "Nama tempat",
  "city": "Nama kota",
  "message": "Isi pesan pengguna"
}
```

Backend harus memeriksa data, menerima pesan, lalu membalas status HTTP 2xx
dan JSON berikut untuk menampilkan popup berhasil:

```json
{ "success": true }
```

Respons HTML dari fallback SPA, JSON tanpa `success: true`, respons HTTP gagal,
dan kegagalan koneksi tidak dianggap sebagai pesan terkirim. Pesan error dari
server tidak dimasukkan langsung ke halaman.

## Pengaturan

| Bagian | File |
| --- | --- |
| Isi, pemeriksaan saat mengirim, popup, dan alur pengiriman | `src/components/contact.js` |
| Tampilan formulir dan popup kecil | `src/styles/contact.css` |
| API penerima dan kontak email publik | `src/config/contact.js` |
| Animasi muncul saat scroll | `src/motion/landing-motion.js` |

Label tetap terhubung ke isian, semua isian diumumkan sebagai diperlukan
untuk pengiriman oleh pembaca layar, dan pemeriksaan bawaan browser digantikan
popup melalui `novalidate`. Preferensi Reduce Motion mematikan animasi popup.
Event dan permintaan yang berjalan dibersihkan saat komponen dilepas/HMR.
