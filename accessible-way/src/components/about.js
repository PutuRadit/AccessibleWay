const assetBase = `${import.meta.env.BASE_URL}assets`;

const featureIcons = {
  location: '<path d="M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  access: '<circle cx="12" cy="4" r="2"/><path d="M4 8.5 12 10l8-1.5M12 10v5m0 0-4 6m4-6 4 6"/>',
  map: '<path d="m9 3 6 3 6-3v15l-6 3-6-3-6 3V6l6-3Zm0 0v15m6-12v15"/>',
  route: '<circle cx="6" cy="5" r="2"/><circle cx="18" cy="19" r="2"/><path d="M6 7v7a4 4 0 0 0 4 4h2m-2-7h4a4 4 0 0 0 4-4V3m-6 12 3 3-3 3"/>',
};

function featureIcon(name) {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${featureIcons[name]}</svg>`;
}

const features = [
  { icon: "location", title: "Informasi lokasi", description: "Kenali gedung dan fasilitas yang tersedia sebelum memulai kunjungan." },
  { icon: "access", title: "Fasilitas aksesibilitas", description: "Lihat informasi lift, ramp, dan fasilitas pendukung kebutuhan mobilitas." },
  { icon: "map", title: "Denah digital", description: "Jelajahi denah setiap lantai pada studi kasus rumah sakit tiga lantai." },
  { icon: "route", title: "Panduan rute indoor", description: "Temukan rute menuju ruangan dengan mempertimbangkan akses lift dan ramp." },
];

const members = [
  { id: "anisa", initials: "AD", name: "Anisa Dwi Ramahdani", photo: "anisa.webp" },
  { id: "putu", initials: "PR", name: "Putu Radit Ardika", photo: "putu.webp" },
  { id: "farel", initials: "MF", name: "M Farel Raditya Wicaksono", photo: "farel.webp" },
];

export function renderAbout() {
  return `
    <section class="about" id="tentang-kami" aria-labelledby="about-heading">
      <div class="about__inner page-container">
        <div class="about__card">
          <div class="about__intro">
            <div class="about__copy">
              <p class="about__badge">
                <img src="${assetBase}/icons/about-collaboration.svg" alt="" aria-hidden="true" />
                <span>Tentang Accessible Way</span>
              </p>
              <h2 class="about__heading" id="about-heading">
                Indoor Navigation untuk <span>Mobilitas yang Inklusif</span>
              </h2>
              <p class="about__body">
                Accessible Way merupakan aplikasi web yang membantu individu dengan
                keterbatasan mobilitas (<i lang="en">mobility impairments</i>) menemukan
                lokasi, mengakses fasilitas, dan bernavigasi di dalam gedung secara
                lebih mudah, mandiri, dan nyaman.
              </p>
              <ul class="about__scope" aria-label="Fokus proyek">
                <li>Navigasi Dalam Gedung</li>
                <li>Informasi AKsesibilitas</li>
                <li>Mobilitas Mandiri</li>
              </ul>
            </div>
            <figure class="about__showcase">
              <div class="about__photo-frame">
                <img class="about__photo" src="${assetBase}/images/about-inclusive-collaboration.webp"
                  alt="Tiga orang berdiskusi di meja kerja, termasuk seorang pengguna kursi roda."
                  width="1200" height="800" loading="lazy" decoding="async" />
                <p class="about__photo-note" aria-hidden="true">
                  <span class="about__photo-mark">${featureIcon("access")}</span>
                  <span>Ruang untuk semua.<small>Bergerak bersama, lebih mandiri.</small></span>
                </p>
              </div>
            </figure>
          </div>

          <div class="about__story">
            <article class="about__story-card">
              <p class="about__eyebrow"><span aria-hidden="true">01</span> Latar belakang</p>
              <h3>Menemukan ruangan bisa menjadi tantangan.</h3>
              <p>Mengetahui letak ruangan dan akses antarlantai dapat menjadi tantangan bagi
                individu dengan keterbatasan mobilitas. Informasi tentang denah, lift, dan
                ramp membantu pengguna merencanakan pergerakan di dalam gedung.</p>
            </article>
            <article class="about__story-card about__story-card--mission">
              <p class="about__eyebrow"><span aria-hidden="true">02</span> Misi kami</p>
              <h3>Lebih mudah, Lebih mandiri, Lebih nyaman.</h3>
              <p>Kami mengembangkan teknologi navigasi dalam ruangan yang inklusif untuk
                mendukung lingkungan yang lebih mudah diakses dan kemandirian setiap
                individu dalam menjalani kunjungannya.</p>
            </article>
          </div>
        </div>

        <div class="about__features" role="group" aria-labelledby="about-features-heading">
          <div class="about__section-header about__features-header">
            <p class="about__eyebrow">Apa yang kami tawarkan</p>
            <h3 id="about-features-heading">Informasi yang membantu setiap langkah.</h3>
            <p>Dari mengenal gedung hingga menemukan rute menuju ruangan tujuan.</p>
          </div>
          <ul class="about__feature-grid">
            ${features.map(feature => `
              <li class="about__feature">
                <span class="about__feature-icon">${featureIcon(feature.icon)}</span>
                <h4>${feature.title}</h4>
                <p>${feature.description}</p>
              </li>
            `).join("")}
          </ul>
        </div>

        <div class="about__team-frame" role="group" aria-labelledby="about-team-heading">
          <div class="about__section-header about__team-header">
            <p class="about__eyebrow">Tim pengembang</p>
            <h3 id="about-team-heading">Kenali tim di balik Accessible Way.</h3>
            <p>Bergerak bersama untuk mobilitas yang lebih inklusif.</p>
          </div>
          <ul class="about__team">
            ${members.map(member => `
              <li class="about__member">
                <span class="about__avatar about__avatar--${member.id}" aria-hidden="true">
                  <span>${member.initials}</span>
                  <img src="${assetBase}/images/team/${member.photo}" alt="" loading="lazy" decoding="async" />
                </span>
                <h4>${member.name}</h4>
              </li>
            `).join("")}
          </ul>
          <p class="about__tagline"><strong>Accessible Way</strong><span aria-hidden="true"> — </span><span lang="en">Inclusive Mobility Through Technology.</span></p>
        </div>
      </div>
    </section>
  `;
}
