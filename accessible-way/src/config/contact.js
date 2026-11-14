// Alamat email tim bersifat publik dan tampil sebagai kontak langsung.
// Isi endpoint dengan URL API penerima pesan; jangan menaruh kunci rahasia di sini.
// API harus menerima POST JSON dan membalas 2xx dengan { "success": true }.
// "simulation" menjalankan demo tanpa mengirim data; gunakan "api" untuk layanan nyata.
export const contactConfig = Object.freeze({
  mode: "simulation",
  email: "",
  endpoint: "",
});
