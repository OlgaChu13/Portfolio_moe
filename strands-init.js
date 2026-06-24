import { initStrands } from "./Strands.js";

const PALETTE = ["#F97316", "#7C3AED", "#06B6D4"];
const PALETTE_WARM = ["#F97316", "#ef7135", "#06B6D4"];

const PRESETS = {
  hero: {
    colors: PALETTE,
    count: 3,
    speed: 0.5,
    amplitude: 1,
    waviness: 1,
    thickness: 0.7,
    glow: 2.6,
    taper: 3,
    spread: 1,
    intensity: 0.6,
    saturation: 1.5,
    opacity: 1,
    scale: 1.5,
    glass: false,
  },
  accent: {
    colors: PALETTE_WARM,
    count: 2,
    speed: 0.35,
    amplitude: 0.85,
    waviness: 1.2,
    thickness: 0.55,
    glow: 2.2,
    taper: 3.5,
    spread: 1.2,
    intensity: 0.45,
    saturation: 1.3,
    opacity: 0.85,
    scale: 1.8,
    hueShift: 0.15,
  },
  subtle: {
    colors: PALETTE,
    count: 2,
    speed: 0.28,
    amplitude: 0.7,
    waviness: 0.9,
    thickness: 0.5,
    glow: 2,
    taper: 4,
    spread: 1.4,
    intensity: 0.35,
    saturation: 1.2,
    opacity: 0.7,
    scale: 2,
    hueShift: 0.3,
  },
  glass: {
    colors: ["#F97316", "#06B6D4", "#7C3AED"],
    count: 3,
    speed: 0.4,
    amplitude: 0.9,
    waviness: 1,
    thickness: 0.65,
    glow: 2.4,
    taper: 3,
    spread: 1,
    intensity: 0.55,
    saturation: 1.4,
    opacity: 0.9,
    scale: 1.6,
    glass: true,
    refraction: 1,
    dispersion: 1,
    glassSize: 1,
  },
};

function boot() {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion) return;

  document.querySelectorAll("[data-strands]").forEach((el) => {
    const preset = el.dataset.strands;
    const options = PRESETS[preset] || PRESETS.subtle;
    initStrands(el, options);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
