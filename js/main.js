/* ==========================================================================
   MAIN
   Handles: FOUC-safe boot flag, header scroll state, mobile nav,
   footer year, back-to-top, contact form demo, internal page-transition veil.
   ========================================================================== */
(function () {
  "use strict";

  var html = document.documentElement;
  html.classList.remove("no-js");

  // ---- Boot sequence: reveal body only after layout is settled, then flag
  // is-ready so the hero/page-header entrance animations (defined in
  // animations.css) fire once, in the right order — this is what removes
  // the old "page loads, THEN animation kicks in awkwardly" contradiction.
  function boot() {
    document.body.style.visibility = "visible";
    requestAnimationFrame(function () {
      html.classList.add("is-ready");
    });
  }
  if (document.readyState === "complete" || document.readyState === "interactive") {
    boot();
  } else {
    document.addEventListener("DOMContentLoaded", boot);
  }
  // Safety net in case fonts/resources stall
  window.addEventListener("load", boot);

  document.addEventListener("DOMContentLoaded", function () {
    // ---- Header scroll state
    var header = document.querySelector(".site-header");
    var lastY = window.scrollY;
    function onScroll() {
      if (!header) return;
      header.classList.toggle("is-scrolled", window.scrollY > 12);
      lastY = window.scrollY;
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---- Mobile nav toggle
    var navToggle = document.querySelector(".nav-toggle");
    var navLinks = document.querySelector(".nav-links");
    if (navToggle && navLinks) {
      navToggle.addEventListener("click", function () {
        var open = navLinks.classList.toggle("is-open");
        navToggle.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
      });
      navLinks.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          navLinks.classList.remove("is-open");
          navToggle.classList.remove("is-open");
          navToggle.setAttribute("aria-expanded", "false");
          document.body.style.overflow = "";
        });
      });
    }

    // ---- Footer year
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });

    // ---- Back to top
    document.querySelectorAll("[data-scroll-top]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });

    // ---- Contact form demo (no backend wired up — mailto fallback)
    var form = document.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var status = form.querySelector(".form-status");
        var name = form.querySelector("#name");
        if (status) {
          status.textContent = "Thanks" + (name && name.value ? ", " + name.value.split(" ")[0] : "") +
            " — message noted. Wire this form up to your backend or a form service to receive it for real.";
        }
        form.reset();
      });
    }
  });
})();
