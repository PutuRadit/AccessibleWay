// Isi rute API milik proyek saat backend autentikasi sudah tersedia.
// Rute harus berada pada origin yang sama; tidak ada kredensial/kunci rahasia di sini.
export const authConfig = Object.freeze({
  loginPath: "",
  registerPath: "",
  resetPasswordPath: "",
  googleStartPath: "",
  termsPath: "",
  privacyPath: "",
  successPath: import.meta.env.BASE_URL,
});
