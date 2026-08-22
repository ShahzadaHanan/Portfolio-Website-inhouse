/* ==========================================================================
   CUSTOM CURSOR
   Dot tracks the pointer 1:1; the ring eases toward it every frame (lerp)
   for the classic "trailing ring" feel. Disabled entirely on touch/coarse
   pointers and when the user prefers reduced motion.
   ========================================================================== */
(function () {
  "use strict";

  var isFine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isFine || reduced) return;

  document.addEventListener("DOMContentLoaded", function () {
    var dot = document.createElement("div");
    var ring = document.createElement("div");
    dot.className = "cursor-dot is-hidden";
    ring.className = "cursor-ring is-hidden";
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    document.documentElement.classList.add("has-custom-cursor");

    var mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
    var ringX = mouseX, ringY = mouseY;
    var hasMoved = false;
    var EASE = 0.18;

    window.addEventListener("mousemove", function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = "translate(" + mouseX + "px," + mouseY + "px) translate(-50%,-50%)";
      if (!hasMoved) {
        hasMoved = true;
        dot.classList.remove("is-hidden");
        ring.classList.remove("is-hidden");
        ringX = mouseX; ringY = mouseY;
      }
    }, { passive: true });

    window.addEventListener("mouseleave", function () {
      dot.classList.add("is-hidden");
      ring.classList.add("is-hidden");
    });
    window.addEventListener("mouseenter", function () {
      if (hasMoved) {
        dot.classList.remove("is-hidden");
        ring.classList.remove("is-hidden");
      }
    });

    document.addEventListener("mousedown", function () { ring.classList.add("is-clicking"); });
    document.addEventListener("mouseup", function () { ring.classList.remove("is-clicking"); });

    var HOVER_SELECTOR = "a, button, input, textarea, .card, .filter-btn, [data-cursor-hover]";
    document.addEventListener("mouseover", function (e) {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) ring.classList.add("is-hovering");
    });
    document.addEventListener("mouseout", function (e) {
      if (e.target.closest && e.target.closest(HOVER_SELECTOR)) ring.classList.remove("is-hovering");
    });

    function raf() {
      ringX += (mouseX - ringX) * EASE;
      ringY += (mouseY - ringY) * EASE;
      ring.style.transform = "translate(" + ringX + "px," + ringY + "px) translate(-50%,-50%)";
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
  });
})();
