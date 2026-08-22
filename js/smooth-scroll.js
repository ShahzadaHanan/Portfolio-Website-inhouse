/* ==========================================================================
   SMOOTH SCROLL — Stable Inertia Version
   ========================================================================== */

(function () {
  "use strict";

  var isFinePointer =
    window.matchMedia("(pointer: fine) and (hover: hover)").matches;

  var reducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!isFinePointer || reducedMotion) return;


  /* ----------------------------------------------------------------------
     SETTINGS
     ---------------------------------------------------------------------- */

  var WHEEL_MULTIPLIER = 1.15;

  // Lower = smoother/slower
  // Higher = faster response
  var EASE = 0.095;

  var MIN_DISTANCE = 0.1;


  /* ----------------------------------------------------------------------
     STATE
     ---------------------------------------------------------------------- */

  var current = window.scrollY;
  var target = window.scrollY;

  var running = false;


  /* ----------------------------------------------------------------------
     MAXIMUM SCROLL
     ---------------------------------------------------------------------- */

  function getMaxScroll() {
    return Math.max(
      0,
      document.documentElement.scrollHeight - window.innerHeight
    );
  }


  /* ----------------------------------------------------------------------
     CLAMP
     ---------------------------------------------------------------------- */

  function clamp(value) {
    var max = getMaxScroll();

    return Math.max(
      0,
      Math.min(value, max)
    );
  }


  /* ----------------------------------------------------------------------
     WHEEL
     ---------------------------------------------------------------------- */

  function onWheel(e) {

    /*
     * Allow normal scrolling inside custom scroll containers.
     */
    if (
      e.target.closest &&
      e.target.closest("[data-native-scroll]")
    ) {
      return;
    }


    e.preventDefault();


    /*
     * Normalize wheel input.
     */

    var delta = e.deltaY;

    if (e.deltaMode === 1) {
      delta *= 16;
    }

    if (e.deltaMode === 2) {
      delta *= window.innerHeight;
    }


    /*
     * Add wheel movement to our virtual target.
     *
     * IMPORTANT:
     * We don't modify current here.
     * current is controlled ONLY by the animation.
     */

    target += delta * WHEEL_MULTIPLIER;

    target = clamp(target);


    start();
  }


  /* ----------------------------------------------------------------------
     ANIMATION
     ---------------------------------------------------------------------- */

  function animate() {

    var difference = target - current;


    /*
     * Very close to target:
     * snap exactly into position and stop.
     */

    if (Math.abs(difference) < MIN_DISTANCE) {

      current = target;

      window.scrollTo(
        0,
        current
      );

      running = false;

      return;
    }


    /*
     * Smooth interpolation.
     */

    current += difference * EASE;


    /*
     * Safety boundaries.
     */

    current = clamp(current);


    /*
     * Move browser viewport.
     */

    window.scrollTo(
      0,
      current
    );


    /*
     * Continue.
     */

    requestAnimationFrame(animate);
  }


  /* ----------------------------------------------------------------------
     START ANIMATION
     ---------------------------------------------------------------------- */

  function start() {

    if (running) {
      return;
    }

    running = true;

    requestAnimationFrame(animate);
  }


  /* ----------------------------------------------------------------------
     RESIZE
     ---------------------------------------------------------------------- */

  function onResize() {

    var max = getMaxScroll();

    target = Math.min(target, max);
    current = Math.min(current, max);
  }


  /* ----------------------------------------------------------------------
     INITIALIZE
     ---------------------------------------------------------------------- */

  document.addEventListener("DOMContentLoaded", function () {

    document.documentElement.classList.add(
      "has-smooth-scroll"
    );


    /*
     * VERY IMPORTANT:
     *
     * Don't let CSS scroll-behavior interfere with
     * our JavaScript animation.
     */

    document.documentElement.style.scrollBehavior = "auto";


    window.addEventListener(
      "wheel",
      onWheel,
      {
        passive: false
      }
    );


    window.addEventListener(
      "resize",
      onResize,
      {
        passive: true
      }
    );

  });

})();





// /* ==========================================================================
//    SMOOTH SCROLL (v2 — fixes the freeze bug from the wheel/scroll race)
//    A single continuous rAF loop lerps the real scroll position toward a
//    wheel-accumulated target. Each frame it also checks whether something
//    OTHER than this loop moved the page (keyboard, scrollbar drag, anchor
//    link, browser search) by comparing actual scrollY to what we last set —
//    if so, it resyncs instead of fighting it. This avoids the previous
//    approach's race where our own programmatic scroll was mistaken for a
//    user scroll and immediately cancelled, which froze the page.
//    Disabled on touch/coarse pointers and when reduced motion is preferred —
//    native scrolling is already smooth there.
//    ========================================================================== */
// (function () {
//   "use strict";

//   var isFine = window.matchMedia("(pointer: fine) and (hover: hover)").matches;
//   var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
//   if (!isFine || reduced) return;

//   var current = window.scrollY;
//   var target = window.scrollY;
//   var lastSetY = window.scrollY;
//   var EASE =   0.13;
//   var SYNC_EPSILON = 0.5; // px of drift before we treat it as an external scroll

//   function maxScroll() {
//     return Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
//   }

//   function onWheel(e) {
//     if (e.target.closest && e.target.closest("[data-native-scroll]")) return;
//     e.preventDefault();
//     target += e.deltaY* 2.9;
//     target = Math.max(0, Math.min(target, maxScroll()));
//   }

//   function loop() {
//     var actualY = window.scrollY;

//     // Something else moved the page since our last write — trust it.
//     if (Math.abs(actualY - lastSetY) > SYNC_EPSILON) {
//       current = actualY;
//       target = actualY;
//     }

//     if (Math.abs(target - current) > 0.05) {
//       current += (target - current) * EASE;
//       window.scrollTo(0, current);
//       lastSetY = current;
//     } else if (current !== target) {
//       current = target;
//       window.scrollTo(0, current);
//       lastSetY = current;
//     }

//     requestAnimationFrame(loop);
//   }

//   function onResize() {
//     target = Math.min(target, maxScroll());
//   }

//   document.addEventListener("DOMContentLoaded", function () {
//     document.documentElement.classList.add("has-smooth-scroll");
//     window.addEventListener("wheel", onWheel, { passive: false });
//     window.addEventListener("resize", onResize);
//     requestAnimationFrame(loop);
//   });
// })();
