/* main.js: settings, demo + service data, and page behaviour. */

/* ===== SETTINGS: change your contact details and form service here ===== */
const SITE = {
  phone: "01406512541",                 // used for the Call button (tel:)
  wa: "8801406512541",                  // WhatsApp: country code 880 + number WITHOUT the leading 0
  email: "abidemon0242@gmail.com",
  formEndpoint: "https://formspree.io/f/YOUR_FORM_ID"   // replace with your own form-service URL (see README)
};

/* ===== DEMO WEBSITES: m = mockup style (.m1 to .m5 in css/style.css), c = category key,
   pre = order-form type it preselects, f = feature keys, h = mockup markup ===== */
const PROJECTS = [
  { n:"Ember &amp; Oak", m:"m1", c:"restaurant", pre:"restaurant", f:["booking","gallery","anim"],
    h:'<h6>Ember &amp; Oak</h6><i class="ln"></i><i class="ln"></i><i class="bt"></i><i class="pl"></i>' },
  { n:"Kartly", m:"m2", c:"ecommerce", pre:"ecommerce", f:["product","resp","theme"],
    h:'<i class="bar"></i>' + '<i class="t"></i>'.repeat(8) },
  { n:"Nimbus", m:"m3", c:"tech", pre:"landing", f:["anim","form","theme"],
    h:'<h6>Ship faster.</h6><i class="ln"></i><i class="ln"></i><i class="bt"></i><i class="cd"></i>' },
  { n:"Azure Bay", m:"m4", c:"hotel", pre:"hotel", f:["booking","gallery","resp"],
    h:'<h6>Azure Bay</h6><i class="sun"></i><i class="bk"></i>' },
  { n:"Maya Rowan", m:"m5", c:"portfolio", pre:"portfolio", f:["gallery","custom","form"],
    h:'<h6>Maya<br>Rowan</h6><i class="ln"></i><i class="th"></i><i class="th"></i><i class="th"></i>' }
];

/* ===== SERVICES: [key, feature keys]. Text comes from sd_<key> / sf_<key> in js/language.js ===== */
const SERVICES = [
  ["business", ["resp","form","gallery"]], ["portfolio", ["resp","gallery","theme"]],
  ["landing", ["resp","form","anim"]], ["ecommerce", ["product","resp","custom"]],
  ["restaurant", ["gallery","booking","resp"]], ["custom", ["custom","anim","theme"]]
];

/* ===== Card builders (text is filled in later by applyLang via data-i18n) ===== */
const chips = a => '<ul class="chips">' + a.map(k => `<li data-i18n="f_${k}"></li>`).join("") + "</ul>";
const mock = (p, attrs = "") => `<div class="mock ${p.m}"${attrs}><div class="scr" aria-hidden="true">${p.h}</div><span class="tag" data-i18n="demo"></span></div>`;
const pCard = p => `<article class="card rv">${mock(p, ` role="img" aria-label="${p.n}"`)}<h3>${p.n}</h3><p class="cat" data-i18n="t_${p.c}"></p><p data-i18n="d_${p.m}"></p>${chips(p.f)}<a class="btn ghost" href="#order" data-pre="${p.pre}" data-i18n="similar"></a></article>`;
const sCard = ([k, f]) => `<article class="card rv"><h3 data-i18n="${k === "custom" ? "f_custom" : "t_" + k}"></h3><p data-i18n="sd_${k}"></p><p class="for" data-i18n="sf_${k}"></p>${chips(f)}<a class="btn ghost" href="#order" data-pre="${k === "custom" ? "other" : k}" data-i18n="sv_cta"></a></article>`;

/* Call / WhatsApp / Email links come from SITE, so you only edit them in one place */
function setContacts() {
  const msg = encodeURIComponent("Hello Abid's Web Studio, I'd like to talk about a website.");
  const href = { call: "tel:" + SITE.phone, wa: `https://wa.me/${SITE.wa}?text=${msg}`, mail: "mailto:" + SITE.email };
  $$("[data-c]").forEach(a => { a.href = href[a.dataset.c]; });
  $$("[data-v]").forEach(e => { e.textContent = SITE[e.dataset.v]; });
}

/* Fade elements in as they scroll into view */
function reveal() {
  const els = $$(".rv");
  if (!("IntersectionObserver" in window)) { els.forEach(e => e.classList.add("in")); return; }
  const io = new IntersectionObserver(list => list.forEach(x => {
    if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); }
  }), { threshold: .12 });
  els.forEach(e => io.observe(e));
}

/* Intro: plays once per visit (~3s), can be skipped, and is skipped for reduced-motion users */
function runIntro() {
  const el = $("#intro");
  let seen = false;
  try { seen = sessionStorage.getItem("introSeen"); } catch (e) {}
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || seen) { el.remove(); reveal(); return; }
  try { sessionStorage.setItem("introSeen", "1"); } catch (e) {}
  document.body.classList.add("lock");
  let over = false;
  const end = () => {
    if (over) return;
    over = true;
    el.classList.add("done");
    document.body.classList.remove("lock");
    reveal();
    setTimeout(() => el.remove(), 800);
  };
  $("#skip").onclick = end;
  setTimeout(end, 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  $("#pgrid").innerHTML = PROJECTS.map(pCard).join("");
  $("#sgrid").innerHTML = SERVICES.map(sCard).join("");
  $("#hstack").innerHTML = [2, 0, 3].map(i => mock(PROJECTS[i])).join("");
  $("#why").innerHTML = [1, 2, 3, 4].map(i => `<div class="card rv"><h4 data-i18n="w${i}t"></h4><p data-i18n="w${i}"></p></div>`).join("");
  buildOrder();
  setContacts();
  $("#yr").textContent = new Date().getFullYear();

  let saved = "en";
  try { saved = localStorage.getItem("lang") || "en"; } catch (e) {}
  applyLang(saved);
  $("#lang").onclick = () => applyLang(LANG === "en" ? "bn" : "en");

  // Mobile menu
  const nav = $("#nav"), burger = $("#burger"), hd = $("header");
  const menu = open => { nav.classList.toggle("open", open); burger.setAttribute("aria-expanded", open); };
  burger.onclick = () => menu(!nav.classList.contains("open"));
  nav.addEventListener("click", e => { if (e.target.closest("a")) menu(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") menu(false); });
  addEventListener("scroll", () => hd.classList.toggle("sc", scrollY > 10), { passive: true });

  // "Discuss a similar website" / "Discuss this service" preselect the website type in the form
  document.addEventListener("click", e => {
    const a = e.target.closest("[data-pre]");
    if (a) $("#type").value = a.dataset.pre;
  });

  runIntro();
});
