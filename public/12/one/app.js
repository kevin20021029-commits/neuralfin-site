/* NeuralFin 2027 · one-screen edition */
(function () {
  "use strict";

  var I18N = window.NF_I18N || {};
  var LANG_KEY = "nf-campaign-lang";

  var CONFIG = {
    upgradeAt: "2026-12-07T00:00:00+08:00",
  };

  var ROOMS = ["arti", "play", "up", "year"];
  var root = document.documentElement;
  var app = document.getElementById("app");
  var rooms = {};
  var tiles = {};
  var railBtns = {};
  var currentLang = "zh-Hans";
  var active = null;
  var savedRect = null;
  var lastFocus = null;
  var closeTimer = 0;
  var openResetTimer = 0;
  var reduceMotion = false;

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  ROOMS.forEach(function (key) {
    rooms[key] = document.getElementById("room-" + key);
    tiles[key] = document.querySelector('.tile[data-room="' + key + '"]');
  });
  document.querySelectorAll(".rail button[data-room]").forEach(function (btn) {
    railBtns[btn.getAttribute("data-room")] = btn;
  });

  /* ---------------------------------------------------------------- i18n */

  function detectLang() {
    try {
      var saved = localStorage.getItem(LANG_KEY);
      if (saved && I18N[saved]) return saved;
    } catch (e) {}
    var list = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    var first = String(list[0] || "").toLowerCase();
    if (first.indexOf("zh") === 0) return /hant|hk|tw|mo/.test(first) ? "zh-Hant" : "zh-Hans";
    if (first.indexOf("en") === 0) return "en";
    return "zh-Hans";
  }

  function t(key) {
    var dict = I18N[currentLang] || I18N["zh-Hans"];
    return dict && dict.s[key] != null ? dict.s[key] : "";
  }

  function applyLang(lang) {
    if (!I18N[lang]) lang = "zh-Hans";
    currentLang = lang;
    var dict = I18N[lang];

    root.lang = lang;
    root.setAttribute("data-lang", lang);
    document.title = dict.title;

    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", dict.desc);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", dict.title);
    var ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", dict.desc);

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = dict.s[el.getAttribute("data-i18n")];
      if (v != null) el.textContent = v;
    });

    document.querySelectorAll(".langs button").forEach(function (btn) {
      var on = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });

    document.querySelectorAll("[data-close], #navClose, #discClose").forEach(function (btn) {
      btn.setAttribute("aria-label", dict.s["a11y.close"] || "Close");
    });

    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (e) {}
  }

  /* ---------------------------------------------------------- countdown */

  var target = new Date(CONFIG.upgradeAt).getTime();

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function tickCountdown() {
    var left = Math.max(0, target - Date.now());
    var total = Math.floor(left / 1000);
    var values = {
      d: pad(Math.floor(total / 86400)),
      h: pad(Math.floor((total % 86400) / 3600)),
      m: pad(Math.floor((total % 3600) / 60)),
      s: pad(total % 60),
    };
    Object.keys(values).forEach(function (unit) {
      document.querySelectorAll('[data-cd="' + unit + '"]').forEach(function (el) {
        el.textContent = values[unit];
      });
    });
  }

  /* ------------------------------------------------------------- rooms */

  function setRail(key) {
    ROOMS.forEach(function (k) {
      var btn = railBtns[k];
      if (!btn) return;
      var on = k === key;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function resetInline(room) {
    room.style.transition = "";
    room.style.transform = "";
    room.style.opacity = "";
  }

  function openRoom(key, opts) {
    opts = opts || {};
    if (!rooms[key]) return;

    var firstOpen = !app.classList.contains("is-open");
    if (firstOpen) {
      lastFocus = document.activeElement;
      savedRect = tiles[key] ? tiles[key].getBoundingClientRect() : null;
      app.classList.add("is-open");
      var navClose = document.getElementById("navClose");
      if (navClose) navClose.hidden = false;
    }

    ROOMS.forEach(function (k) {
      var room = rooms[k];
      if (!room) return;
      if (k !== key) resetInline(room);
      room.classList.toggle("is-open", k === key);
    });

    active = key;
    setRail(key);
    ROOMS.forEach(function (k) {
      if (tiles[k]) tiles[k].setAttribute("aria-expanded", k === key ? "true" : "false");
    });

    if (firstOpen) {
      try {
        history.replaceState(null, "", "#" + key);
      } catch (e) {}
    }

    var room = rooms[key];
    var animate = opts.animate !== false && !reduceMotion && savedRect && firstOpen && savedRect.width > 0;

    if (animate && room.animate) {
      var rr = room.getBoundingClientRect();
      if (rr.width > 0 && rr.height > 0) {
        var sx = savedRect.width / rr.width;
        var sy = savedRect.height / rr.height;
        var dx = savedRect.left + savedRect.width / 2 - (rr.left + rr.width / 2);
        var dy = savedRect.top + savedRect.height / 2 - (rr.top + rr.height / 2);
        var flip = room.animate(
          [
            { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + "," + sy + ")", opacity: 0 },
            { transform: "none", opacity: 1 }
          ],
          { duration: 520, easing: "cubic-bezier(.2,.9,.24,1)", fill: "both" }
        );
        window.clearTimeout(openResetTimer);
        openResetTimer = window.setTimeout(function () {
          try {
            flip.cancel();
          } catch (e) {}
          resetInline(room);
        }, 540);
      }
    }

    window.clearTimeout(closeTimer);
    window.setTimeout(function () {
      if (active === key) room.focus({ preventScroll: true });
    }, reduceMotion ? 0 : 80);
  }

  function closeRoom() {
    if (!app.classList.contains("is-open")) return;
    window.clearTimeout(openResetTimer);

    var room = rooms[active];
    var finish = function () {
      app.classList.remove("is-open");
      ROOMS.forEach(function (k) {
        if (rooms[k]) {
          rooms[k].classList.remove("is-open");
          resetInline(rooms[k]);
        }
      });
      var navClose = document.getElementById("navClose");
      if (navClose) navClose.hidden = true;
      active = null;
      ROOMS.forEach(function (k) {
        if (tiles[k]) tiles[k].setAttribute("aria-expanded", "false");
        if (railBtns[k]) {
          railBtns[k].classList.remove("is-on");
          railBtns[k].setAttribute("aria-pressed", "false");
        }
      });
      try {
        history.replaceState(null, "", location.pathname + location.search);
      } catch (e) {}
      if (lastFocus && lastFocus.focus) {
        try {
          lastFocus.focus({ preventScroll: true });
        } catch (e) {}
      }
    };

    if (room && !reduceMotion && room.animate) {
      try {
        room.animate(
          [
            { opacity: 1, transform: "none" },
            { opacity: 0, transform: "scale(.96) translateY(6px)" }
          ],
          { duration: 240, easing: "ease", fill: "forwards" }
        );
      } catch (e) {}
      closeTimer = window.setTimeout(finish, 250);
    } else {
      finish();
    }
  }

  function switchRoom(key) {
    if (key === active) {
      closeRoom();
      return;
    }
    openRoom(key, { animate: false });
    try {
      history.replaceState(null, "", "#" + key);
    } catch (e) {}
  }

  /* ------------------------------------------------------------- wiring */

  Object.keys(tiles).forEach(function (key) {
    if (!tiles[key]) return;
    tiles[key].addEventListener("click", function () {
      openRoom(key);
    });
  });

  Object.keys(railBtns).forEach(function (key) {
    railBtns[key].addEventListener("click", function () {
      switchRoom(key);
    });
  });

  document.querySelectorAll("[data-close]").forEach(function (btn) {
    btn.addEventListener("click", closeRoom);
  });
  var navCloseBtn = document.getElementById("navClose");
  if (navCloseBtn) navCloseBtn.addEventListener("click", closeRoom);

  document.querySelectorAll(".langs button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      applyLang(btn.getAttribute("data-lang"));
    });
  });

  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (!disc.hidden) {
        closeDisc();
      } else if (app.classList.contains("is-open")) {
        closeRoom();
      }
    }
  });

  /* --------------------------------------------------------- disclaimer */

  var disc = document.getElementById("disc");
  var discBtn = document.getElementById("discBtn");
  var discClose = document.getElementById("discClose");
  var lastModalFocus = null;

  function openDisc() {
    lastModalFocus = document.activeElement;
    disc.hidden = false;
    if (discClose) discClose.focus();
  }

  function closeDisc() {
    disc.hidden = true;
    if (lastModalFocus && lastModalFocus.focus) lastModalFocus.focus();
  }

  if (discBtn) discBtn.addEventListener("click", openDisc);
  if (discClose) discClose.addEventListener("click", closeDisc);
  if (disc) {
    disc.addEventListener("click", function (e) {
      if (e.target === disc) closeDisc();
    });
  }

  /* -------------------------------------------------------------- boot */

  applyLang(detectLang());
  tickCountdown();
  window.setInterval(tickCountdown, 1000);

  var hash = (location.hash || "").replace("#", "");
  if (ROOMS.indexOf(hash) !== -1) {
    window.setTimeout(function () {
      openRoom(hash, { animate: false });
    }, 30);
  }

  // Recalculate rail visibility on rotation without leaving a stale transform.
  window.addEventListener("resize", function () {
    ROOMS.forEach(function (k) {
      if (rooms[k] && !rooms[k].classList.contains("is-open")) resetInline(rooms[k]);
    });
  });

  window.addEventListener("hashchange", function () {
    var key = (location.hash || "").replace("#", "");
    if (ROOMS.indexOf(key) !== -1) {
      openRoom(key, { animate: false });
    } else if (app.classList.contains("is-open")) {
      closeRoom();
    }
  });
})();
