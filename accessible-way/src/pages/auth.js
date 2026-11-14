import "../styles/auth.css";
import { authDestination, requestAuth } from "../services/auth.js";

const base = import.meta.env.BASE_URL;
const assets = `${base}assets`;
const icons = `${assets}/icons/auth`;

function field({ name, label, type = "text", placeholder, icon, autocomplete, register, min, max = 128, forgot = false }) {
  const password = type === "password";
  return `<div class="auth__field">
    <div class="auth__label-row"><label for="auth-${name}">${label} <span class="auth__required" aria-hidden="true">*</span></label>${forgot ? '<button type="button" class="auth__forgot" data-auth-forgot>Lupa Kata Sandi?</button>' : ""}</div>
    <div class="auth__input-wrap">
      <input id="auth-${name}" name="${name}" type="${type}" placeholder="${placeholder}" autocomplete="${autocomplete}"
        required maxlength="${max}" ${min ? `minlength="${min}"` : ""} ${type !== "password" ? 'spellcheck="false"' : ""}
        ${name === "identifier" || type === "email" ? 'autocapitalize="none" inputmode="email"' : ""}
        ${password ? 'class="auth__password-input"' : ""} aria-describedby="auth-${name}-error" data-auth-field />
      <span class="auth__input-icon" aria-hidden="true"><img src="${icons}/${icon}.svg" alt="" /></span>
      ${password ? `<button type="button" class="auth__password-toggle" aria-label="Tampilkan ${name === "confirmPassword" ? "konfirmasi kata sandi" : "kata sandi"}" aria-controls="auth-${name}" aria-pressed="false" data-password-toggle="auth-${name}"><img src="${icons}/eye-${register ? "register" : "login"}.svg" alt="" aria-hidden="true" /></button>` : ""}
    </div>
    <p id="auth-${name}-error" class="auth__error" hidden></p>
  </div>`;
}

function googleButton(register) {
  return `<button class="auth__google" type="button" data-auth-google aria-label="${register ? "Daftar dengan akun Google" : "Masuk menggunakan akun Google"}"><img src="${icons}/google-${register ? "register" : "login"}.svg" alt="" aria-hidden="true" /><span>${register ? "Daftar Google" : "Google"}</span></button>`;
}

function submitButton(register) {
  return `<button class="auth__submit" type="submit"><span data-auth-submit-label>${register ? "Daftar Sekarang" : "Masuk ke Akun"}</span><img src="${register ? `${icons}/arrow-register.svg` : `${assets}/icons/arrow-right.svg`}" alt="" aria-hidden="true" /></button>`;
}

function status() { return '<p class="auth__status" role="status" aria-live="polite" tabindex="-1" data-auth-status hidden></p>'; }

