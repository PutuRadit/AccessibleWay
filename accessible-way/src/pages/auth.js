import "../styles/auth.css";
import { authDestination, requestAuth } from "../services/auth.js";
import { authConfig } from "../config/auth.js";

const base = import.meta.env.BASE_URL;
const assets = `${base}assets`;
const icons = `${assets}/icons/auth`;

function field({ name, label, type = "text", placeholder, icon, autocomplete, register, min, max = 128, forgot = false }) {
  const password = type === "password";
  return `<div class="auth__field">
    <div class="auth__label-row"><label for="auth-${name}">${label}</label>${forgot ? '<button type="button" class="auth__forgot" data-auth-forgot>Lupa Kata Sandi?</button>' : ""}</div>
    <div class="auth__input-wrap">
      <input id="auth-${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}"
        required maxlength="${max}" ${min ? `minlength="${min}"` : ""} ${type !== "password" ? 'spellcheck="false"' : ""}
        ${name === "identifier" || type === "email" ? 'autocapitalize="none" inputmode="email"' : ""}
        ${password ? 'class="auth__password-input"' : ""} data-auth-field />
      <span class="auth__input-icon" aria-hidden="true"><img src="${icons}/${icon}.svg" alt="" /></span>
      ${password ? `<button type="button" class="auth__password-toggle" aria-label="Tampilkan ${name === "confirmPassword" ? "konfirmasi kata sandi" : "kata sandi"}" aria-controls="auth-${name}" aria-pressed="false" data-password-toggle="auth-${name}"><img src="${icons}/eye-${register ? "register" : "login"}.svg" alt="" aria-hidden="true" /></button>` : ""}
    </div>
  </div>`;
}

function googleButton(register) {
  return `<button class="auth__google" type="button" data-auth-google aria-label="${register ? "Daftar dengan akun Google" : "Masuk menggunakan akun Google"}"><img src="${icons}/google-${register ? "register" : "login"}.svg" alt="" aria-hidden="true" /><span>${register ? "Daftar Google" : "Google"}</span></button>`;
}

function submitButton(register) {
  return `<button class="auth__submit" type="submit"><span data-auth-submit-label>${register ? "Daftar Sekarang" : "Masuk ke Akun"}</span><img src="${register ? `${icons}/arrow-register.svg` : `${assets}/icons/arrow-right.svg`}" alt="" aria-hidden="true" /></button>`;
}

function loginCard() {
  return `<section class="auth__card auth__card--login" aria-labelledby="auth-heading" data-figma-node="1:291">
    <div class="auth__intro"><h1 id="auth-heading">Masuk ke Akun</h1><p>Masukkan kredensial akun Accessible Way Anda.</p></div>
    <form class="auth__form auth__form--login" data-auth-form novalidate>
      ${field({ name: "identifier", label: "Email atau Nama Pengguna", placeholder: "nama@email.com", icon: "email", autocomplete: "username", max: 254 })}
      ${field({ name: "password", label: "Kata Sandi", type: "password", placeholder: "Masukkan kata sandi", icon: "lock", autocomplete: "current-password", forgot: true })}
      <div class="auth__remember"><label><input type="checkbox" name="remember" /><span>Ingat saya di perangkat ini</span></label></div>
      ${submitButton(false)}
    </form>
    <div class="auth__divider auth__divider--login"><span>atau masuk dengan</span></div>
    ${googleButton(false)}
    <p class="auth__switch">Belum memiliki akun? <a href="${base}register/">Daftar Sekarang</a></p>
  </section>`;
}

function registerCard() {
  return `<section class="auth__card auth__card--register" aria-labelledby="auth-heading" data-figma-node="1:363">
    <div class="auth__register-intro">
      <span class="auth__register-mark" aria-hidden="true"><img src="${icons}/register-mark.svg" alt="" /></span>
      <h1 id="auth-heading">Buat Akun Accessible Way</h1>
      <p>Bergabunglah untuk aksesibilitas navigasi tanpa batas,<br class="auth__desktop-break" /> aman, dan mandiri setiap hari.</p>
    </div>
    ${googleButton(true)}
    <div class="auth__divider auth__divider--register"><span>ATAU ISI FORMULIR PENDAFTARAN</span></div>
    <form class="auth__form auth__form--register" data-auth-form novalidate>
      ${field({ name: "fullName", label: "Nama Lengkap", placeholder: "Nama lengkap Anda", icon: "name", autocomplete: "name", register: true, min: 2, max: 80 })}
      ${field({ name: "email", label: "Alamat Email", type: "email", placeholder: "nama@email.com", icon: "email", autocomplete: "email", register: true, max: 254 })}
      <div class="auth__password-grid">
        ${field({ name: "password", label: "Kata Sandi", type: "password", placeholder: "Minimal 8 karakter", icon: "lock", autocomplete: "new-password", register: true, min: 8 })}
        ${field({ name: "confirmPassword", label: "Ulangi Sandi", type: "password", placeholder: "Ulangi kata sandi", icon: "shield", autocomplete: "new-password", register: true, min: 8 })}
      </div>
      <div class="auth__agreement">
        <input type="checkbox" id="auth-terms" name="terms" required aria-labelledby="auth-terms-description" data-auth-field />
        <div><p id="auth-terms-description"><label for="auth-terms">Saya menyetujui</label> <button class="auth__inline-link" type="button" data-auth-policy="terms">Syarat &amp; Ketentuan</button> serta <button class="auth__inline-link" type="button" data-auth-policy="privacy">Kebijakan Privasi</button> mobilitas inklusif Accessible Way.</p></div>
      </div>
      ${submitButton(true)}
    </form>
    <p class="auth__switch auth__switch--register">Sudah memiliki akun? <a href="${base}login/">Masuk di sini</a></p>
  </section>`;
}

