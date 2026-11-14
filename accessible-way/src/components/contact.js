import { contactConfig } from "../config/contact.js";

const iconBase = `${import.meta.env.BASE_URL}assets/icons/contact`;
const topics = [
  { value: "pertanyaan", title: "Pertanyaan Proyek", description: "Kenali Accessible Way", icon: "phone", node: "1:198" },
  { value: "masukan", title: "Saran &amp; Masukan", description: "Bagikan pengalaman Anda", icon: "mail", node: "1:207" },
  { value: "kolaborasi", title: "Kolaborasi", description: "Bangun akses bersama", icon: "chat", node: "1:216" },
];
const fields = [
  { name: "name", label: "Nama Lengkap", type: "text", autocomplete: "name", placeholder: "Nama lengkap Anda", max: 80 },
  { name: "email", label: "Alamat Email", type: "email", autocomplete: "email", placeholder: "nama@email.com", max: 254 },
  { name: "building", label: "Nama Gedung / Tempat", type: "text", autocomplete: "organization", placeholder: "Nama gedung atau tempat", max: 120 },
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
      <label for="contact-${field.name}">${field.label}</label>
      <input id="contact-${field.name}" name="${field.name}" type="${field.type}" autocomplete="${field.autocomplete}"
        placeholder="${field.placeholder}" required maxlength="${field.max}" />
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
            <p class="contact__form-intro">Kirim pesan untuk pertanyaan, masukan, atau kolaborasi.</p>
            <form class="contact__form" id="contact-form" novalidate>
              <div class="contact__fields">${fields.map(renderField).join("")}</div>
              <div class="contact__field">
                <label for="contact-message">Catatan atau Pertanyaan</label>
                <textarea id="contact-message" name="message" rows="4" required maxlength="2000"
                  placeholder="Ceritakan pengalaman, pertanyaan, atau ide kolaborasi Anda..."
                  aria-describedby="contact-message-count"></textarea>
                <div class="contact__message-meta"><span id="contact-message-count" data-contact-count>0 / 2000</span></div>
              </div>
              <button class="contact__submit" type="submit" data-figma-node="1:266"><img src="${iconBase}/send.svg" alt="" aria-hidden="true" /><span data-contact-submit-label>Kirim Pesan</span></button>
            </form>
          </div>
        </div>
      </div>

      <dialog class="contact__notice" aria-labelledby="contact-notice-heading" aria-describedby="contact-notice-message">
        <button class="contact__notice-close" type="button" aria-label="Tutup pemberitahuan" data-contact-close>×</button>
        <span class="contact__notice-icon" aria-hidden="true" data-contact-notice-icon>i</span>
        <h2 id="contact-notice-heading" data-contact-notice-heading></h2>
        <p id="contact-notice-message" data-contact-notice-message></p>
        <button class="contact__notice-confirm" type="button" data-contact-close autofocus>Mengerti</button>
      </dialog>
    </section>`;
}

export function initContact(root) {
  const section = root.querySelector(".contact");
  if (!section) return () => {};
  const form = section.querySelector(".contact__form");
  const dialog = section.querySelector(".contact__notice");
  const heading = section.querySelector("[data-contact-notice-heading]");
  const message = section.querySelector("[data-contact-notice-message]");
  const icon = section.querySelector("[data-contact-notice-icon]");
  const submit = form.querySelector("button[type=submit]");
  const submitLabel = submit.querySelector("[data-contact-submit-label]");
  const count = section.querySelector("[data-contact-count]");
  const inputs = [...form.querySelectorAll("input, textarea")];
  const controls = [...form.elements];
  const events = new AbortController();
  let disposed = false, submitting = false, request = null, simulationTimer = 0, focusAfterClose = submit;

  function notice(title, text, state = "info", focusTarget = submit) {
    if (disposed) return;
    heading.textContent = title;
    message.textContent = text;
    icon.textContent = state === "success" ? "✓" : "i";
    dialog.dataset.state = state;
    focusAfterClose = focusTarget;
    if (!dialog.open) dialog.showModal();
  }

  function setSending(value) {
    submitting = value;
    for (const control of controls) control.disabled = value;
    submitLabel.textContent = value ? "Mengirim…" : "Kirim Pesan";
    if (value) form.setAttribute("aria-busy", "true");
    else form.removeAttribute("aria-busy");
  }

  function finishSuccess(simulated = false) {
    form.reset();
    count.textContent = "0 / 2000";
    notice("Pesan terkirim", simulated
      ? "Simulasi pengiriman berhasil. Pesan ini belum dikirim ke tim."
      : "Terima kasih! Pesan Anda sudah diterima.", "success");
  }

  form.elements.namedItem("message").addEventListener("input", event => {
    count.textContent = `${event.target.value.length} / 2000`;
  }, { signal: events.signal });

  form.addEventListener("submit", async event => {
    event.preventDefault();
    if (submitting || disposed) return;

    const missing = inputs.find(field => !field.value.trim());
    if (missing) {
      notice("Lengkapi formulir", "Silakan lengkapi semua kolom sebelum mengirim pesan.", "info", missing);
      return;
    }
    const email = form.elements.namedItem("email");
    if (email.validity.typeMismatch || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      notice("Periksa alamat email", "Masukkan alamat email yang valid sebelum mengirim pesan.", "info", email);
      return;
    }
    const tooLong = inputs.find(field => field.maxLength > 0 && field.value.length > field.maxLength);
    if (tooLong) {
      const label = section.querySelector(`label[for="${tooLong.id}"]`).textContent;
      notice("Periksa panjang isian", `${label} dapat diisi maksimal ${tooLong.maxLength} karakter.`, "info", tooLong);
      return;
    }

    const values = new FormData(form);
    const topic = String(values.get("topic") ?? "");
    if (!topics.some(item => item.value === topic)) {
      notice("Pilih topik pesan", "Pilih salah satu topik sebelum mengirim pesan.", "info", section.querySelector(".contact__topic-input"));
      return;
    }
    if (contactConfig.mode === "simulation") {
      setSending(true);
      simulationTimer = window.setTimeout(() => {
        simulationTimer = 0;
        if (disposed) return;
        finishSuccess(true);
        setSending(false);
      }, 350);
      return;
    }
    const payload = Object.fromEntries(["name", "email", "building", "city", "message"].map(name => [name, String(values.get(name) ?? "").trim()]));
    payload.topic = topic;
    const currentRequest = new AbortController();
    request = currentRequest;
    const timeout = window.setTimeout(() => currentRequest.abort(), 15000);
    setSending(true);
    try {
      const endpoint = String(contactConfig.endpoint ?? "").trim();
      if (!endpoint) throw new Error("Contact endpoint is not configured");
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: currentRequest.signal,
      });
      if (!response.ok) throw new Error("Contact request was rejected");
      const result = await response.json();
      // A generic HTTP 200 / SPA fallback must never count as a sent message.
      if (result?.success !== true) throw new Error("Contact request was not confirmed");
      if (disposed) return;
      finishSuccess();
    } catch {
      if (!disposed) notice("Pesan belum terkirim", "Pesan belum dapat dikirim saat ini. Silakan coba lagi nanti. Isian Anda tetap tersimpan di formulir.", "info");
    } finally {
      window.clearTimeout(timeout);
      if (request === currentRequest) request = null;
      if (!disposed) setSending(false);
    }
  }, { signal: events.signal });

  for (const button of section.querySelectorAll("[data-contact-close]")) {
    button.addEventListener("click", () => dialog.close(), { signal: events.signal });
  }
  dialog.addEventListener("click", event => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  }, { signal: events.signal });
  dialog.addEventListener("close", () => {
    if (!disposed && focusAfterClose?.isConnected) focusAfterClose.focus();
  }, { signal: events.signal });

  return () => {
    if (disposed) return;
    disposed = true;
    window.clearTimeout(simulationTimer);
    request?.abort();
    events.abort();
    if (dialog.open) dialog.close();
  };
}
