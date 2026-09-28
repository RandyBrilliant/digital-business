(function () {
  "use strict";

  var STAGE_W = 1920;
  var STAGE_H = 1080;
  var stage = document.querySelector(".stage");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var counterEl = document.querySelector("[data-counter]");
  var deckTitle = document.body.getAttribute("data-deck-title") || "";
  var progressEl = document.querySelector(".progress > span");
  var helpEl = document.querySelector(".help");
  var prevBtn = document.querySelector("[data-prev]");
  var nextBtn = document.querySelector("[data-next]");
  var index = 0;
  var overview = false;
  var presenter = null;
  var startedAt = Date.now();
  var touchX = null;

  function clamp(n) {
    return Math.max(0, Math.min(slides.length - 1, n));
  }

  function parseHash() {
    var raw = (location.hash || "").replace(/^#/, "");
    if (!raw) return 0;
    var m = raw.match(/^(?:slide-)?(\d+)$/i);
    if (!m) return 0;
    return clamp(parseInt(m[1], 10) - 1);
  }

  function setHash(i) {
    var next = "#slide-" + (i + 1);
    if (location.hash !== next) {
      history.replaceState(null, "", next);
    }
  }

  function scaleStage() {
    if (!stage || overview) return;
    var sx = window.innerWidth / STAGE_W;
    var sy = window.innerHeight / STAGE_H;
    var s = Math.min(sx, sy);
    stage.style.transform = "scale(" + s + ")";
  }

  function notesOf(el) {
    var n = el && el.querySelector(".notes");
    return n ? n.textContent.trim() : "";
  }

  function titleOf(el) {
    if (!el) return "End of deck";
    var h = el.querySelector("h1, h2");
    var k = el.querySelector(".kicker");
    return ((k ? k.textContent + " · " : "") + (h ? h.textContent : "Slide")).replace(/\s+/g, " ").trim();
  }

  function updatePresenter() {
    if (!presenter || presenter.closed) {
      presenter = null;
      return;
    }
    var elapsed = Math.floor((Date.now() - startedAt) / 1000);
    var mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
    var ss = String(elapsed % 60).padStart(2, "0");
    var cur = slides[index];
    var nxt = slides[index + 1];
    var payload = {
      i: index + 1,
      total: slides.length,
      title: titleOf(cur),
      next: titleOf(nxt),
      notes: notesOf(cur),
      clock: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      timer: mm + ":" + ss
    };
    presenter.postMessage({ type: "deck", payload: payload }, "*");
  }

  function render() {
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === index && !overview);
      slide.setAttribute("aria-hidden", i === index ? "false" : "true");
    });
    if (counterEl) counterEl.textContent = (index + 1) + " / " + slides.length;
    if (progressEl) progressEl.style.width = ((index + 1) / slides.length * 100) + "%";
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    document.title = (deckTitle ? deckTitle + " · " : "") + (index + 1) + "/" + slides.length;
    setHash(index);
    updatePresenter();
  }

  function go(i) {
    if (overview) return;
    var next = clamp(i);
    if (next === index) return;
    index = next;
    render();
  }

  function next() {
    if (index < slides.length - 1) go(index + 1);
  }

  function prev() {
    if (index > 0) go(index - 1);
  }

  function toggleOverview() {
    overview = !overview;
    document.body.classList.toggle("overview", overview);
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", overview || i === index);
    });
    if (!overview) scaleStage();
    else stage.style.transform = "none";
  }

  function toggleHelp() {
    if (!helpEl) return;
    helpEl.classList.toggle("open");
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen().catch(function () {});
    }
  }

  function openPresenter() {
    if (presenter && !presenter.closed) {
      presenter.focus();
      updatePresenter();
      return;
    }
    presenter = window.open("", "db-presenter", "width=1100,height=800");
    if (!presenter) return;
    presenter.document.write("<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'><title>Presenter · Digital Business</title><style>" +
      "html,body{margin:0;height:100%;background:#0A1B33;color:#F4F7FB;font-family:'Plus Jakarta Sans',Segoe UI,sans-serif}" +
      ".wrap{display:grid;grid-template-rows:auto 1fr auto;height:100%;padding:28px 32px;gap:18px;box-sizing:border-box}" +
      ".top{display:flex;justify-content:space-between;align-items:baseline;color:#8EA0B5}" +
      "h1{font-size:28px;margin:0 0 8px}" +
      ".notes{font-size:24px;line-height:1.45;white-space:pre-wrap}" +
      ".next{border-top:1px solid #1E3A5F;padding-top:16px;color:#8EA0B5;font-size:20px}" +
      ".timer{font-size:42px;font-variant-numeric:tabular-nums;color:#FF3B5C}" +
      "</style></head><body><div class='wrap'>" +
      "<div class='top'><div id='pos'></div><div><span id='clock'></span> · <span class='timer' id='timer'></span></div></div>" +
      "<div><h1 id='title'></h1><div class='notes' id='notes'></div></div>" +
      "<div class='next' id='next'></div></div>" +
      "<script>window.addEventListener('message',function(e){var d=e.data||{};if(d.type!=='deck')return;var p=d.payload;document.getElementById('pos').textContent=p.i+' / '+p.total;document.getElementById('title').textContent=p.title;document.getElementById('notes').textContent=p.notes||'(No notes on this slide)';document.getElementById('next').textContent='Next: '+p.next;document.getElementById('clock').textContent=p.clock;document.getElementById('timer').textContent=p.timer;});<\/script></body></html>");
    presenter.document.close();
    setTimeout(updatePresenter, 80);
  }

  function onKey(e) {
    var tag = (e.target && e.target.tagName) || "";
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === "?" || (e.key === "/" && e.shiftKey)) { toggleHelp(); return; }
    if (e.key === "Escape") {
      if (helpEl && helpEl.classList.contains("open")) { helpEl.classList.remove("open"); return; }
      if (overview) { toggleOverview(); return; }
    }
    if (overview && (e.key === "Enter" || e.key === "o" || e.key === "O")) {
      toggleOverview();
      return;
    }
    switch (e.key) {
      case "ArrowRight":
      case "PageDown":
      case " ":
      case "Enter":
        e.preventDefault();
        next();
        break;
      case "ArrowLeft":
      case "PageUp":
      case "Backspace":
        e.preventDefault();
        prev();
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(slides.length - 1);
        break;
      case "o":
      case "O":
        toggleOverview();
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      case "s":
      case "S":
        openPresenter();
        break;
    }
  }

  function onClick(e) {
    if (overview) {
      var slide = e.target.closest(".slide");
      if (!slide) return;
      index = slides.indexOf(slide);
      toggleOverview();
      render();
      return;
    }
    if (e.target.closest("a, button, input, textarea, select")) return;
    var x = e.clientX / window.innerWidth;
    if (x > 0.28) next();
    else prev();
  }

  if (!stage || !slides.length) return;

  index = parseHash();
  render();
  scaleStage();

  window.addEventListener("resize", scaleStage);
  window.addEventListener("hashchange", function () {
    index = parseHash();
    render();
  });
  document.addEventListener("keydown", onKey);
  stage.addEventListener("click", onClick);
  if (prevBtn) prevBtn.addEventListener("click", function (e) { e.stopPropagation(); prev(); });
  if (nextBtn) nextBtn.addEventListener("click", function (e) { e.stopPropagation(); next(); });
  if (helpEl) helpEl.addEventListener("click", function (e) {
    if (e.target === helpEl) helpEl.classList.remove("open");
  });

  document.addEventListener("touchstart", function (e) {
    if (!e.changedTouches[0]) return;
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (touchX == null || !e.changedTouches[0]) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) < 50) return;
    if (dx < 0) next();
    else prev();
  });

  setInterval(updatePresenter, 1000);
})();
