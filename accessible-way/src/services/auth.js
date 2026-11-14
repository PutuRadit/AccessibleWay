import { authConfig } from "../config/auth.js";

const actionPaths = { login: "loginPath", register: "registerPath", reset: "resetPasswordPath" };
const unavailable = {
  login: "Layanan masuk akun belum diaktifkan.",
  register: "Pendaftaran akun belum diaktifkan.",
  reset: "Pemulihan kata sandi belum tersedia saat ini.",
};

export class AuthError extends Error {
  constructor(code, message) { super(message); this.name = "AuthError"; this.code = code; }
}

export function authUrl(path) {
  if (!path || typeof path !== "string") return null;
  try {
    const url = new URL(path, new URL(import.meta.env.BASE_URL, window.location.origin));
    if (url.origin !== window.location.origin || url.username || url.password || !["http:", "https:"].includes(url.protocol)) return null;
    return url;
  } catch { return null; }
}

export function authDestination(key) { return authUrl(authConfig[key]); }

export async function requestAuth(action, payload, { signal } = {}) {
  const url = authDestination(actionPaths[action]);
  if (!url) throw new AuthError("unavailable", unavailable[action] ?? "Layanan belum tersedia saat ini.");
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abort, { once: true });
  const timeout = window.setTimeout(abort, 15000);
  try {
    const response = await fetch(url, {
      method: "POST", credentials: "same-origin", signal: controller.signal,
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    if (response.status === 429) throw new AuthError("rate-limit", "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba kembali.");
    if (action === "login" && [401, 403].includes(response.status)) throw new AuthError("credentials", "Email/nama pengguna atau kata sandi tidak sesuai.");
    if (!response.ok) throw new AuthError("server", "Permintaan belum dapat diproses. Periksa data Anda atau coba kembali nanti.");
    if (!response.headers.get("content-type")?.includes("application/json")) throw new AuthError("response", "Layanan belum dapat memproses permintaan ini.");
    const data = await response.json();
    if (data?.ok !== true) throw new AuthError("response", "Permintaan belum berhasil diproses. Silakan coba kembali.");
    return data;
  } catch (error) {
    if (signal?.aborted || error instanceof AuthError) throw error;
    throw new AuthError("network", "Layanan sedang sulit diakses. Periksa koneksi Anda dan coba kembali.");
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
