(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;

  document.addEventListener("DOMContentLoaded", function () {
    requestAnimationFrame(function () {
      document.body.classList.add("is-loaded");
    });
  });

  var header = document.querySelector(".site-header");

  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 60);
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var cursor = document.getElementById("cursor");

  if (cursor && !isTouch && !prefersReducedMotion) {
    var cx = 0;
    var cy = 0;
    var tx = 0;
    var ty = 0;

    document.addEventListener("mousemove", function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    function animateCursor() {
      cx += (tx - cx) * 0.18;
      cy += (ty - cy) * 0.18;
      cursor.style.transform = "translate(" + cx + "px, " + cy + "px)";
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    var hoverTargets = document.querySelectorAll(
      "a, button, .btn, .card, .work-item, .tech__item, .capability, .decay-card, [data-cursor='hover']"
    );

    hoverTargets.forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        cursor.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () {
        cursor.classList.remove("is-hover");
      });
    });
  } else if (cursor) {
    cursor.style.display = "none";
    document.body.style.cursor = "auto";
  }

  var mouseLayer = document.getElementById("mouseLayer");
  var hero = document.querySelector(".hero");

  if (mouseLayer && hero && !isTouch) {
    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      mouseLayer.style.setProperty("--mouse-x", x + "%");
      mouseLayer.style.setProperty("--mouse-y", y + "%");
    });
  }

  var particlesContainer = document.getElementById("particles");
  if (particlesContainer && !prefersReducedMotion) {
    var count = window.matchMedia("(max-width: 768px)").matches ? 18 : 35;
    for (var i = 0; i < count; i++) {
      var p = document.createElement("span");
      p.className = "particle";
      p.style.left = Math.random() * 100 + "%";
      p.style.top = Math.random() * 100 + "%";
      p.style.setProperty("--dx", (Math.random() - 0.5) * 80 + "px");
      p.style.setProperty("--dy", (Math.random() - 0.5) * 80 + "px");
      p.style.setProperty("--float-duration", 12 + Math.random() * 18 + "s");
      p.style.setProperty("--float-delay", Math.random() * 6 + "s");
      particlesContainer.appendChild(p);
    }
  }

  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  if (!isTouch && !prefersReducedMotion) {
    document.querySelectorAll(".capability").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) translateY(-6px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  var form = document.querySelector(".contact__form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var original = btn.textContent;
      btn.textContent = "Отправлено";
      btn.disabled = true;
      btn.style.background = "var(--success)";
      btn.style.borderColor = "var(--success)";
      setTimeout(function () {
        btn.textContent = original;
        btn.disabled = false;
        btn.style.background = "";
        btn.style.borderColor = "";
        form.reset();
      }, 2500);
    });
  }

  function initDecayCards() {
    if (typeof gsap === "undefined" || typeof DecayCard === "undefined") return;

    if (prefersReducedMotion || isTouch) {
      document.querySelectorAll(".decay-card-mount").forEach(function (el) {
        el.dataset.disabled = "true";
      });
    }

    DecayCard.initAll(".decay-card-mount");
  }

  initDecayCards();
})();
