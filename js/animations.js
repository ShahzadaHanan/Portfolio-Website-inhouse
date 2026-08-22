/* ==========================================================================
   ANIMATIONS (behavioral)
   Scroll-triggered reveals via IntersectionObserver (cheap, no scroll-jank)
   and the hero's rotating-word typing effect.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    // ---- Assign stagger index to grouped reveal children
    document.querySelectorAll(".reveal-group").forEach(function (group) {
      Array.from(group.children).forEach(function (child, i) {
        child.classList.add("reveal");
        child.style.setProperty("--stagger-index", i);
      });
    });

    // ---- Scroll reveal
    var targets = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && targets.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
      );
      targets.forEach(function (t) { io.observe(t); });
    } else {
      targets.forEach(function (t) { t.classList.add("is-visible"); });
    }

    // ---- Hero rotating word ("typing" effect)
    var rotator = document.querySelector("[data-rotator]");
    if (rotator) {
      var words = (rotator.getAttribute("data-rotator") || "")
        .split(",")
        .map(function (w) { return w.trim(); })
        .filter(Boolean);

      if (words.length) {
        var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        var wordEl = document.createElement("span");
        var caretEl = document.createElement("span");
        caretEl.className = "caret";
        rotator.textContent = "";
        rotator.appendChild(wordEl);
        rotator.appendChild(caretEl);

        if (reduced) {
          wordEl.textContent = words[0];
        } else {
          var wi = 0, ci = 0, deleting = false;
          var TYPE_MS = 70, DELETE_MS = 40, HOLD_MS = 1500, GAP_MS = 300;

          function tick() {
            var word = words[wi];
            if (!deleting) {
              ci++;
              wordEl.textContent = word.slice(0, ci);
              if (ci === word.length) {
                deleting = true;
                setTimeout(tick, HOLD_MS);
                return;
              }
              setTimeout(tick, TYPE_MS);
            } else {
              ci--;
              wordEl.textContent = word.slice(0, ci);
              if (ci === 0) {
                deleting = false;
                wi = (wi + 1) % words.length;
                setTimeout(tick, GAP_MS);
                return;
              }
              setTimeout(tick, DELETE_MS);
            }
          }
          setTimeout(tick, 900); // start after hero entrance settles
        }
      }
    }

    // ---- Animated stat counters (count up once, when scrolled into view)
    var counters = document.querySelectorAll("[data-counter]");
    if (counters.length) {
      var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      var counterIO = "IntersectionObserver" in window
        ? new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
              if (!entry.isIntersecting) return;
              animateCounter(entry.target);
              counterIO.unobserve(entry.target);
            });
          }, { threshold: 0.5 })
        : null;

      function animateCounter(el) {
        var target = parseFloat(el.getAttribute("data-counter"));
        var suffix = el.getAttribute("data-suffix") || "";
        if (reducedMotion || isNaN(target)) {
          el.textContent = target + suffix;
          return;
        }
        var startTime = null;
        var DURATION = 1400;
        function frame(ts) {
          if (!startTime) startTime = ts;
          var progress = Math.min((ts - startTime) / DURATION, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(target * eased) + suffix;
          if (progress < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      }

      counters.forEach(function (el) {
        if (counterIO) counterIO.observe(el);
        else animateCounter(el);
      });
    }

    // ---- Animated skill bars (fill width once, when scrolled into view)
    var skillBars = document.querySelectorAll("[data-skill-fill]");
    if (skillBars.length && "IntersectionObserver" in window) {
      var skillIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.width = entry.target.getAttribute("data-skill-fill") + "%";
          skillIO.unobserve(entry.target);
        });
      }, { threshold: 0.4 });
      skillBars.forEach(function (el) { skillIO.observe(el); });
    } else {
      skillBars.forEach(function (el) { el.style.width = el.getAttribute("data-skill-fill") + "%"; });
    }

    // ---- Work page category filter
    var filterBtns = document.querySelectorAll("[data-filter]");
    var filterCards = document.querySelectorAll("[data-category]");
    if (filterBtns.length && filterCards.length) {
      filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          filterBtns.forEach(function (b) { b.classList.remove("is-active"); });
          btn.classList.add("is-active");
          var value = btn.getAttribute("data-filter");
          filterCards.forEach(function (card) {
            var match = value === "all" || card.getAttribute("data-category") === value;
            card.classList.toggle("is-hidden", !match);
          });
        });
      });
    }

    // ---- Internal link page-transition veil (purely cosmetic, same-origin only)
    var veil = document.querySelector(".page-veil");
    if (veil) {
      document.querySelectorAll('a[href$=".html"]').forEach(function (link) {
        if (link.target === "_blank" || link.hasAttribute("data-no-veil")) return;
        link.addEventListener("click", function (e) {
          var href = link.getAttribute("href");
          if (!href || href.startsWith("#")) return;
          e.preventDefault();
          veil.classList.add("is-active");
          setTimeout(function () { window.location.href = href; }, 260);
        });
      });
    }
  });
})();
