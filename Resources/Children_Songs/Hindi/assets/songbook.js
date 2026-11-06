/* ==========================================================================
   songbook.js - shared behaviour for the Hindi Children Song book.

   Layout contract:
   - Song pages (song-NN.html): persistent in-flow 40/60 shell
       .songbook-shell > [ #indexToggle | [data-index-panel] | viewer card ].
     The index stays on the left; #indexToggle collapses/expands it.
   - Index landing (root page): ONLY an <ol data-song-index> (+ search).
     No card, no arrow, no lang/share/copy - those inits no-op safely.
   ========================================================================== */
(function () {
  "use strict";

  var BOOK = window.LRM_SONGS || { songs: [] };
  var SONGS = BOOK.songs || [];
  var body = document.body;
  var current = Number(body.getAttribute("data-current-song")) || 0;
  var base = body.getAttribute("data-song-base") || "";

  var LANG_KEY = "lrm_song_lang_hi";
  var DEFAULT_LANG = "hi";
  var lang = DEFAULT_LANG;

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function ready(fn) {
    if (document.readyState !== "loading") { fn(); }
    else { document.addEventListener("DOMContentLoaded", fn); }
  }

  /* ---------------- toast / copy ---------------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "songbook-toast";
      toastEl.setAttribute("role", "status");
      toastEl.setAttribute("aria-live", "polite");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.top = "-1000px";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      try { document.execCommand("copy"); resolve(); }
      catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }

  /* ---------------- index ---------------- */
  function escAttr(v) {
    return String(v).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  }

  function renderIndex() {
    var list = $("[data-song-index]");
    if (!list) { return; }
    if (!SONGS.length) {
      list.innerHTML = '<li class="index-empty">Song list unavailable.</li>';
      return;
    }
    var html = "";
    SONGS.forEach(function (s) {
      var active = (s.n === current) ? ' class="active"' : "";
      html +=
        '<li data-search="' + escAttr((s.n + " " + s.titleEn + " " + s.titleHi).toLowerCase()) + '">' +
          '<a' + active + ' href="' + base + s.slug + '.html" data-song="' + s.n + '">' +
            '<span class="idx-num">' + s.n + '</span>' +
            '<span class="idx-titles">' +
              '<span class="idx-title">' + s.titleEn + '</span>' +
              '<span class="idx-title-kn" lang="hi">' + s.titleHi + '</span>' +
            '</span>' +
            '<i class="bi bi-chevron-right" aria-hidden="true"></i>' +
          '</a>' +
        '</li>';
    });
    list.innerHTML = html;
  }

  function initSearch() {
    var input = $("[data-index-search]");
    if (!input) { return; }
    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visible = 0;
      $$("[data-song-index] li").forEach(function (li) {
        var hay = (li.getAttribute("data-search") || "") + " " + li.textContent.toLowerCase();
        var show = !q || hay.indexOf(q) !== -1;
        li.style.display = show ? "" : "none";
        if (show) { visible++; }
      });
      var empty = $(".index-empty-msg");
      if (empty) { empty.hidden = visible !== 0; }
    });
  }

  /* ---------------- sidebar collapse / expand ---------------- */
  function initSidebarToggle() {
    var t = $("#indexToggle");
    var panel = $("[data-index-panel]");
    if (!t || !panel) { return; }

    function expanded() { return !body.classList.contains("index-collapsed"); }

    function apply() {
      t.setAttribute("aria-expanded", expanded() ? "true" : "false");
      t.setAttribute("aria-label", expanded() ? "Hide song index" : "Show song index");
      panel.setAttribute("aria-hidden", expanded() ? "false" : "true");
    }

    t.addEventListener("click", function () {
      body.classList.toggle("index-collapsed");
      apply();
    });
    document.addEventListener("keydown", function (e) {
      if ((e.key === "Escape" || e.keyCode === 27) && expanded() && !$("[data-song-index] input")) {
        body.classList.add("index-collapsed");
        apply();
      }
    });
    apply();
  }

  /* ---------------- index iframe (index lives in song-index.html) ---------------- */
  function initIndexFrame() {
    var f = $("[data-index-frame]");
    if (!f) { return; }
    f.setAttribute("src", "song-index.html?active=" + current + "&lang=" + lang);
  }
  function syncIndexLang() {
    var f = $("[data-index-frame]");
    if (f && f.contentWindow) { try { f.contentWindow.postMessage({ type: "lrm-index-lang", lang: lang }, "*"); } catch (e) { /* ignore */ } }
  }

  /* ---------------- language ---------------- */
  function applyLang() {
    var title = $("[data-title-en][data-title-hi]");
    if (title) {
      var t = title.getAttribute(lang === "en" ? "data-title-en" : "data-title-hi");
      if (t) { title.textContent = t; title.setAttribute("lang", lang === "en" ? "en" : "hi"); }
    }
    var en = $("[data-lyrics-en]");
    var kn = $("[data-lyrics-hi]");
    if (en) { en.hidden = lang !== "en"; }
    if (kn) { kn.hidden = lang !== "hi"; }
    $$("[data-lang]").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
    $$("[data-active-lang]").forEach(function (el) { el.setAttribute("data-active-lang", lang); });
  }

  function setLang(next) {
    lang = (next === "en" ? "en" : "hi");
    try { window.localStorage.setItem(LANG_KEY, lang); } catch (e) { /* ignore */ }
    applyLang();
    syncIndexLang();
    try {
      var url = new URL(window.location.href);
      url.searchParams.set("lang", lang);
      window.history.replaceState(null, "", url.toString());
    } catch (e) { /* ignore */ }
  }

  /* ---------------- share / copy ---------------- */
  function currentSongText() {
    var title = $("[data-title-en][data-title-hi]");
    var t = title ? title.textContent.trim() : document.title;
    var lyrics = lang === "en" ? $("[data-lyrics-en]") : $("[data-lyrics-hi]");
    var b = lyrics ? lyrics.textContent.replace(/[ \t]*\n[ \t]*/g, "\n").trim() : "";
    return t + "\n\n" + b;
  }

  function initShareCopy() {
    var share = $("[data-share]");
    if (share) {
      share.addEventListener("click", function () {
        var title = $("[data-title-en][data-title-hi]");
        var t = title ? title.textContent.trim() : document.title;
        var url = window.location.href;
        if (navigator.share) {
          navigator.share({ title: t, text: t + " \u2013 LRM India", url: url })
            .catch(function () { /* cancelled */ });
        } else {
          copyText(url)
            .then(function () { toast("Link copied to clipboard"); })
            .catch(function () { toast("Could not copy the link"); });
        }
      });
    }
    var copy = $("[data-copy]");
    if (copy) {
      copy.addEventListener("click", function () {
        copyText(currentSongText())
          .then(function () { toast("Song copied to clipboard"); })
          .catch(function () { toast("Could not copy the song"); });
      });
    }
  }

  /* ---------------- boot ---------------- */
  ready(function () {
    var saved = null, urlLang = null;
    try { saved = window.localStorage.getItem(LANG_KEY); } catch (e) { /* ignore */ }
    try { urlLang = new URL(window.location.href).searchParams.get("lang"); } catch (e) { /* ignore */ }

    if (urlLang === "en" || urlLang === "hi") { lang = urlLang; }
    else if (saved === "en" || saved === "hi") { lang = saved; }
    else { lang = DEFAULT_LANG; }

    renderIndex();
    initSearch();
    initIndexFrame();
    initSidebarToggle();
    applyLang();
    initShareCopy();

    $$("[data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () { setLang(btn.getAttribute("data-lang")); });
    });

    try {
      var u = new URL(window.location.href);
      if (!u.searchParams.get("lang")) {
        u.searchParams.set("lang", lang);
        window.history.replaceState(null, "", u.toString());
      }
    } catch (e) { /* ignore */ }
  });
})();
