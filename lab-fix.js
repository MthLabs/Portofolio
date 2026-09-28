/* Runtime patch if index.html cannot be rewritten in one shot.
   Safe no-op once the real index already contains the fixes. */
(function () {
  function killProof() {
    document.querySelectorAll(".proof").forEach(function (el) { el.remove(); });
  }
  function enhanceLab() {
    var cards = document.querySelectorAll("#lab-list .block");
    cards.forEach(function (card) {
      var h = card.querySelector("h3");
      if (!h) return;
      var title = (h.textContent || "").trim();
      if (title === "Keepr Analytics" && !card.querySelector(".keepr-plaquette")) {
        var lang = document.documentElement.lang === "en" ? "en" : "fr";
        var t = lang === "en"
          ? { kicker: "Case study", body: "How the ops console sees usage, cost and access — without ever reading conversations.", cta: "Download the PDF", file: "Keepr_Analytics_case_study.pdf", meta: "6 pages · September 2026" }
          : { kicker: "Étude de cas", body: "Comment la console d’exploitation voit l’usage, les coûts et les accès — sans jamais lire les conversations.", cta: "Télécharger le PDF", file: "Keepr_Analytics_etude_de_cas.pdf", meta: "6 pages · septembre 2026" };
        var wrap = document.createElement("div");
        wrap.innerHTML = '<div class="keepr-plaquette"><p class="keepr-plaquette-kicker">' + t.kicker + "</p><p>" + t.body + '</p><div class="keepr-plaquette-row"><a href="' + t.file + '" download>' + t.cta + '</a><p class="keepr-plaquette-meta">' + t.meta + "</p></div></div>";
        card.appendChild(wrap.firstChild);
      }
    });
  }
  killProof();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { killProof(); setTimeout(enhanceLab, 0); });
  } else {
    setTimeout(enhanceLab, 0);
  }
  document.querySelectorAll(".lang").forEach(function (b) {
    b.addEventListener("click", function () { setTimeout(enhanceLab, 30); });
  });
})();
