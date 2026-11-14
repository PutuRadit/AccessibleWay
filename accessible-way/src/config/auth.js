// Isi rute API milik proyek saat backend autentikasi sudah tersedia.
// Rute harus berada pada origin yang sama; tidak ada kredensial/kunci rahasia di sini.
// "simulation" tidak mengirim kredensial atau membuat akun/sesi. Gunakan "api" untuk backend nyata.
export const authConfig = Object.freeze({
  mode: "simulation",
  loginPath: "",
  registerPath: "",
  resetPasswordPath: "",
  googleStartPath: "",
  termsPath: "",
  privacyPath: "",
  successPath: import.meta.env.BASE_URL,
});
