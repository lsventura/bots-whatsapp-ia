/* Origem (UTM) + analytics sem cookie. Sem dependências.
 * - Lê utm_source/utm_medium/utm_campaign/utm_content, guarda em sessionStorage (só esta aba).
 * - Mensagem do wa.me: "Oi Leonardo, vim pelo <fonte> e quero entender o atendimento para clínicas [<codigo>]"
 *   codigo = utm_content || utm_campaign; sem UTM => fonte "site" e [site].
 * - Assunto do mailto recebe o mesmo [<codigo>].
 * - GoatCounter (count.js, sem cookie) + evento "click_whatsapp" em todo CTA de WhatsApp. */
(function () {
  // TODO(Leonardo): troque pelo código da sua conta GoatCounter (https://<CODIGO>.goatcounter.com).
  // Deixe "" para desligar o analytics.
  var GOATCOUNTER_CODE = "fiscalbots";

  var PHONE = "5511977049238";
  var KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content"];
  var STORE = "ls_utm";
  var FONTES = { x: "X", twitter: "X", telegram: "Telegram", reddit: "Reddit", discord: "Discord",
    instagram: "Instagram", facebook: "Facebook", linkedin: "LinkedIn", youtube: "YouTube", google: "Google",
    email: "e-mail", "grupo-geral-digital": "grupo Geral.digital", "grupo-freelancer-br": "grupo Freelancer BR",
    outro: "link", site: "site" };

  function clean(v) {
    return String(v || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9_.-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);
  }
  var utm = {};
  try {
    var q = new URLSearchParams(location.search), found = false;
    KEYS.forEach(function (k) { var v = clean(q.get(k)); if (v) { utm[k] = v; found = true; } });
    if (found) sessionStorage.setItem(STORE, JSON.stringify(utm));
    else utm = JSON.parse(sessionStorage.getItem(STORE) || "{}") || {};
  } catch (e) { utm = {}; }

  var src = utm.utm_source || "";
  var fonte = src ? (FONTES[src] || (src.indexOf("grupo-") === 0 ? "grupo " + src.slice(6).replace(/-/g, " ") : src)) : "site";
  var code = utm.utm_content || utm.utm_campaign || (src ? src : "site");

  function tema(intent) {
    if (!intent) return "o atendimento para clínicas";
    if (intent.indexOf("plano-") === 0) return "o atendimento para clínicas (pacote " + intent.slice(6) + ")";
    if (intent === "telegram") return "o bot de grupo VIP no Telegram";
    if (intent === "n8n") return "as automações com n8n";
    return "o atendimento para clínicas";
  }
  function msg(intent) { return "Oi Leonardo, vim pelo " + fonte + " e quero entender " + tema(intent) + " [" + code + "]"; }

  function track(path, title) {
    try {
      if (window.goatcounter && typeof window.goatcounter.count === "function") {
        window.goatcounter.count({ path: path, title: title, event: true });
      }
    } catch (e) {}
  }

  document.querySelectorAll("a[data-cta]").forEach(function (a) {
    a.setAttribute("data-ref", code);
    a.setAttribute("data-fonte", fonte);
    if (a.dataset.channel === "whatsapp") {
      a.href = "https://wa.me/" + PHONE + "?text=" + encodeURIComponent(msg(a.dataset.waIntent));
      a.addEventListener("click", function () { track("click_whatsapp", a.dataset.cta + " | " + code); });
    } else if (a.dataset.channel === "email") {
      a.href = "mailto:leo.sanchees2014@gmail.com?subject=" + encodeURIComponent("Atendimento para clínicas [" + code + "]");
      a.addEventListener("click", function () { track("click_email", a.dataset.cta + " | " + code); });
    }
  });

  if (GOATCOUNTER_CODE) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://gc.zgo.at/count.js";
    s.setAttribute("data-goatcounter", "https://" + GOATCOUNTER_CODE + ".goatcounter.com/count");
    document.head.appendChild(s);
  }
})();
