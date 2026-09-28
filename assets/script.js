// SSB Prep Guide - shared behaviour (checkbox persistence, progress bars, tabs)
(function () {
  "use strict";

  var STORAGE_PREFIX = "ssbprep_";

  function pageKey() {
    var path = window.location.pathname.split("/").pop() || "index.html";
    return path.replace(".html", "");
  }

  function loadState(key) {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key) || "{}");
    } catch (e) {
      return {};
    }
  }

  function saveState(key, state) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(state));
  }

  function updateProgressBar(scope) {
    var boxes = scope.querySelectorAll('input[type="checkbox"][data-persist]');
    if (!boxes.length) return;
    var total = boxes.length;
    var checked = 0;
    boxes.forEach(function (b) { if (b.checked) checked++; });
    var pct = total ? Math.round((checked / total) * 100) : 0;

    var fill = scope.querySelector(".progress-fill");
    var label = scope.querySelector(".progress-label");
    if (fill) fill.style.width = pct + "%";
    if (label) label.textContent = checked + " / " + total + " completed (" + pct + "%)";

    // store page-level summary for the dashboard to read
    var registry = loadState("registry");
    registry[pageKey()] = { total: total, checked: checked };
    saveState("registry", registry);
  }

  function initChecklists() {
    var page = pageKey();
    var state = loadState(page);
    var boxes = document.querySelectorAll('input[type="checkbox"][data-persist]');

    boxes.forEach(function (box) {
      var id = box.getAttribute("data-persist");
      if (state[id]) {
        box.checked = true;
        var lbl = document.querySelector('label[for="' + box.id + '"]');
        if (lbl) lbl.classList.add("done");
      }
      box.addEventListener("change", function () {
        state[id] = box.checked;
        saveState(page, state);
        var lbl = document.querySelector('label[for="' + box.id + '"]');
        if (lbl) lbl.classList.toggle("done", box.checked);
        updateProgressBar(document);
      });
    });

    updateProgressBar(document);
  }

  function initTabs() {
    document.querySelectorAll(".tabs").forEach(function (tabGroup) {
      var buttons = tabGroup.querySelectorAll(".tab-btn");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          var targetId = btn.getAttribute("data-tab");
          var panelWrap = tabGroup.parentElement;
          buttons.forEach(function (b) { b.classList.remove("active"); });
          btn.classList.add("active");
          panelWrap.querySelectorAll(".tab-panel").forEach(function (p) {
            p.classList.toggle("active", p.id === targetId);
          });
        });
      });
    });
  }

  function markActiveNav() {
    var page = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".navlinks a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === page) a.classList.add("active");
    });
  }

  // Reads the shared registry to build a dashboard overview (used on index.html)
  window.SSBPrep = {
    getRegistry: function () {
      return loadState("registry");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    initChecklists();
    initTabs();
    markActiveNav();
  });
})();