export function renderAuth(view) {
  const register = view === "register";
  return `<div class="auth auth--${view}" data-auth-view="${view}" data-figma-node="${register ? "1:355" : "1:283"}">
    <header class="auth__header"><div class="auth__header-inner"><a class="auth__brand" href="${base}" aria-label="Accessible Way — Kembali ke Beranda"><span class="auth__brand-mark"><img src="${assets}/icons/accessibility.svg" alt="" aria-hidden="true" /></span><span class="auth__brand-name">Accessible Way</span></a></div></header>
    <main class="auth__stage" id="main-content" tabindex="-1">${register ? registerCard() : loginCard()}</main>
    ${!register ? `<dialog class="auth__dialog auth__reset" aria-labelledby="auth-reset-heading"><div class="auth__dialog-header"><h2 id="auth-reset-heading">Lupa Kata Sandi?</h2><button class="auth__dialog-close" type="button" aria-label="Tutup pemulihan kata sandi" data-auth-close autofocus>×</button></div><p>Masukkan alamat email akun Anda untuk meminta panduan pemulihan.</p><form class="auth__reset-form" data-auth-reset-form novalidate><label for="auth-reset-email">Alamat Email</label><input id="auth-reset-email" type="email" name="email" required maxlength="254" autocomplete="email" placeholder="nama@email.com" /><button class="auth__submit" type="submit"><span data-auth-reset-label>Kirim Panduan</span></button></form></dialog>` : ""}
    <dialog class="auth__dialog auth__notice" aria-labelledby="auth-notice-heading" aria-describedby="auth-notice-message">
      <button class="auth__notice-close" type="button" aria-label="Tutup pemberitahuan" data-auth-close>×</button>
      <span class="auth__notice-icon" aria-hidden="true" data-auth-notice-icon>i</span>
      <h2 id="auth-notice-heading" data-auth-notice-heading></h2>
      <p id="auth-notice-message" data-auth-notice-message></p>
      <button class="auth__notice-confirm" type="button" data-auth-close autofocus>Mengerti</button>
    </dialog>
    <dialog class="auth__dialog auth__policy" aria-labelledby="auth-policy-heading"><div class="auth__dialog-header"><h2 id="auth-policy-heading"></h2><button class="auth__dialog-close" type="button" aria-label="Tutup informasi" data-auth-close autofocus>×</button></div><p data-auth-policy-content></p><a class="auth__dialog-contact" href="${base}#kontak">Hubungi Tim Accessible Way</a></dialog>
  </div>`;
}

