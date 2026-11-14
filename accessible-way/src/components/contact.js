import { contactConfig } from "../config/contact.js";

const iconBase = `${import.meta.env.BASE_URL}assets/icons/contact`;
const topics = [
  { value: "pertanyaan", title: "Pertanyaan Proyek", description: "Kenali Accessible Way", icon: "phone", node: "1:198" },
  { value: "masukan", title: "Saran &amp; Masukan", description: "Bagikan pengalaman Anda", icon: "mail", node: "1:207" },
  { value: "kolaborasi", title: "Kolaborasi", description: "Bangun akses bersama", icon: "chat", node: "1:216" },
];
const fields = [
  { name: "name", label: "Nama Lengkap", type: "text", autocomplete: "name", placeholder: "Nama lengkap Anda", required: true, min: 2, max: 80 },
  { name: "email", label: "Alamat Email", type: "email", autocomplete: "email", placeholder: "nama@email.com", required: true, max: 254 },
  { name: "building", label: "Nama Gedung / Tempat", type: "text", autocomplete: "organization", placeholder: "Contoh: rumah sakit atau kampus", max: 120 },
  { name: "city", label: "Kota / Lokasi", type: "text", autocomplete: "address-level2", placeholder: "Kota atau lokasi Anda", max: 100 },
];

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function configuredEmail() {
  const email = String(contactConfig.email ?? "").trim();
  return /^[^\s@<>"\\]+@[^\s@<>"\\]+\.[^\s@<>"\\]+$/.test(email) ? email : "";
}

function renderField(field) {
  return `
    <div class="contact__field">
      <label for="contact-${field.name}">${field.label}${field.required ? ' <span aria-hidden="true">*</span>' : ' <span class="contact__optional">(opsional)</span>'}</label>
      <input id="contact-${field.name}" name="${field.name}" type="${field.type}" autocomplete="${field.autocomplete}"
        placeholder="${field.placeholder}" ${field.required ? "required" : ""} ${field.min ? `minlength="${field.min}"` : ""}
        maxlength="${field.max}" aria-describedby="contact-${field.name}-error" />
      <p class="contact__error" id="contact-${field.name}-error" hidden></p>
    </div>`;
}

export function renderContact() {
  const email = configuredEmail();
  return `
    <section class="contact" id="kontak" aria-labelledby="contact-heading" data-figma-node="1:186">
      <div class="page-container">
        <div class="contact__layout" data-figma-node="1:187">
          <div class="contact__info" data-figma-node="1:188">
            <div>
              <div class="contact__copy">
                <p class="contact__badge" data-figma-node="1:190"><img src="${iconBase}/help.svg" alt="" aria-hidden="true" /><span>Hubungi Kami</span></p>
                <h2 class="contact__heading" id="contact-heading">Mari Terhubung.</h2>
                <p class="contact__intro">Bagikan pertanyaan, pengalaman aksesibilitas, atau ide kolaborasi
                  untuk membantu pengembangan Accessible Way.</p>
              </div>
              <fieldset class="contact__topics">
                <legend class="contact__sr-only">Pilih topik pesan</legend>
                ${topics.map((topic, index) => `
                  <label class="contact__topic" data-figma-node="${topic.node}">
                    <input class="contact__topic-input" type="radio" name="topic" value="${topic.value}" form="contact-form" ${index === 0 ? "checked" : ""} />
                    <span class="contact__tile">
                      <span class="contact__topic-icon"><img src="${iconBase}/${topic.icon}.svg" alt="" aria-hidden="true" /></span>
                      <span class="contact__topic-copy"><span class="contact__topic-title">${topic.title}</span><span class="contact__topic-description">${topic.description}</span></span>
                    </span>
                  </label>
                `).join("")}
              </fieldset>
            </div>
            <div class="contact__info-note">
              <p>Pilih topik di atas, lalu ceritakan pertanyaan atau masukan Anda melalui formulir.</p>
              ${email ? `<a class="contact__direct-email" href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>` : ""}
            </div>
          </div>

          <div class="contact__panel" data-figma-node="1:227">
            <h3 class="contact__form-heading">Pesan untuk Tim Accessible Way</h3>
            <p class="contact__form-intro">Siapkan pesan untuk pertanyaan, masukan, atau kolaborasi.</p>
            <form class="contact__form" id="contact-form" novalidate>
              <div class="contact__fields">${fields.map(renderField).join("")}</div>
              <div class="contact__field">
                <label for="contact-message">Catatan atau Pertanyaan <span aria-hidden="true">*</span></label>
                <textarea id="contact-message" name="message" rows="4" required minlength="10" maxlength="2000"
                  placeholder="Ceritakan pengalaman, pertanyaan, atau ide kolaborasi Anda..."
                  aria-describedby="contact-message-error contact-message-count"></textarea>
                <div class="contact__message-meta"><p class="contact__error" id="contact-message-error" hidden></p><span id="contact-message-count" data-contact-count>0 / 2000</span></div>
              </div>
              <p class="contact__form-status" role="alert" hidden data-contact-error-summary></p>
              <button class="contact__submit" type="submit" data-figma-node="1:266"><img src="${iconBase}/send.svg" alt="" aria-hidden="true" /><span>Tinjau Pesan</span></button>
              <p class="contact__form-note">* Wajib diisi. Anda dapat meninjau pesan sebelum melanjutkan.</p>
            </form>
          </div>
        </div>
      </div>

      <dialog class="contact__review" aria-labelledby="contact-review-heading" aria-describedby="contact-review-description">
        <div class="contact__review-header"><h2 id="contact-review-heading">Tinjau Pesan Anda</h2><button class="contact__close" type="button" aria-label="Tutup pratinjau pesan" data-contact-close autofocus>×</button></div>
        <p id="contact-review-description">Periksa kembali nama, alamat email, dan isi pesan Anda.</p>
        <label class="contact__sr-only" for="contact-draft">Draf pesan</label>
        <textarea class="contact__draft" id="contact-draft" readonly rows="10"></textarea>
        <p class="contact__delivery-note">${email ? `Penerima: <strong>${escapeHtml(email)}</strong>. Pesan dikirim setelah Anda menekan Kirim di aplikasi email.` : "Alamat email tim belum ditambahkan. Anda dapat menyalin draf ini; pesan belum dikirim."}</p>
        <div class="contact__review-actions">
          <button type="button" class="contact__copy-button" data-contact-copy>Salin Pesan</button>
          ${email ? '<a class="contact__email-button" data-contact-email>Buka Draf Email</a>' : ""}
          <button type="button" class="contact__edit-button" data-contact-close>Kembali ke Formulir</button>
        </div>
        <p class="contact__copy-status" role="status" aria-live="polite" data-contact-copy-status></p>
      </dialog>
    </section>`;
}

export function initContact(root) {
  const section = root.querySelector(".contact");
  if (!section) return () => {};
  const form = section.querySelector(".contact__form");
  const dialog = section.querySelector(".contact__review");
  const draft = section.querySelector(".contact__draft");
  const status = section.querySelector("[data-contact-copy-status]");
  const summary = section.querySelector("[data-contact-error-summary]");
  const count = section.querySelector("[data-contact-count]");
  const inputs = [...form.querySelectorAll("input, textarea")];
  const touched = new Set();
  const events = new AbortController();
  let disposed = false;

  function validate(field) {
    const value = field.value.trim();
    let message = "";
    if (field.required && !value) message = "Bagian ini wajib diisi.";
    else if (field.type === "email" && value && field.validity.typeMismatch) message = "Masukkan alamat email yang valid.";
    else if (value && field.minLength > 0 && value.length < field.minLength) message = `Masukkan setidaknya ${field.minLength} karakter.`;
    else if (field.maxLength > 0 && value.length > field.maxLength) message = `Gunakan maksimal ${field.maxLength} karakter.`;
    const error = section.querySelector(`#${field.id}-error`);
    error.textContent = message;
    error.hidden = !message;
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
    return !message;
  }

  for (const field of inputs) {
    field.addEventListener("blur", () => { touched.add(field); validate(field); }, { signal: events.signal });
    field.addEventListener("input", () => {
      if (touched.has(field)) validate(field);
      if (field.name === "message") count.textContent = `${field.value.length} / 2000`;
      summary.hidden = true;
    }, { signal: events.signal });
  }

  form.addEventListener("submit", event => {
    event.preventDefault();
    const invalid = inputs.filter(field => { touched.add(field); return !validate(field); });
    if (invalid.length) {
      summary.textContent = "Periksa kolom yang ditandai, lalu tinjau pesan kembali.";
      summary.hidden = false;
      invalid[0].focus();
      return;
    }
    summary.hidden = true;
    const values = new FormData(form);
    const topic = topics.find(item => item.value === values.get("topic"));
    const topicTitle = (topic?.title ?? "Pertanyaan Proyek").replace("&amp;", "&");
    const value = name => String(values.get(name) ?? "").trim();
    draft.value = `Topik: ${topicTitle}\nNama: ${value("name")}\nEmail: ${value("email")}\nGedung / Tempat: ${value("building") || "-"}\nKota / Lokasi: ${value("city") || "-"}\n\n${value("message")}`;
    const emailLink = section.querySelector("[data-contact-email]");
    if (emailLink) emailLink.href = `mailto:${configuredEmail()}?subject=${encodeURIComponent(`[Accessible Way] ${topicTitle}`)}&body=${encodeURIComponent(draft.value)}`;
    status.textContent = "";
    if (!dialog.open) dialog.showModal();
  }, { signal: events.signal });

  for (const button of section.querySelectorAll("[data-contact-close]")) {
    button.addEventListener("click", () => dialog.close(), { signal: events.signal });
  }
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }, { signal: events.signal });
  dialog.addEventListener("close", () => { if (!disposed) form.querySelector("button[type=submit]").focus(); }, { signal: events.signal });
  section.querySelector("[data-contact-copy]").addEventListener("click", async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(draft.value);
      if (!disposed) status.textContent = "Pesan berhasil disalin. Pesan belum dikirim.";
    } catch {
      if (disposed) return;
      draft.focus();
      draft.select();
      status.textContent = "Teks sudah dipilih. Gunakan perintah Salin pada perangkat Anda.";
    }
  }, { signal: events.signal });

  return () => { disposed = true; events.abort(); if (dialog.open) dialog.close(); };
}
