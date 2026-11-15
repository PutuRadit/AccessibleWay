import "../styles/app-header.css";
export function renderAppHeader() {
  const base = import.meta.env.BASE_URL;
  return `<header class="explore-header"><div class="explore-header__inner page-container"><a class="explore-brand" href="${base}" aria-label="Accessible Way — Beranda"><span class="explore-brand__mark"><img src="${base}assets/icons/accessibility.svg" alt="" width="19" height="23" /></span><span class="explore-brand__name">ACCESSIBLE WAY</span></a><nav class="explore-header__actions" aria-label="Akun"><a class="explore-auth explore-auth--primary" href="${base}login/">Login</a><a class="explore-auth explore-auth--secondary" href="${base}register/">Register</a></nav></div></header>`;
}
