/* ==========================================================================
   INTERACTIVE CURSOR BACKGROUND (hero only, homepage)
   A lightweight canvas "glow" background: a few soft ambient color blobs
   drift on their own, and one brighter blob eases toward the cursor with a
   lerp, giving a fluid, WebGL-shader-like reactive backdrop without any
   external library. Colors are read live from the theme's CSS variables so
   it stays correct across the light/dark toggle. Ambient drift keeps
   running on touch devices (no cursor to react to); the whole effect
   renders a single static frame instead of animating when the user prefers
   reduced motion, and pauses entirely while the tab is hidden.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var hero = document.querySelector(".hero");
    var canvas = document.getElementById("hero-bg-canvas");
    if (!hero || !canvas) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasFinePointer = window.matchMedia("(pointer: fine) and (hover: hover)").matches;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;

    // Cursor position, relative to the canvas, eased toward the real pointer.
    var pointerX = 0, pointerY = 0;
    var lightX = 0, lightY = 0;
    var hasPointer = false;

    var colors = { accent: "#f5a623", accent2: "#4fd1c5" };

    function readColors() {
      var cs = getComputedStyle(document.documentElement);
      colors.accent = cs.getPropertyValue("--accent").trim() || colors.accent;
      colors.accent2 = cs.getPropertyValue("--accent-2").trim() || colors.accent2;
    }

    function hexToRgb(hex) {
      hex = hex.replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      var num = parseInt(hex, 16);
      return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
    }

    function resize() {
      var rect = canvas.getBoundingClientRect();
      w = Math.max(1, rect.width);
      h = Math.max(1, rect.height);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      lightX = pointerX = w * 0.62;
      lightY = pointerY = h * 0.4;
    }

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 120);
    });

    window.addEventListener("mousemove", function (e) {
      var rect = canvas.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      // Only track while the pointer is actually over the hero area,
      // so the glow doesn't jump around while scrolled past it.
      if (x >= -100 && x <= rect.width + 100 && y >= -100 && y <= rect.height + 100) {
        pointerX = x;
        pointerY = y;
        hasPointer = true;
      }
    }, { passive: true });

    function drawBlob(x, y, radius, hex, alpha) {
      var rgb = hexToRgb(hex);
      var g = ctx.createRadialGradient(x, y, 0, x, y, radius);
      g.addColorStop(0, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + "," + alpha + ")");
      g.addColorStop(1, "rgba(" + rgb.r + "," + rgb.g + "," + rgb.b + ",0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    var t = 0;
    var colorRefreshCounter = 0;

    function render() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      var minDim = Math.min(w, h);

      // Ambient, slowly drifting blobs — always animate a little, even on touch.
      var a1x = w * 0.22 + Math.sin(t * 0.0006) * w * 0.08;
      var a1y = h * 0.28 + Math.cos(t * 0.0005) * h * 0.1;
      drawBlob(a1x, a1y, minDim * 0.55, colors.accent2, 0.16);

      var a2x = w * 0.78 + Math.cos(t * 0.0004) * w * 0.07;
      var a2y = h * 0.75 + Math.sin(t * 0.0007) * h * 0.08;
      drawBlob(a2x, a2y, minDim * 0.5, colors.accent, 0.14);

      // Interactive blob — eases toward the cursor (or drifts gently if none yet).
      var targetX = hasPointer ? pointerX : w * (0.6 + Math.sin(t * 0.0003) * 0.08);
      var targetY = hasPointer ? pointerY : h * (0.4 + Math.cos(t * 0.00035) * 0.08);
      lightX += (targetX - lightX) * 0.06;
      lightY += (targetY - lightY) * 0.06;
      drawBlob(lightX, lightY, minDim * 0.42, colors.accent, 0.22);

      ctx.globalCompositeOperation = "source-over";
    }

    function loop(ts) {
      t = ts;
      colorRefreshCounter++;
      if (colorRefreshCounter % 45 === 0) readColors(); // stay in sync across theme toggles
      render();
      requestAnimationFrame(loop);
    }

    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && !reduced) requestAnimationFrame(loop);
    });

    readColors();
    resize();

    if (reduced) {
      render(); // single static frame — no animation loop
    } else {
      requestAnimationFrame(loop);
    }

    // Touch devices: no mousemove ever fires, ambient drift still plays,
    // which is intentional — hasFinePointer is kept only for potential
    // future tuning and currently doesn't gate anything else here.
    void hasFinePointer;
  });
})();
