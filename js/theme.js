/* ==========================================================================
   THEME TOGGLE
   The blocking inline script in <head> already set the correct data-theme
   attribute before first paint (no flash). This file only wires up the
   toggle button's click behavior and keeps it in sync.
   ========================================================================== */
(function () {
  "use strict";

  function getStoredTheme() {
    try { return localStorage.getItem("portfolio-theme"); } catch (e) { return null; }
  }

  function storeTheme(value) {
    try { localStorage.setItem("portfolio-theme", value); } catch (e) { /* ignore */ }
  }

  function currentTheme() {
    return document.documentElement.getAttribute("data-theme") || "dark";
  }

  function applyTheme(theme, { persist = true, announce = true } = {}) {
    var root = document.documentElement;

    // Wrap in a short-lived class so the color swap animates instead of snapping
    root.classList.add("theme-transition");
    root.setAttribute("data-theme", theme);
    window.clearTimeout(applyTheme._t);
    applyTheme._t = window.setTimeout(function () {
      root.classList.remove("theme-transition");
    }, 450);

    if (persist) storeTheme(theme);

    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    });

    if (announce) {
      var live = document.getElementById("theme-announce");
      if (live) live.textContent = theme === "light" ? "Light theme enabled" : "Dark theme enabled";
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme() === "light" ? "dark" : "light");
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".theme-toggle").forEach(function (btn) {
      btn.addEventListener("click", toggleTheme);
    });

    // Keep in sync across tabs
    window.addEventListener("storage", function (e) {
      if (e.key === "portfolio-theme" && e.newValue) {
        applyTheme(e.newValue, { persist: false, announce: false });
      }
    });
  });

  window.__portfolioTheme = { apply: applyTheme, toggle: toggleTheme, current: currentTheme };
})();
