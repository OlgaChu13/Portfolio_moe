/**
 * DecayCard — vanilla JS port of React Bits DecayCard
 * Requires GSAP (global gsap)
 */
(function (global) {
  "use strict";

  var instances = [];
  var cursor = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
  var cachedCursor = { x: cursor.x, y: cursor.y };
  var winsize = { width: window.innerWidth, height: window.innerHeight };
  var rafId = null;
  var listenersBound = false;
  var uid = 0;

  function lerp(a, b, n) {
    return (1 - n) * a + n * b;
  }

  function map(x, a, b, c, d) {
    return ((x - a) * (d - c)) / (b - a) + c;
  }

  function distance(x1, x2, y1, y2) {
    return Math.hypot(x1 - x2, y1 - y2);
  }

  function DecayCard(mountEl, options) {
    this.mountEl = mountEl;
    this.id = ++uid;
    this.options = Object.assign(
      {
        width: 300,
        height: 400,
        image: "",
        baseFrequency: 0.015,
        numOctaves: 5,
        seed: 4,
        maxDisplacement: 400,
        movementBound: 50,
        disabled: false
      },
      options
    );

    this.imgValues = {
      imgTransforms: { x: 0, y: 0, rz: 0 },
      displacementScale: 0
    };

    this.contentEl = mountEl.querySelector(".decay-card-text");
    this.svgRoot = null;
    this.displacementMap = null;
    this.active = false;

    this._build();
    instances.push(this);
  }

  DecayCard.prototype._build = function () {
    var opts = this.options;
    var filterId = "imgFilter-" + this.id;

    this.mountEl.classList.add("decay-card");
    this.mountEl.style.width = opts.width + "px";
    this.mountEl.style.height = opts.height + "px";

    var svgWrap = document.createElement("div");
    svgWrap.className = "decay-card__svg-wrap";

    svgWrap.innerHTML =
      '<svg viewBox="-60 -75 720 900" preserveAspectRatio="xMidYMid slice" class="decay-card__svg" aria-hidden="true">' +
        '<filter id="' + filterId + '">' +
          '<feTurbulence type="turbulence" baseFrequency="' + opts.baseFrequency + '" numOctaves="' + opts.numOctaves + '" seed="' + opts.seed + '" stitchTiles="stitch" x="0%" y="0%" width="100%" height="100%" result="turbulence1" />' +
          '<feDisplacementMap class="decay-card__displacement" in="SourceGraphic" in2="turbulence1" scale="0" xChannelSelector="R" yChannelSelector="B" x="0%" y="0%" width="100%" height="100%" result="displacementMap3" />' +
        '</filter>' +
        '<g><image href="' + opts.image + '" x="0" y="0" width="600" height="750" filter="url(#' + filterId + ')" preserveAspectRatio="xMidYMid slice" /></g>' +
      '</svg>';

    this.mountEl.insertBefore(svgWrap, this.contentEl);
    this.svgRoot = svgWrap;
    this.displacementMap = svgWrap.querySelector(".decay-card__displacement");

    if (this.contentEl) {
      this.contentEl.classList.add("decay-card__text");
    }

    if (!opts.disabled) {
      this._bindVisibility();
      ensureGlobalLoop();
    } else {
      this.mountEl.classList.add("decay-card--static");
    }
  };

  DecayCard.prototype._bindVisibility = function () {
    var self = this;
    if (!("IntersectionObserver" in window)) {
      self.active = true;
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          self.active = entry.isIntersecting;
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(this.mountEl);
  };

  DecayCard.prototype.tick = function () {
    if (!this.active || this.options.disabled || !global.gsap) return;

    var opts = this.options;
    var iv = this.imgValues;
    var mb = opts.movementBound;

    var targetX = lerp(iv.imgTransforms.x, map(cursor.x, 0, winsize.width, -120, 120), 0.1);
    var targetY = lerp(iv.imgTransforms.y, map(cursor.y, 0, winsize.height, -120, 120), 0.1);
    var targetRz = lerp(iv.imgTransforms.rz, map(cursor.x, 0, winsize.width, -10, 10), 0.1);

    if (targetX > mb) targetX = mb + (targetX - mb) * 0.2;
    if (targetX < -mb) targetX = -mb + (targetX + mb) * 0.2;
    if (targetY > mb) targetY = mb + (targetY - mb) * 0.2;
    if (targetY < -mb) targetY = -mb + (targetY + mb) * 0.2;

    iv.imgTransforms.x = targetX;
    iv.imgTransforms.y = targetY;
    iv.imgTransforms.rz = targetRz;

    gsap.set(this.svgRoot, {
      x: iv.imgTransforms.x,
      y: iv.imgTransforms.y,
      rotateZ: iv.imgTransforms.rz
    });

    var travelled = distance(cachedCursor.x, cursor.x, cachedCursor.y, cursor.y);
    iv.displacementScale = lerp(
      iv.displacementScale,
      map(travelled, 0, 200, 0, opts.maxDisplacement),
      0.06
    );

    gsap.set(this.displacementMap, { attr: { scale: iv.displacementScale } });
  };

  DecayCard.prototype.destroy = function () {
    var idx = instances.indexOf(this);
    if (idx > -1) instances.splice(idx, 1);
    if (instances.length === 0) stopGlobalLoop();
  };

  function renderAll() {
    for (var i = 0; i < instances.length; i++) {
      instances[i].tick();
    }
    cachedCursor.x = cursor.x;
    cachedCursor.y = cursor.y;
    rafId = requestAnimationFrame(renderAll);
  }

  function ensureGlobalLoop() {
    if (listenersBound) return;
    listenersBound = true;

    window.addEventListener("resize", function () {
      winsize = { width: window.innerWidth, height: window.innerHeight };
    });

    window.addEventListener("mousemove", function (ev) {
      cursor.x = ev.clientX;
      cursor.y = ev.clientY;
    });

    rafId = requestAnimationFrame(renderAll);
  }

  function stopGlobalLoop() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    listenersBound = false;
  }

  DecayCard.initAll = function (selector) {
    var mounts = document.querySelectorAll(selector || ".decay-card-mount");
    var cards = [];

    mounts.forEach(function (el) {
      var ds = el.dataset;
      cards.push(
        new DecayCard(el, {
          width: parseInt(ds.width, 10) || 300,
          height: parseInt(ds.height, 10) || 400,
          image: ds.image || "",
          baseFrequency: parseFloat(ds.baseFrequency) || 0.015,
          numOctaves: parseInt(ds.numOctaves, 10) || 5,
          seed: parseInt(ds.seed, 10) || 4,
          maxDisplacement: parseInt(ds.maxDisplacement, 10) || 400,
          movementBound: parseInt(ds.movementBound, 10) || 50,
          disabled: ds.disabled === "true"
        })
      );
    });

    return cards;
  };

  global.DecayCard = DecayCard;
})(window);