function loginCard() {
  return `<section class="auth__card auth__card--login" aria-labelledby="auth-heading" data-figma-node="1:291">
    <div class="auth__intro"><h1 id="auth-heading">Masuk ke Akun</h1><p>Masukkan kredensial akun Accessible Way Anda.</p></div>
    <form class="auth__form auth__form--login" data-auth-form novalidate>
      ${field({ name: "identifier", label: "Email atau Nama Pengguna", placeholder: "contoh@email.com", icon: "email", autocomplete: "username", max: 254 })}
      ${field({ name: "password", label: "Kata Sandi", type: "password", placeholder: "Masukkan kata sandi", icon: "lock", autocomplete: "current-password", forgot: true })}
      <div class="auth__remember"><label><input type="checkbox" name="remember" /><span>Ingat saya di perangkat ini</span></label></div>
      ${status()}${submitButton(false)}
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
      ${field({ name: "fullName", label: "Nama Lengkap", placeholder: "Contoh: Rian Pratama", icon: "name", autocomplete: "name", register: true, min: 2, max: 80 })}
      ${field({ name: "email", label: "Alamat Email", type: "email", placeholder: "nama@email.com", icon: "email", autocomplete: "email", register: true, max: 254 })}
      <div class="auth__password-grid">
        ${field({ name: "password", label: "Kata Sandi", type: "password", placeholder: "Minimal 8 karakter", icon: "lock", autocomplete: "new-password", register: true, min: 8 })}
        ${field({ name: "confirmPassword", label: "Ulangi Sandi", type: "password", placeholder: "Ulangi kata sandi", icon: "shield", autocomplete: "new-password", register: true, min: 8 })}
      </div>
      <div class="auth__agreement">
        <input type="checkbox" id="auth-terms" name="terms" required aria-labelledby="auth-terms-description" aria-describedby="auth-terms-error" data-auth-field />
        <div><p id="auth-terms-description"><label for="auth-terms">Saya menyetujui</label> <button class="auth__inline-link" type="button" data-auth-policy="terms">Syarat &amp; Ketentuan</button> serta <button class="auth__inline-link" type="button" data-auth-policy="privacy">Kebijakan Privasi</button> mobilitas inklusif Accessible Way.</p><p class="auth__error" id="auth-terms-error" hidden></p></div>
      </div>
      ${status()}${submitButton(true)}
    </form>
    <p class="auth__switch auth__switch--register">Sudah memiliki akun? <a href="${base}login/">Masuk di sini</a></p>
  </section>`;
}

export function renderAuth(view) {
  const register = view === "register";

  return `
    <div class="auth auth--${view}"
      data-auth-view="${view}"
      data-figma-node="${register ? "1:355" : "1:283"}">

      <header class="auth__header">
        <div class="auth__header-inner">
          <a class="auth__brand" href="${base}"
            aria-label="Accessible Way — Kembali ke Beranda">
            <span class="auth__brand-mark">
              <img src="${assets}/icons/accessibility.svg"
                alt="" aria-hidden="true" />
            </span>
            <span class="auth__brand-name">Accessible Way</span>
          </a>
        </div>
      </header>

      <main class="auth__stage" id="main-content" tabindex="-1">
        ${register ? registerCard() : loginCard()}
      </main>

      ${!register ? `
        <dialog class="auth__dialog auth__reset"
          aria-labelledby="auth-reset-heading">
          <div class="auth__dialog-header">
            <h2 id="auth-reset-heading">Lupa Kata Sandi?</h2>
            <button class="auth__dialog-close" type="button"
              aria-label="Tutup pemulihan kata sandi"
              data-auth-close autofocus>×</button>
          </div>

          <p>Masukkan alamat email akun Anda untuk meminta panduan pemulihan.</p>

          <form class="auth__reset-form" data-auth-reset-form novalidate>
            <label for="auth-reset-email">Alamat Email</label>
            <input id="auth-reset-email" type="email" name="email"
              required maxlength="254" autocomplete="email"
              placeholder="nama@email.com"
              aria-describedby="auth-reset-error" />
            <p id="auth-reset-error" class="auth__error" hidden></p>
            <p class="auth__status" role="status" aria-live="polite"
              data-auth-reset-status hidden></p>
            <button class="auth__submit" type="submit">
              <span>Kirim Panduan</span>
            </button>
          </form>
        </dialog>
      ` : ""}

      <dialog class="auth__dialog auth__policy"
        aria-labelledby="auth-policy-heading">
        <div class="auth__dialog-header">
          <h2 id="auth-policy-heading"></h2>
          <button class="auth__dialog-close" type="button"
            aria-label="Tutup informasi"
            data-auth-close autofocus>×</button>
        </div>
        <p data-auth-policy-content></p>
        <a class="auth__dialog-contact" href="${base}#kontak">
          Hubungi Tim Accessible Way
        </a>
      </dialog>
    </div>
  `;
}

