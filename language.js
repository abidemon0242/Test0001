/* language.js: small helpers + ALL site text in English and Bangla.
   To change wording, edit the strings below. Every key should exist in "en" (it is the fallback). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const I18N = {
en: {
  n_home:"Home", n_projects:"Projects", n_services:"Services", n_about:"About", n_contact:"Contact", cta_order:"Order a Website", skip:"Skip intro",
  pill:"Introductory pricing available",
  h1a:"Modern Websites.", h1b:"Built For Your Ideas.",
  lead:"I design and build modern, responsive websites for individuals, businesses, creators and new projects.",
  cta_work:"View My Work", or:"Or reach me directly:", call:"Call", wa:"WhatsApp", mail:"Email",
  /* Projects */
  pj_t:"Design Demonstrations", pj_s:"Concept designs that show the range of websites I can build. They are demonstrations, not client work.",
  demo:"Demo Concept", similar:"Discuss a Similar Website",
  t_business:"Business Website", t_portfolio:"Portfolio Website", t_restaurant:"Restaurant Website", t_ecommerce:"E-commerce Website", t_education:"Education Website",
  t_hotel:"Hotel / Travel Website", t_realestate:"Real Estate Website", t_landing:"Landing Page", t_tech:"Technology / Startup", other:"Other",
  d_m1:"Warm, elegant, menu-first design with a table request.",
  d_m2:"Clean, bright storefront that puts products first.",
  d_m3:"Bold dark startup page with a strong call to action.",
  d_m4:"Immersive, photo-led design with a booking bar.",
  d_m5:"Minimal editorial style that lets the work speak.",
  /* Features (used in demos, services and the order form) */
  f_resp:"Responsive design", f_form:"Contact form", f_gallery:"Gallery", f_product:"Product section", f_booking:"Booking / request section",
  f_blog:"Blog / news section", f_anim:"Animation", f_theme:"Dark / light theme", f_custom:"Custom design",
  /* Services */
  sv_t:"Services", sv_s:"Website design and development only, not payment processing or hosting. Pricing depends on your requirements.", sv_cta:"Discuss this service",
  sd_business:"A professional site that presents your business clearly.", sf_business:"Best for: shops, firms, local services",
  sd_portfolio:"A personal site that shows your work and story.", sf_portfolio:"Best for: freelancers, creators, students",
  sd_landing:"One focused page built around a single action.", sf_landing:"Best for: launches, events, offers",
  sd_ecommerce:"Store-style design that presents your products well.", sf_ecommerce:"Best for: small brands and sellers",
  sd_restaurant:"Menu, gallery and table-request layout.", sf_restaurant:"Best for: cafes, restaurants, bakeries",
  sd_custom:"A unique design shaped around your own idea.", sf_custom:"Best for: anything that needs its own identity",
  /* About */
  ab_t:"Building Modern Websites, One Project at a Time",
  ab_p1:"I'm a web developer focused on creating modern, responsive and practical websites for individuals, businesses and new ideas.",
  ab_p2:"As an independent developer at the beginning of my professional journey, I work closely with every client personally. A website should not only look good. It should represent the person or business behind it, communicate clearly and give visitors a smooth experience.",
  why_t:"Why Work With Me?",
  w1t:"Personal Attention", w1:"Your project isn't passed between a large team. You talk directly with me throughout the process.",
  w2t:"Modern & Customized", w2:"Each project is built around your requirements, so it can have its own identity.",
  w3t:"Introductory Pricing", w3:"I'm building my portfolio, so introductory pricing is available for a limited time. Regular pricing may increase as my experience and demand grow.",
  w4t:"Focused on Growth", w4:"Every project helps me improve. My goal is to build strong skills and deliver genuinely useful websites.",
  /* Order form */
  or_t:"Order a Website", or_s:"Tell me what you need. No payment is taken online. Price and next steps are discussed with you directly.",
  f_type:"Website type", f_feat:"Features you want", f_desc:"Describe what you want", f_name:"Name", f_phone:"Phone number", f_wa:"WhatsApp number",
  f_mail:"Email", f_pref:"Preferred contact method", f_extra:"Additional information",
  f_review:"Review my request", rv_t:"Review your request", f_edit:"Edit", f_send:"Send request", sending:"Sending…",
  e_req:"This field is required.", e_mail:"Enter a valid email address.", e_ct:"Give at least one way to contact you.",
  done_t:"Thanks for your request. I'll review your requirements and contact you to discuss the project, pricing, and next steps.",
  nocfg:"The online form isn't connected yet. Please send this request by WhatsApp or Email instead.",
  e_net:"Could not send. Please use the WhatsApp or Email buttons below.",
  /* Contact + footer */
  ct_t:"Have an Idea?", ct_s:"Whether you have a full plan or only a basic idea, let's talk about requirements, design, features, timeline and budget before you decide. Final pricing is agreed directly with me.",
  ft_d:"Independent web developer creating modern, responsive websites.", rights:"All rights reserved."
},
bn: {
  n_home:"হোম", n_projects:"প্রজেক্ট", n_services:"সেবা", n_about:"পরিচিতি", n_contact:"যোগাযোগ", cta_order:"ওয়েবসাইট অর্ডার করুন", skip:"ইন্ট্রো বাদ দিন",
  pill:"এখন ইন্ট্রোডাক্টরি প্রাইসিং চলছে",
  h1a:"আধুনিক ওয়েবসাইট।", h1b:"আপনার আইডিয়ার জন্য তৈরি।",
  lead:"ব্যক্তি, ব্যবসা, ক্রিয়েটর ও নতুন প্রজেক্টের জন্য আমি আধুনিক ও রেসপনসিভ ওয়েবসাইট ডিজাইন ও ডেভেলপ করি।",
  cta_work:"আমার কাজ দেখুন", or:"অথবা সরাসরি যোগাযোগ করুন:", call:"কল", wa:"হোয়াটসঅ্যাপ", mail:"ইমেইল",
  pj_t:"ডিজাইন ডেমো", pj_s:"আমি কী ধরনের ওয়েবসাইট বানাতে পারি তা দেখানোর কনসেপ্ট ডিজাইন। এগুলো ক্লায়েন্টের কাজ নয়, শুধু ডেমো।",
  demo:"ডেমো কনসেপ্ট", similar:"অনুরূপ ওয়েবসাইট নিয়ে কথা বলুন",
  t_business:"ব্যবসায়িক ওয়েবসাইট", t_portfolio:"পোর্টফোলিও ওয়েবসাইট", t_restaurant:"রেস্টুরেন্ট ওয়েবসাইট", t_ecommerce:"ই-কমার্স ওয়েবসাইট", t_education:"শিক্ষামূলক ওয়েবসাইট",
  t_hotel:"হোটেল / ট্রাভেল ওয়েবসাইট", t_realestate:"রিয়েল এস্টেট ওয়েবসাইট", t_landing:"ল্যান্ডিং পেজ", t_tech:"টেকনোলজি / স্টার্টআপ", other:"অন্যান্য",
  d_m1:"উষ্ণ ও মার্জিত, মেনু-কেন্দ্রিক ডিজাইন; টেবিল রিকোয়েস্টসহ।",
  d_m2:"পণ্যকে সামনে রাখা পরিচ্ছন্ন ও উজ্জ্বল স্টোরফ্রন্ট।",
  d_m3:"শক্তিশালী কল-টু-অ্যাকশনসহ গাঢ় স্টার্টআপ পেজ।",
  d_m4:"ছবি-নির্ভর আকর্ষণীয় ডিজাইন; বুকিং বারসহ।",
  d_m5:"মিনিমাল এডিটোরিয়াল স্টাইল, যেখানে কাজই কথা বলে।",
  f_resp:"রেসপনসিভ ডিজাইন", f_form:"কন্টাক্ট ফর্ম", f_gallery:"গ্যালারি", f_product:"প্রোডাক্ট সেকশন", f_booking:"বুকিং / রিকোয়েস্ট সেকশন",
  f_blog:"ব্লগ / নিউজ সেকশন", f_anim:"অ্যানিমেশন", f_theme:"ডার্ক / লাইট থিম", f_custom:"কাস্টম ডিজাইন",
  sv_t:"সেবাসমূহ", sv_s:"শুধু ওয়েবসাইট ডিজাইন ও ডেভেলপমেন্ট; পেমেন্ট প্রসেসিং বা হোস্টিং নয়। মূল্য আপনার চাহিদার ওপর নির্ভর করে।", sv_cta:"এই সেবা নিয়ে কথা বলুন",
  sd_business:"আপনার ব্যবসাকে স্পষ্টভাবে তুলে ধরার পেশাদার সাইট।", sf_business:"উপযোগী: দোকান, প্রতিষ্ঠান, স্থানীয় সেবা",
  sd_portfolio:"আপনার কাজ ও পরিচয় দেখানোর ব্যক্তিগত সাইট।", sf_portfolio:"উপযোগী: ফ্রিল্যান্সার, ক্রিয়েটর, শিক্ষার্থী",
  sd_landing:"একটি নির্দিষ্ট কাজের জন্য ফোকাসড এক-পেজ সাইট।", sf_landing:"উপযোগী: লঞ্চ, ইভেন্ট, অফার",
  sd_ecommerce:"পণ্য সুন্দরভাবে দেখানোর স্টোর-স্টাইল ডিজাইন।", sf_ecommerce:"উপযোগী: ছোট ব্র্যান্ড ও বিক্রেতা",
  sd_restaurant:"মেনু, গ্যালারি ও টেবিল-রিকোয়েস্ট লেআউট।", sf_restaurant:"উপযোগী: ক্যাফে, রেস্টুরেন্ট, বেকারি",
  sd_custom:"আপনার নিজস্ব আইডিয়া অনুযায়ী অনন্য ডিজাইন।", sf_custom:"উপযোগী: নিজস্ব পরিচয় দরকার এমন যেকোনো কাজ",
  ab_t:"একেকটি প্রজেক্টে গড়ে তুলছি আধুনিক ওয়েবসাইট",
  ab_p1:"আমি একজন ওয়েব ডেভেলপার; ব্যক্তি, ব্যবসা ও নতুন আইডিয়ার জন্য আধুনিক, রেসপনসিভ ও ব্যবহারযোগ্য ওয়েবসাইট তৈরি করি।",
  ab_p2:"পেশাদার যাত্রার শুরুতে থাকা স্বাধীন ডেভেলপার হিসেবে আমি প্রত্যেক ক্লায়েন্টের সঙ্গে ব্যক্তিগতভাবে কাজ করি। ওয়েবসাইট শুধু সুন্দর দেখালেই হয় না; এটি ব্যক্তি বা ব্যবসাকে তুলে ধরবে, স্পষ্টভাবে কথা বলবে এবং ভিজিটরকে সহজ অভিজ্ঞতা দেবে।",
  why_t:"কেন আমার সঙ্গে কাজ করবেন?",
  w1t:"ব্যক্তিগত মনোযোগ", w1:"আপনার প্রজেক্ট বড় টিমের হাতে হাতে ঘোরে না। পুরো সময় সরাসরি আমার সঙ্গে কথা বলতে পারবেন।",
  w2t:"আধুনিক ও কাস্টমাইজড", w2:"প্রতিটি প্রজেক্ট আপনার চাহিদা অনুযায়ী তৈরি, তাই প্রত্যেকটির নিজস্ব পরিচয় থাকে।",
  w3t:"ইন্ট্রোডাক্টরি প্রাইসিং", w3:"আমি এখন পোর্টফোলিও তৈরি করছি, তাই সীমিত সময়ের জন্য ইন্ট্রোডাক্টরি প্রাইসিং আছে। অভিজ্ঞতা ও চাহিদা বাড়লে নিয়মিত মূল্য বাড়তে পারে।",
  w4t:"উন্নতির দিকে মনোযোগ", w4:"প্রতিটি প্রজেক্ট আমাকে আরও ভালো করে। লক্ষ্য হলো দক্ষতা বাড়ানো এবং সত্যিই কাজে লাগে এমন ওয়েবসাইট দেওয়া।",
  or_t:"ওয়েবসাইট অর্ডার করুন", or_s:"আপনার প্রয়োজন জানান। অনলাইনে কোনো পেমেন্ট নেওয়া হয় না; মূল্য ও পরবর্তী ধাপ সরাসরি আলোচনা করে ঠিক হবে।",
  f_type:"ওয়েবসাইটের ধরন", f_feat:"যেসব ফিচার চান", f_desc:"আপনি কী চান লিখুন", f_name:"নাম", f_phone:"ফোন নম্বর", f_wa:"হোয়াটসঅ্যাপ নম্বর",
  f_mail:"ইমেইল", f_pref:"পছন্দের যোগাযোগ মাধ্যম", f_extra:"অতিরিক্ত তথ্য",
  f_review:"অনুরোধ যাচাই করুন", rv_t:"আপনার অনুরোধ দেখে নিন", f_edit:"সম্পাদনা", f_send:"অনুরোধ পাঠান", sending:"পাঠানো হচ্ছে…",
  e_req:"এই ঘরটি পূরণ করুন।", e_mail:"সঠিক ইমেইল ঠিকানা দিন।", e_ct:"যোগাযোগের অন্তত একটি উপায় দিন।",
  done_t:"আপনার অনুরোধের জন্য ধন্যবাদ। আমি আপনার চাহিদা দেখে প্রজেক্ট, মূল্য ও পরবর্তী ধাপ নিয়ে আলোচনার জন্য যোগাযোগ করব।",
  nocfg:"অনলাইন ফর্ম এখনো যুক্ত হয়নি। অনুগ্রহ করে অনুরোধটি হোয়াটসঅ্যাপ বা ইমেইলে পাঠান।",
  e_net:"পাঠানো যায়নি। অনুগ্রহ করে নিচের হোয়াটসঅ্যাপ বা ইমেইল ব্যবহার করুন।",
  ct_t:"আপনার কোনো আইডিয়া আছে?", ct_s:"পুরো পরিকল্পনা থাকুক বা শুধু একটি ধারণা, সিদ্ধান্তের আগে চাহিদা, ডিজাইন, ফিচার, সময় ও বাজেট নিয়ে কথা বলি। চূড়ান্ত মূল্য সরাসরি আমার সঙ্গে ঠিক হবে।",
  ft_d:"আধুনিক ও রেসপনসিভ ওয়েবসাইট তৈরি করেন এমন স্বাধীন ওয়েব ডেভেলপার।", rights:"সর্বস্বত্ব সংরক্ষিত।"
}
};

let LANG = "en";
const t = k => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;

/* Fills every element that has data-i18n="key", updates <html lang>, remembers the choice. */
function applyLang(l) {
  LANG = I18N[l] ? l : "en";
  try { localStorage.setItem("lang", LANG); } catch (e) {}
  document.documentElement.lang = LANG;
  $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
  $("#lang").textContent = LANG === "en" ? "বাংলা" : "English";
  document.dispatchEvent(new Event("langchange"));
}