export function initAuth(root, view) {
  const register = view === "register";
  const simulated = authConfig.mode === "simulation";
  const form = root.querySelector("[data-auth-form]");
  const fields = [...form.querySelectorAll("[data-auth-field]")];
  const controls = [...form.elements];
  const submit = form.querySelector("button[type=submit]");
  const submitLabel = submit.querySelector("[data-auth-submit-label]");
  const defaultLabel = submitLabel.textContent;
  const google = root.querySelector("[data-auth-google]");
  const notice = root.querySelector(".auth__notice");
  const events = new AbortController();
  const dialogTriggers = new WeakMap();
  let pending = null, resetPending = null, disposed = false;

  function showNotice(title, text, kind = "info", target = submit) {
    if (disposed) return;
    notice.querySelector("[data-auth-notice-heading]").textContent = title;
    notice.querySelector("[data-auth-notice-message]").textContent = text;
    notice.querySelector("[data-auth-notice-icon]").textContent = kind === "success" ? "✓" : "i";
    notice.dataset.state = kind;
    dialogTriggers.set(notice, target);
    if (!notice.open) notice.showModal();
  }

  function validationIssue(field, owner = form) {
    const value = field.value;
    if (field.type === "checkbox") return field.checked ? null : { title: "Setujui ketentuan", text: "Centang persetujuan syarat dan kebijakan privasi sebelum mendaftar." };
    if (!value.trim()) return { title: "Lengkapi formulir", text: "Silakan lengkapi semua kolom sebelum melanjutkan." };
    if ((field.type === "email" || (field.name === "identifier" && value.includes("@"))) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return { title: "Periksa alamat email", text: "Masukkan alamat email yang valid sebelum melanjutkan." };
    const password = field.name === "password" || field.name === "confirmPassword";
    if (field.minLength > 0 && (password ? value.length : value.trim().length) < field.minLength) return { title: password ? "Periksa kata sandi" : "Periksa nama", text: `${password ? "Kata sandi" : "Nama lengkap"} minimal ${field.minLength} karakter.` };
    if (field.maxLength > 0 && value.length > field.maxLength) return { title: "Periksa isian", text: `Isian dapat memuat maksimal ${field.maxLength} karakter.` };
    if (field.name === "confirmPassword" && value !== owner.elements.password.value) return { title: "Konfirmasi sandi belum sama", text: "Pastikan kata sandi dan konfirmasinya sama sebelum mendaftar." };
    return null;
  }

  function validate(items, owner = form) {
    for (const field of items) {
      const issue = validationIssue(field, owner);
      if (issue) { showNotice(issue.title, issue.text, "info", field); return false; }
    }
    return true;
  }

  function setMainBusy(value) {
    for (const control of controls) control.disabled = value;
    google.disabled = value;
    submitLabel.textContent = value ? "Memproses…" : defaultLabel;
    if (value) form.setAttribute("aria-busy", "true");
    else form.removeAttribute("aria-busy");
  }

  function simulation(signal) {
    return new Promise((resolve, reject) => {
      if (signal.aborted) { reject(new DOMException("Cancelled", "AbortError")); return; }
      const cancel = () => { window.clearTimeout(timer); reject(new DOMException("Cancelled", "AbortError")); };
      const timer = window.setTimeout(() => { signal.removeEventListener("abort", cancel); resolve(); }, 350);
      signal.addEventListener("abort", cancel, { once: true });
    });
  }

  function clearPasswords(reset = false) {
    if (reset) form.reset();
    for (const field of fields) if (["password", "confirmPassword"].includes(field.name)) { field.value = ""; field.type = "password"; }
    for (const button of root.querySelectorAll("[data-password-toggle]")) {
      button.setAttribute("aria-pressed", "false");
      button.setAttribute("aria-label", `Tampilkan ${button.dataset.passwordToggle.endsWith("confirmPassword") ? "konfirmasi kata sandi" : "kata sandi"}`);
    }
  }

  function failure(error, title, target = submit) {
    if (disposed || error.name === "AbortError") return;
    const text = error.code === "credentials" ? "Email/nama pengguna atau kata sandi tidak sesuai. Silakan periksa kembali."
      : error.code === "rate-limit" ? "Terlalu banyak percobaan. Tunggu beberapa saat sebelum mencoba kembali."
      : "Permintaan belum dapat diproses. Silakan coba lagi nanti.";
    showNotice(title, text, "info", target);
  }

  for (const button of root.querySelectorAll("[data-password-toggle]")) {
    button.addEventListener("click", () => {
      const field = root.querySelector(`#${button.dataset.passwordToggle}`), visible = field.type === "password";
      field.type = visible ? "text" : "password";
      button.setAttribute("aria-pressed", String(visible));
      button.setAttribute("aria-label", `${visible ? "Sembunyikan" : "Tampilkan"} ${field.name === "confirmPassword" ? "konfirmasi kata sandi" : "kata sandi"}`);
    }, { signal: events.signal });
  }

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (disposed || pending || resetPending || !validate(fields)) return;
    pending = new AbortController();
    setMainBusy(true);
    try {
      if (simulated) await simulation(pending.signal);
      else {
        const payload = register
          ? { name: form.elements.fullName.value.trim(), email: form.elements.email.value.trim(), password: form.elements.password.value, termsAccepted: form.elements.terms.checked }
          : { identifier: form.elements.identifier.value.trim(), password: form.elements.password.value, remember: form.elements.remember.checked };
        await requestAuth(register ? "register" : "login", payload, { signal: pending.signal });
      }
      if (disposed) return;
      clearPasswords(register);
      if (simulated) showNotice(register ? "Pendaftaran berhasil" : "Berhasil masuk", register
        ? "Simulasi pendaftaran berhasil. Tidak ada akun nyata yang dibuat."
        : "Simulasi masuk berhasil. Tidak ada sesi akun yang dibuat.", "success");
      else if (register) showNotice("Pendaftaran berhasil", "Silakan masuk menggunakan akun Anda.", "success");
      else window.location.assign(authDestination("successPath")?.href ?? base);
    } catch (error) {
      failure(error, register ? "Pendaftaran belum berhasil" : "Masuk belum berhasil");
    } finally {
      pending = null;
      if (!disposed) setMainBusy(false);
    }
  }, { signal: events.signal });

  google.addEventListener("click", async () => {
    if (disposed || pending || resetPending) return;
    if (!simulated) {
      const url = authDestination("googleStartPath");
      if (!url) { showNotice("Belum dapat terhubung", "Silakan coba lagi nanti atau gunakan formulir akun.", "info", google); return; }
      url.searchParams.set("flow", view);
      window.location.assign(url.href);
      return;
    }
    pending = new AbortController();
    setMainBusy(true);
    try {
      await simulation(pending.signal);
      if (disposed) return;
      clearPasswords();
      showNotice(register ? "Pendaftaran Google berhasil" : "Masuk Google berhasil", register
        ? "Simulasi pendaftaran Google berhasil. Tidak ada koneksi ke Google atau akun nyata yang dibuat."
        : "Simulasi masuk Google berhasil. Tidak ada koneksi ke akun Google atau sesi yang dibuat.", "success", google);
    } catch (error) { failure(error, "Belum dapat terhubung", google); }
    finally { pending = null; if (!disposed) setMainBusy(false); }
  }, { signal: events.signal });

  for (const dialog of root.querySelectorAll(".auth__dialog")) {
    for (const button of dialog.querySelectorAll("[data-auth-close]")) button.addEventListener("click", () => dialog.close(), { signal: events.signal });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
    }, { signal: events.signal });
    dialog.addEventListener("close", () => {
      if (dialog.classList.contains("auth__reset")) resetPending?.abort();
      if (disposed) return;
      const target = dialogTriggers.get(dialog);
      const open = [...root.querySelectorAll(".auth__dialog[open]")];
      if (target?.isConnected && (!open.length || open.some(item => item.contains(target)))) target.focus();
    }, { signal: events.signal });
  }

  for (const button of root.querySelectorAll("[data-auth-policy]")) {
    button.addEventListener("click", () => {
      const type = button.dataset.authPolicy, url = authDestination(type === "terms" ? "termsPath" : "privacyPath");
      if (!simulated && url) { window.location.assign(url.href); return; }
      const dialog = root.querySelector(".auth__policy");
      dialog.querySelector("h2").textContent = type === "terms" ? "Syarat & Ketentuan" : "Kebijakan Privasi";
      dialog.querySelector("[data-auth-policy-content]").textContent = simulated
        ? "Halaman ini merupakan simulasi antarmuka. Tidak ada akun nyata yang dibuat dan data formulir tidak dikirim ke server."
        : "Hubungi tim Accessible Way untuk informasi penggunaan layanan dan privasi.";
      dialogTriggers.set(dialog, button);
      dialog.showModal();
    }, { signal: events.signal });
  }

  const forgot = root.querySelector("[data-auth-forgot]");
  if (forgot) {
    const dialog = root.querySelector(".auth__reset"), resetForm = dialog.querySelector("form"), email = resetForm.elements.email;
    const button = resetForm.querySelector("button[type=submit]"), label = button.querySelector("[data-auth-reset-label]");
    const resetControls = [...resetForm.elements];
    forgot.addEventListener("click", () => {
      resetForm.reset();
      const identifier = form.elements.identifier.value.trim();
      if (identifier.includes("@")) email.value = identifier;
      dialogTriggers.set(dialog, forgot);
      dialog.showModal();
    }, { signal: events.signal });
    resetForm.addEventListener("submit", async event => {
      event.preventDefault();
      if (disposed || pending || resetPending || !validate([email], resetForm)) return;
      resetPending = new AbortController();
      for (const control of resetControls) control.disabled = true;
      label.textContent = "Memproses…";
      resetForm.setAttribute("aria-busy", "true");
      try {
        if (simulated) await simulation(resetPending.signal);
        else await requestAuth("reset", { email: email.value.trim() }, { signal: resetPending.signal });
        if (disposed) return;
        dialog.close();
        resetForm.reset();
        showNotice("Pemulihan berhasil", simulated
          ? "Simulasi pemulihan berhasil. Email pemulihan tidak benar-benar dikirim."
          : "Jika email tersebut terdaftar, panduan pemulihan akan dikirimkan.", "success", forgot);
      } catch (error) { failure(error, "Pemulihan belum berhasil", email); }
      finally {
        resetPending = null;
        if (!disposed) {
          for (const control of resetControls) control.disabled = false;
          label.textContent = "Kirim Panduan";
          resetForm.removeAttribute("aria-busy");
        }
      }
    }, { signal: events.signal });
  }

  return () => {
    if (disposed) return;
    disposed = true;
    events.abort();
    pending?.abort();
    resetPending?.abort();
    for (const dialog of root.querySelectorAll(".auth__dialog[open]")) dialog.close();
  };
}