export function initAuth(root, view) {
  const register = view === "register";
  const form = root.querySelector("[data-auth-form]");
  const fields = [...form.querySelectorAll("[data-auth-field]")];
  const message = root.querySelector("[data-auth-status]");
  const submit = form.querySelector("button[type=submit]");
  const submitLabel = submit.querySelector("[data-auth-submit-label]");
  const defaultLabel = submitLabel.textContent;
  const touched = new Set();
  const events = new AbortController();
  const dialogTriggers = new WeakMap();
  let pending = null, resetPending = null, disposed = false;

  function showStatus(text, kind = "error", focus = false) {
    message.textContent = text; message.dataset.kind = kind; message.hidden = !text;
    if (focus && text) message.focus();
  }
  function fieldError(field) {
    const value = field.value;
    if (field.type === "checkbox") return field.checked ? "" : "Centang persetujuan sebelum melanjutkan.";
    if (!value.trim()) return "Bagian ini wajib diisi.";
    if (field.type === "email" && field.validity.typeMismatch) return "Masukkan alamat email yang valid.";
    if (field.name === "identifier" && value.includes("@") && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Masukkan alamat email atau nama pengguna yang valid.";
    const passwordField = field.name === "password" || field.name === "confirmPassword";
    if (field.minLength > 0 && (passwordField ? value.length : value.trim().length) < field.minLength) return `Gunakan minimal ${field.minLength} karakter.`;
    if (field.maxLength > 0 && value.length > field.maxLength) return `Gunakan maksimal ${field.maxLength} karakter.`;
    if (field.name === "confirmPassword" && value !== form.elements.password.value) return "Konfirmasi kata sandi belum sama.";
    return "";
  }
  function validate(field) {
    const text = fieldError(field), error = root.querySelector(`#${field.id}-error`);
    error.textContent = text; error.hidden = !text;
    if (text) field.setAttribute("aria-invalid", "true"); else field.removeAttribute("aria-invalid");
    return !text;
  }
  for (const field of fields) {
    field.addEventListener("blur", () => { touched.add(field); validate(field); }, { signal: events.signal });
    field.addEventListener("input", () => {
      showStatus("");
      if (touched.has(field)) validate(field);
      if (register && field.name === "password" && touched.has(form.elements.confirmPassword)) validate(form.elements.confirmPassword);
    }, { signal: events.signal });
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
    if (pending) return;
    const invalid = fields.filter(field => { touched.add(field); return !validate(field); });
    if (invalid.length) { showStatus("Periksa kolom yang ditandai sebelum melanjutkan."); invalid[0].focus(); return; }
    const payload = register
      ? { name: form.elements.fullName.value.trim(), email: form.elements.email.value.trim(), password: form.elements.password.value, termsAccepted: form.elements.terms.checked }
      : { identifier: form.elements.identifier.value.trim(), password: form.elements.password.value, remember: form.elements.remember.checked };
    showStatus(""); pending = new AbortController(); submit.disabled = true; form.setAttribute("aria-busy", "true"); submitLabel.textContent = "Memproses...";
    try {
      await requestAuth(register ? "register" : "login", payload, { signal: pending.signal });
      if (disposed) return;
      if (register) {
        for (const name of ["password", "confirmPassword"]) { form.elements[name].value = ""; form.elements[name].type = "password"; }
        for (const button of root.querySelectorAll("[data-password-toggle]")) { button.setAttribute("aria-pressed", "false"); button.setAttribute("aria-label", `Tampilkan ${button.dataset.passwordToggle.endsWith("confirmPassword") ? "konfirmasi kata sandi" : "kata sandi"}`); }
        touched.clear();
        showStatus("Pendaftaran berhasil diproses. Silakan masuk ke akun Anda.", "success", true);
      } else {
        form.elements.password.value = "";
        window.location.assign(authDestination("successPath")?.href ?? base);
      }
    } catch (error) {
      if (!disposed && error.name !== "AbortError") showStatus(error.message, error.code === "unavailable" ? "info" : "error", true);
    } finally {
      if (!disposed) { pending = null; submit.disabled = false; form.removeAttribute("aria-busy"); submitLabel.textContent = defaultLabel; }
    }
  }, { signal: events.signal });
  root.querySelector("[data-auth-google]").addEventListener("click", () => {
    const url = authDestination("googleStartPath");
    if (!url) { showStatus(`${register ? "Pendaftaran" : "Masuk"} dengan Google belum diaktifkan.`, "info", true); return; }
    url.searchParams.set("flow", view); window.location.assign(url.href);
  }, { signal: events.signal });

  for (const dialog of root.querySelectorAll(".auth__dialog")) {
    for (const button of dialog.querySelectorAll("[data-auth-close]")) button.addEventListener("click", () => dialog.close(), { signal: events.signal });
    dialog.addEventListener("click", event => {
      if (event.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
    }, { signal: events.signal });
    dialog.addEventListener("close", () => { if (dialog.classList.contains("auth__reset")) resetPending?.abort(); if (!disposed) dialogTriggers.get(dialog)?.focus(); }, { signal: events.signal });
  }
  for (const button of root.querySelectorAll("[data-auth-policy]")) {
    button.addEventListener("click", () => {
      const type = button.dataset.authPolicy, url = authDestination(type === "terms" ? "termsPath" : "privacyPath");
      if (url) { window.location.assign(url.href); return; }
      const dialog = root.querySelector(".auth__policy"), title = type === "terms" ? "Syarat & Ketentuan" : "Kebijakan Privasi";
      dialog.querySelector("h2").textContent = title;
      dialog.querySelector("[data-auth-policy-content]").textContent = `Dokumen ${title.toLowerCase()} belum dipublikasikan oleh tim Accessible Way. Hubungi tim untuk informasi lebih lanjut.`;
      dialogTriggers.set(dialog, button); dialog.showModal();
    }, { signal: events.signal });
  }
  const forgot = root.querySelector("[data-auth-forgot]");
  if (forgot) {
    const dialog = root.querySelector(".auth__reset"), resetForm = dialog.querySelector("form"), email = resetForm.elements.email;
    const error = dialog.querySelector(".auth__error"), resetStatus = dialog.querySelector("[data-auth-reset-status]"), button = resetForm.querySelector("button[type=submit]");
    forgot.addEventListener("click", () => {
      resetForm.reset(); error.hidden = true; email.removeAttribute("aria-invalid"); resetStatus.hidden = true;
      const identifier = form.elements.identifier.value.trim(); if (identifier.includes("@")) email.value = identifier;
      dialogTriggers.set(dialog, forgot); dialog.showModal();
    }, { signal: events.signal });
    email.addEventListener("input", () => { error.hidden = true; email.removeAttribute("aria-invalid"); resetStatus.hidden = true; }, { signal: events.signal });
    resetForm.addEventListener("submit", async event => {
      event.preventDefault(); if (resetPending) return;
      if (!email.value.trim() || email.validity.typeMismatch) { error.textContent = "Masukkan alamat email yang valid."; error.hidden = false; email.setAttribute("aria-invalid", "true"); email.focus(); return; }
      error.hidden = true; email.removeAttribute("aria-invalid"); resetPending = new AbortController(); button.disabled = true; resetForm.setAttribute("aria-busy", "true");
      try {
        await requestAuth("reset", { email: email.value.trim() }, { signal: resetPending.signal });
        if (!disposed) { resetStatus.textContent = "Jika email tersebut terdaftar, panduan pemulihan akan dikirimkan."; resetStatus.dataset.kind = "success"; resetStatus.hidden = false; }
      } catch (reason) {
        if (!disposed && reason.name !== "AbortError") { resetStatus.textContent = reason.message; resetStatus.dataset.kind = reason.code === "unavailable" ? "info" : "error"; resetStatus.hidden = false; }
      } finally { if (!disposed) { resetPending = null; button.disabled = false; resetForm.removeAttribute("aria-busy"); } }
    }, { signal: events.signal });
  }
  return () => { disposed = true; events.abort(); pending?.abort(); resetPending?.abort(); for (const dialog of root.querySelectorAll(".auth__dialog[open]")) dialog.close(); };
}
