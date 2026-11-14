# Accessible Way — Login dan Register

Halaman mengikuti Figma `1:283` (Login) dan `1:355` (Register), termasuk
latar ilustrasi statis, lapisan warna lembut, kartu putih, ikon asli, serta
font dan warna yang sudah digunakan. Halaman akun tidak memuat model 3D.

## Membuka halaman

- Login: `http://localhost:5173/login/`
- Register: `http://localhost:5173/register/`
- Tombol Sign In/Register pada landing page menuju halaman tersebut.
- Logo di halaman akun kembali ke Beranda.
- Tautan di bawah formulir menghubungkan Login dan Register.

Login dan Register memiliki HTML sendiri. Hasil build memuat
`dist/login/index.html` dan `dist/register/index.html`, sehingga keduanya
bisa dibuka langsung tanpa router tambahan.

## Memasang di atas versi sebelumnya

1. Hentikan Vite lalu ekstrak ZIP ke folder sementara.
2. Dari `WebDev/accessible-way/`, salin ke lokasi yang sama pada proyekmu:

   - `login/index.html` dan `register/index.html`
   - `src/pages/auth.js`
   - `src/services/auth.js`
   - `src/config/auth.js`
   - `src/styles/auth.css`
   - `src/main.js`
   - `src/pages/landing.js`
   - `src/components/navbar.js`
   - `vite.config.js`
   - Folder `public/assets/icons/auth/`
   - Folder `public/assets/images/auth/`

3. Jalankan `npm.cmd run dev` lalu tekan Ctrl+F5.
4. Untuk memeriksa hasil produksi, jalankan `npm.cmd run build` kemudian
   `npm.cmd run preview`.

Tidak ada dependensi baru. Berkas About, Contact, pengaturan foto tim,
How It Works, dan kamera tidak perlu disalin ulang.

## Fitur antarmuka

- Login memakai email atau nama pengguna dan kata sandi.
- Register memeriksa nama, email, kata sandi minimal 8 karakter, kesamaan
  konfirmasi kata sandi, dan persetujuan syarat.
- Tombol mata menampilkan/menyembunyikan setiap isian kata sandi secara
  terpisah, dengan label dan status yang dapat dibaca pembaca layar.
- Kesalahan tampil di dekat isian; fokus menuju isian pertama yang perlu
  diperbaiki. Password yang mengandung spasi tidak diubah diam-diam.
- Tombol proses mencegah pengajuan ganda. Respons gagal mengaktifkan kembali
  tombol agar pengunjung dapat mencoba lagi.
- Lupa Kata Sandi membuka dialog email. Escape menutup dialog dan mengembalikan
  fokus. Syarat/privasi membuka dokumen yang dikonfigurasi atau menjelaskan
  bahwa dokumen belum dipublikasikan.
- Tata letak menumpuk pada layar kecil dan mengikuti reduced motion.

## Status autentikasi

Proyek ini belum memiliki backend autentikasi. Karena itu, submit dengan
data valid menjelaskan bahwa layanan belum diaktifkan. Google dan pemulihan
kata sandi juga menampilkan status sebenarnya; tidak ada akun atau sesi
masuk palsu yang dibuat di browser.

Komponen tidak menyimpan kata sandi atau token dalam localStorage,
sessionStorage, cookie JavaScript, ataupun log. Isian kata sandi hanya ada
di formulir selama digunakan. Opsi Ingat Saya dikirim sebagai boolean kepada
backend ketika layanan tersedia; backend menentukan masa berlaku sesi.

## Menghubungkan backend

Isi rute proyek yang sebenarnya di `src/config/auth.js`. Nilai kosong
menonaktifkan permintaan jaringan untuk layanan tersebut.

| Pengaturan | Perilaku |
| --- | --- |
| `loginPath` | POST JSON: `{ identifier, password, remember }` |
| `registerPath` | POST JSON: `{ name, email, password, termsAccepted }` |
| `resetPasswordPath` | POST JSON: `{ email }` |
| `googleStartPath` | Membuka rute awal OAuth Google; parameter `flow` berisi `login` atau `register` |
| `termsPath` / `privacyPath` | Rute dokumen resmi yang telah disiapkan tim |
| `successPath` | Tujuan setelah backend mengonfirmasi login; default Beranda |

Rute berada pada origin yang sama. Jika API berada pada layanan terpisah,
hubungkan melalui server/proxy proyek terlebih dahulu. Tidak perlu memasukkan
kata sandi server, client secret OAuth, atau kunci rahasia ke file frontend.

Kontrak respons berhasil: HTTP sukses, `Content-Type: application/json`,
dan objek `{ "ok": true }`. Sesi pengguna dikelola server; frontend tidak
mengambil token dari respons untuk disimpan di browser. HTML dari fallback
hosting tidak dianggap sebagai login berhasil.

Login berhasil menuju `successPath`. Register berhasil menampilkan konfirmasi
dan mengosongkan kata sandi; pengguna dapat memilih Masuk di sini. Pemulihan
berhasil menampilkan jawaban umum tanpa mengungkap apakah email terdaftar.
Integrasi Google dan pengiriman email pemulihan harus disediakan backend.

## Mengubah desain

| Bagian | File |
| --- | --- |
| Judul, label, isian, dialog, perilaku form | `src/pages/auth.js` |
| Warna, ukuran kartu, latar, responsivitas, animasi | `src/styles/auth.css` |
| Konfigurasi layanan | `src/config/auth.js` |
| Permintaan dan penanganan respons API | `src/services/auth.js` |
| Metadata halaman | `login/index.html`, `register/index.html` |

Latar dan sepuluh SVG baru disimpan lokal. Ikon logo serta panah Login memakai
aset yang sudah ada dan sama persis dengan ekspor Figma.

Referensi desain:

- https://www.figma.com/design/DxDcFrkQeM7iDrCZZLq1yR/Untitled?node-id=1-283
- https://www.figma.com/design/DxDcFrkQeM7iDrCZZLq1yR/Untitled?node-id=1-355
