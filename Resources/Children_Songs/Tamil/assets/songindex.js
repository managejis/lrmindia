(function () {
  "use strict";
  var params = new URLSearchParams(window.location.search);
  var lang = params.get("lang") === "en" ? "en" : (params.get("lang") === "ta" ? "ta" : "");
  var active = params.get("active");
  var links = Array.prototype.slice.call(document.querySelectorAll("#list a"));
  var base = links.map(function (a) { return a.getAttribute("href"); });

  function applyLang() {
    links.forEach(function (a, i) { a.setAttribute("href", base[i] + (lang ? "?lang=" + lang : "")); });
  }
  links.forEach(function (a) {
    if (active && a.getAttribute("data-song") === active) {
      a.classList.add("active");
      a.setAttribute("aria-current", "page");
    }
  });
  applyLang();

  /* search */
  var q = document.getElementById("q"), empty = document.getElementById("empty");
  q.addEventListener("input", function () {
    var s = q.value.trim().toLowerCase(), n = 0;
    Array.prototype.forEach.call(document.querySelectorAll("#list li"), function (li) {
      var show = !s || (li.getAttribute("data-search") || "").indexOf(s) !== -1;
      li.style.display = show ? "" : "none";
      if (show) { n++; }
    });
    empty.hidden = n !== 0;
    report();
  });

  /* parent page -> keep language on links */
  window.addEventListener("message", function (e) {
    var d = e.data;
    if (d && d.type === "lrm-index-lang" && (d.lang === "en" || d.lang === "ta")) { lang = d.lang; applyLang(); }
  });

  /* tell the landing page how tall the list is (iframe auto-height; works on file://) */
  function report() {
    try { window.parent.postMessage({ type: "lrm-index-height", height: document.documentElement.scrollHeight }, "*"); } catch (e) {}
  }
  window.addEventListener("load", report);
  window.addEventListener("resize", report);
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(report); }

  /* scroll active song into view when shown inside a song page */
  var act = document.querySelector("#list a.active");
  /* NOTE: do not use scrollIntoView here - inside an iframe it also scrolls the PARENT page
     (on phones that jumped the song page down to the index, hiding the lyrics at the top).
     Scroll only this frame's own viewport instead. */
  if (act) {
    var target = Math.max(0, act.offsetTop - Math.round((window.innerHeight - act.offsetHeight) / 2));
    window.scrollTo(0, target);
  }
})();
