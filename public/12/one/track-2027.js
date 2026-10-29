/* 2027 campaign telemetry for /12/one — anonymous, no cookies, no PII.
   Posts to /api/track (see app/api/track/route.ts). Silent by design: a
   tracking failure must never affect the page. */
(function () {
  var ENDPOINT = "/api/track";
  var KEY = "nf2027_sid";
  var memoryId = null;

  function sessionId() {
    try {
      var v = window.sessionStorage.getItem(KEY);
      if (!v) {
        v =
          window.crypto && typeof window.crypto.randomUUID === "function"
            ? window.crypto.randomUUID()
            : "sid-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
        window.sessionStorage.setItem(KEY, v);
      }
      return v;
    } catch (e) {
      if (!memoryId) memoryId = "sid-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
      return memoryId;
    }
  }

  function lang() {
    return document.documentElement.getAttribute("lang") || "zh-Hans";
  }

  function send(event, extra) {
    var body = { event_name: event, session_id: sessionId(), lang: lang(), url: location.href };
    if (extra) for (var k in extra) if (Object.prototype.hasOwnProperty.call(extra, k)) body[k] = extra[k];
    var json = JSON.stringify(body);
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(ENDPOINT, new Blob([json], { type: "application/json" }));
      } else {
        fetch(ENDPOINT, { method: "POST", body: json, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch (e) {}
  }

  function targetOf(href) {
    var u;
    try {
      u = new URL(href, location.href);
    } catch (e) {
      return null;
    }
    var host = u.hostname;
    if (host === "neuralfin.ai" || /\.neuralfin\.ai$/.test(host)) {
      if (host.indexOf("nbti.") === 0) return u.pathname.indexOf("/bazi") === 0 ? "bazi" : "nbti";
      if (u.pathname.indexOf("/arti") === 0) return "arti";
      return "download";
    }
    return "other";
  }

  var opened = {};
  function room(name) {
    if (!name || opened[name]) return;
    opened[name] = true;
    send("nf2027_room_open", { room: name });
  }

  function fromHash() {
    var h = (location.hash || "").replace("#", "");
    if (h === "arti" || h === "play" || h === "up") room(h);
  }

  document.addEventListener(
    "click",
    function (e) {
      var node = e.target;
      if (node && node.nodeType !== 1) node = node.parentElement;
      if (!node || !node.closest) return;

      var roomEl = node.closest("[data-room]");
      if (roomEl && roomEl.tagName === "BUTTON") room(roomEl.getAttribute("data-room"));

      var link = node.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href") || "";
      if (href.charAt(0) === "#" || href.indexOf("javascript:") === 0) return;
      var target = targetOf(link.href);
      if (!target) return;
      send("nf2027_cta_click", { target: target, label: (link.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40) });
    },
    true
  );

  window.addEventListener("hashchange", fromHash);
  send("nf2027_view");
  setTimeout(fromHash, 700);
})();
