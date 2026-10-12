/* Páginas legais: troca de idioma. O texto em português é o que prevalece. */
(function () {
  "use strict";
  var lang = "pt";
  try {
    lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("opolvo.lang") ||
      ((navigator.language || "pt").slice(0, 2) === "pt" ? "pt" : "en");
  } catch (_) { /* fica em português */ }
  if (lang !== "en") lang = "pt";

  function apply() {
    document.documentElement.lang = lang;
    Array.prototype.forEach.call(document.querySelectorAll("[data-l]"), function (el) { el.hidden = el.getAttribute("data-l") !== lang; });
    Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang)); });
    var title = document.querySelector('[data-l="' + lang + '"] h1');
    if (title) document.title = title.textContent + " · O Polvo";
  }
  Array.prototype.forEach.call(document.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () {
      lang = b.getAttribute("data-lang");
      // a preferência de idioma só é guardada quando o visitante a escolhe
      try { localStorage.setItem("opolvo.lang", lang); } catch (_) { /* sem armazenamento */ }
      apply();
    });
  });
  apply();
})();
