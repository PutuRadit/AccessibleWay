# Accessible Way — Login dan Register

Login dan Register memakai kartu putih, tema biru–putih, ikon lokal, dan latar
polos. Tidak ada ilustrasi latar atau model 3D yang dimuat di halaman akun.

## Memasang pembaruan

Jika halaman akun versi sebelumnya sudah terpasang, salin tiga berkas berikut
dari `WebDev/accessible-way/` dalam ZIP ke lokasi yang sama pada proyekmu:

- `src/pages/auth.js`
- `src/styles/auth.css`
- `src/config/auth.js`

Jalankan `npm.cmd run dev`, lalu muat ulang dengan Ctrl+F5. Rute `/login/` dan
`/register/` serta tautan antarhalaman tetap dipakai. Tidak ada dependensi baru.

## Formulir dan popup

- Label tidak menampilkan bintang, tulisan opsional, atau penjelasan teknis
  sementara. Status dan kesalahan tidak lagi ditulis di bawah kolom.
- Tidak ada validasi saat mengetik atau meninggalkan isian. Latar kolom tetap
  netral tanpa garis merah. Pemeriksaan berjalan saat tombol ditekan.
- Login menerima email atau nama pengguna dan kata sandi yang tidak kosong.
- Register memeriksa nama, email, kata sandi minimal 8 karakter, kesamaan
  konfirmasi kata sandi, dan persetujuan syarat. Isian kosong atau tidak valid
  menampilkan popup kecil, lalu fokus kembali ke kolom yang perlu diperbaiki.
- Tombol mata bekerja secara terpisah pada setiap kolom. Menampilkan kata
  sandi tidak mematikan pemeriksaan panjang atau kesamaan konfirmasi.
- Selama proses berjalan, kontrol dinonaktifkan agar tidak ada pengajuan ganda.
- Popup dapat ditutup dengan Mengerti, tombol tutup, Escape, atau klik di luar.
- Lupa Kata Sandi memakai pemeriksaan saat submit dan popup yang sama.
- Tombol Google memakai popup simulasi tanpa membuka Google pada mode demo.
- Tautan syarat dan privasi menampilkan informasi bahwa halaman adalah
  simulasi; tidak ada dokumen legal yang diklaim sudah disahkan.

## Mode simulasi

Konfigurasi aktif di `src/config/auth.js`:

```js
mode: "simulation",
```

Form yang lengkap dan valid menampilkan popup berhasil dengan keterangan
simulasi. Login tidak membuat sesi, Register tidak membuat akun nyata, dan
pemulihan tidak mengirim email. Google juga tidak mengakses akun Google.
Tidak ada permintaan autentikasi atau pengiriman kredensial ke jaringan.

Kata sandi dikosongkan setelah simulasi berhasil dan kembali disembunyikan.
Register mengembalikan formulir ke keadaan awal. Opsi Ingat Saya tidak menyimpan
kredensial, token, atau sesi pada demo. Komponen tidak menulis kata sandi,
token, atau data akun ke localStorage, sessionStorage, cookie JavaScript,
ataupun log. Dalam simulasi, halaman tetap pada Login/Register setelah popup.

## Mode API

Ketika backend tersedia, ganti `mode` menjadi `"api"` dan isi rute yang benar
di `src/config/auth.js`. Nilai kosong tidak membuat pengiriman palsu; kegagalan
API tidak diganti simulasi.

| Pengaturan | Perilaku |
| --- | --- |
| `loginPath` | POST JSON: `{ identifier, password, remember }` |
| `registerPath` | POST JSON: `{ name, email, password, termsAccepted }` |
| `resetPasswordPath` | POST JSON: `{ email }` |
| `googleStartPath` | Rute awal OAuth, dengan parameter `flow` login/register |
| `termsPath` / `privacyPath` | Rute dokumen resmi milik tim |
| `successPath` | Tujuan setelah backend mengonfirmasi login |

Rute API/dokumen tetap harus berada pada origin proyek yang sama. Kata sandi
dipertahankan apa adanya, termasuk spasi yang merupakan bagian dari sandi.
Konfirmasi tidak ikut dikirim sebagai kolom terpisah.

Respons berhasil wajib berupa HTTP sukses dan JSON `{ "ok": true }`, dengan
Content-Type JSON. Fallback HTML dan respons tidak terkonfirmasi bukan sukses.
Sesi nyata dikelola backend. Google dan email pemulihan membutuhkan layanan
backend; tidak ada kunci rahasia yang perlu ditambahkan ke frontend.

Mode API tetap mengarahkan login berhasil ke `successPath`. Pendaftaran dan
pemulihan menampilkan konfirmasi lewat popup. Pesan gagal tampil lewat popup
netral dan tidak menghapus isian. Menutup dialog pemulihan atau melepas komponen
membatalkan permintaan yang masih berjalan.

## Letak pengaturan

| Bagian | File |
| --- | --- |
| Label, formulir, validasi, popup, dan perilaku | `src/pages/auth.js` |
| Kartu, bidang isian, popup, dan responsivitas | `src/styles/auth.css` |
| Mode dan rute layanan | `src/config/auth.js` |
| Kontrak respons dan batas origin API | `src/services/auth.js` |

Label dan isian tetap terhubung, kontrol menggunakan fokus keyboard, dan
preferensi Reduce Motion mematikan animasi dekoratif popup. Event, timer
simulasi, dan permintaan dibersihkan ketika halaman dilepas/HMR.
