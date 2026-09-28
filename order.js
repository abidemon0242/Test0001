/* order.js: builds the order form, validates it, shows a review, then sends it.
   The send address lives in SITE.formEndpoint (js/main.js). */
const TYPES = ["business","portfolio","restaurant","ecommerce","education","hotel","realestate","landing","other"];
const FEATS = ["resp","form","gallery","product","booking","blog","anim","theme","custom","other"];
const tk = k => k === "other" ? "other" : "t_" + k;   // translation key for a website type
const fk = k => k === "other" ? "other" : "f_" + k;   // translation key for a feature
const val = id => $("#" + id).value.trim();
let DATA = null;                                       // the request being reviewed

const fld = (id, key, type, ac) =>
  `<div class="fld"><label for="${id}" data-i18n="${key}"></label><input id="${id}" name="${id}" type="${type}" autocomplete="${ac}"><small class="err" id="e_${id}" role="alert"></small></div>`;

function buildOrder() {
  $("#oform").innerHTML = `
    <div class="fld"><label for="type" data-i18n="f_type"></label>
      <select id="type" name="type">${TYPES.map(k => `<option value="${k}" data-i18n="${tk(k)}"></option>`).join("")}</select></div>
    <fieldset class="feats"><legend data-i18n="f_feat"></legend>
      ${FEATS.map(k => `<label class="chk"><input type="checkbox" name="features" value="${k}"><span data-i18n="${fk(k)}"></span></label>`).join("")}</fieldset>
    <div class="fld"><label for="desc" data-i18n="f_desc"></label><textarea id="desc" name="desc" rows="5"></textarea></div>
    <div class="two">${fld("name","f_name","text","name")}${fld("mail","f_mail","email","email")}${fld("phone","f_phone","tel","tel")}${fld("wa","f_wa","tel","tel")}</div>
    <small class="err" id="e_ct" role="alert"></small>
    <div class="fld"><label for="pref" data-i18n="f_pref"></label>
      <select id="pref" name="pref"><option value="call" data-i18n="call"></option><option value="wa" data-i18n="wa"></option><option value="mail" data-i18n="mail"></option></select></div>
    <div class="fld"><label for="extra" data-i18n="f_extra"></label><textarea id="extra" name="extra" rows="3"></textarea></div>
    <div><button type="button" class="btn" id="review" data-i18n="f_review"></button></div>`;
  $("#review").onclick = onReview;
  $("#edit").onclick = () => { $("#summary").hidden = true; $("#oform").hidden = false; };
  $("#send").onclick = onSend;
  document.addEventListener("langchange", () => { if (DATA && !$("#summary").hidden) fillSummary(); });
}

function collect() {
  return {
    type: val("type"),
    features: $$("input[name=features]:checked").map(i => i.value),
    desc: val("desc"), name: val("name"), email: val("mail"), phone: val("phone"),
    whatsapp: val("wa"), contact_method: val("pref"), extra: val("extra")
  };
}

function validate() {
  let ok = true;
  const set = (id, key) => {
    $("#e_" + id).textContent = key ? t(key) : "";
    $("#" + id).setAttribute("aria-invalid", !!key);
    if (key) ok = false;
  };
  set("name", val("name") ? "" : "e_req");
  set("mail", val("mail") && !/^\S+@\S+\.\S+$/.test(val("mail")) ? "e_mail" : "");
  const none = !(val("mail") || val("phone") || val("wa"));
  $("#e_ct").textContent = none ? t("e_ct") : "";
  if (none) ok = false;
  return ok;
}

const rows = d => [
  ["f_type", t(tk(d.type))],
  ["f_feat", d.features.map(k => t(fk(k))).join(", ")],
  ["f_desc", d.desc], ["f_name", d.name], ["f_mail", d.email], ["f_phone", d.phone],
  ["f_wa", d.whatsapp], ["f_pref", t(d.contact_method)], ["f_extra", d.extra]
].filter(r => r[1]);

function fillSummary() {
  const dl = $("#sum");
  dl.innerHTML = "";
  rows(DATA).forEach(([k, v]) => {
    const a = document.createElement("dt"), b = document.createElement("dd");
    a.textContent = t(k); b.textContent = v;   // textContent (not innerHTML) keeps user input safe
    dl.append(a, b);
  });
}

function onReview() {
  if (!validate()) return;
  DATA = collect();
  fillSummary();
  $("#fb").hidden = true;
  $("#oform").hidden = true;
  $("#summary").hidden = false;
  $("#summary").scrollIntoView({ block: "start" });
}

async function onSend() {
  const b = $("#send"), ep = SITE.formEndpoint || "";
  const msg = rows(DATA).map(([k, v]) => t(k) + ": " + v).join("\n");
  // Fallback when no form service is connected (or sending failed): pre-filled WhatsApp / Email buttons.
  const fallback = key => {
    $("#fbmsg").textContent = t(key);
    $("#fbwa").href = `https://wa.me/${SITE.wa}?text=${encodeURIComponent(msg)}`;
    $("#fbmail").href = `mailto:${SITE.email}?subject=${encodeURIComponent("Website request")}&body=${encodeURIComponent(msg)}`;
    $("#fb").hidden = false;
  };
  if (!ep || ep.includes("YOUR_FORM_ID")) return fallback("nocfg");
  b.disabled = true; b.textContent = t("sending");
  try {
    const r = await fetch(ep, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ ...DATA, _subject: "New website request" })
    });
    if (!r.ok) throw new Error(r.status);
    $("#summary").hidden = true;
    $("#done").hidden = false;
    $("#done").scrollIntoView({ block: "center" });
  } catch (e) { fallback("e_net"); }
  b.disabled = false; b.textContent = t("f_send");
}
