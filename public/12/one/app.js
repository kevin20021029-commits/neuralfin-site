/* NeuralFin 2027 · one-screen edition */
(function () {
  "use strict";

  var I18N = window.NF_I18N || {};
  var LANG_KEY = "nf-campaign-lang";

  var CONFIG = {
    upgradeAt: "2026-12-07T00:00:00+08:00",
  };

  var ROOMS = ["arti", "play", "up"];
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
  var closeSeq = 0;
  var reduceMotion = false;

  try {
    reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch (e) {}

  ROOMS.forEach(function (key) {
    rooms[key] = document.getElementById("room-" + key);
    tiles[key] = document.querySelector('.card[data-room="' + key + '"]');
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

  /* The slogan must read as exactly two lines: pick the largest size that fits. */
  function fitHero() {
    var title = document.querySelector(".hero-title");
    if (!title || !title.offsetParent) return;
    var hero = title.parentElement;
    var avail = hero ? hero.clientWidth : 0;
    if (!avail) return;
    var lines = title.querySelectorAll(".hl > span");
    if (!lines.length) return;

    for (var pass = 0; pass < 4; pass++) {
      var widest = 0;
      for (var i = 0; i < lines.length; i++) {
        widest = Math.max(widest, lines[i].getBoundingClientRect().width);
      }
      if (!widest) return;
      var fs = parseFloat(getComputedStyle(title).fontSize);
      var next = Math.min(76, Math.max(14, (fs * avail * 0.99) / widest));
      if (Math.abs(next - fs) < 0.5) break;
      title.style.fontSize = next.toFixed(1) + "px";
    }
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

    fitHero();
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

  function killAnims(el) {
    if (!el || !el.getAnimations) return;
    el.getAnimations().forEach(function (a) {
      try {
        a.cancel();
      } catch (e) {}
    });
  }

  function openRoom(key, opts) {
    opts = opts || {};
    if (!rooms[key]) return;

    closeSeq++;
    ROOMS.forEach(function (k) {
      if (rooms[k]) killAnims(rooms[k]);
    });

    var firstOpen = !app.classList.contains("is-open");
    if (firstOpen) {
      lastFocus = document.activeElement;
      savedRect = tiles[key] ? tiles[key].getBoundingClientRect() : null;
      if (tiles[key]) tiles[key].style.transform = "";
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

    var seq = ++closeSeq;
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
      closeTimer = window.setTimeout(function () {
        if (seq !== closeSeq) return;
        finish();
        killAnims(room);
      }, 250);
    } else {
      finish();
      if (room) killAnims(room);
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

  /* ------------------------------------------------------------ effects */

  function initDust() {
    var canvas = document.getElementById("dust");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, dots = [], raf = 0, running = true;

    function spawn(anywhere) {
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 12,
        r: 0.5 + Math.random() * 1.5,
        vy: -(0.07 + Math.random() * 0.3),
        vx: (Math.random() - 0.5) * 0.1,
        a: 0.1 + Math.random() * 0.38,
        tw: Math.random() * Math.PI * 2,
        ts: 0.004 + Math.random() * 0.012,
      };
    }

    function size() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.round(Math.min(52, Math.max(20, (w * h) / 28000)));
      dots = [];
      for (var i = 0; i < count; i++) dots.push(spawn(true));
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx;
        d.y += d.vy;
        d.tw += d.ts;
        if (d.y < -14 || d.x < -14 || d.x > w + 14) {
          dots[i] = spawn(false);
          continue;
        }
        ctx.globalAlpha = d.a * (0.5 + 0.5 * Math.sin(d.tw));
        ctx.fillStyle = "#e0bf7a";
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      window.cancelAnimationFrame(raf);
    }
    function start() {
      if (running) return;
      running = true;
      raf = window.requestAnimationFrame(frame);
    }

    size();
    raf = window.requestAnimationFrame(frame);

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(size, 180);
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop();
      else start();
    });
  }

  function initTilt() {
    if (reduceMotion) return;
    var fine = false;
    try {
      fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    } catch (e) {}
    if (!fine) return;

    var max = 3.2;
    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        if (app.classList.contains("is-open")) return;
        var r = card.getBoundingClientRect();
        if (!r.width || !r.height) return;
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        var ry = (px - 0.5) * 2 * max;
        var rx = (py - 0.5) * -2 * max;
        card.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });
  }

  initDust();
  initTilt();

  /* -------------------------------------------------------------- boot */

  applyLang(detectLang());
  window.requestAnimationFrame(fitHero);
  window.addEventListener("load", fitHero);
  if (document.fonts) {
    document.fonts.ready.then(fitHero);
    if (document.fonts.addEventListener) document.fonts.addEventListener("loadingdone", fitHero);
  }
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
    fitHero();
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
