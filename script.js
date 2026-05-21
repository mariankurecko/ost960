/* OST 960 — interactions + hero canvas */

(function () {
  'use strict';

  // ── Sticky nav ────────────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Mobile nav toggle ─────────────────────────────────────────────────────
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    const expanded = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!expanded));
    navLinks.classList.toggle('open', !expanded);
    document.body.style.overflow = expanded ? '' : 'hidden';
  });
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });

  // ── Active nav link ───────────────────────────────────────────────────────
  const sections  = document.querySelectorAll('[id]');
  const navAnchors = navLinks.querySelectorAll('a[href^="#"]');

  const sectionObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(function (a) {
        a.classList.toggle('active', a.getAttribute('href') === '#' + id);
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(function (s) { sectionObserver.observe(s); });

  // ── Fade-in on scroll ─────────────────────────────────────────────────────
  const fadeEls = document.querySelectorAll(
    '.activity-card, .vision-card, .mood-card, .program-item, .meta-row, .about-text, .about-meta, .real-item'
  );
  fadeEls.forEach(function (el) {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const fadeObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      fadeObserver.unobserve(entry.target);
    });
  }, { threshold: 0.08 });
  fadeEls.forEach(function (el) { fadeObserver.observe(el); });

  document.querySelectorAll('.activities-grid, .program-grid, .real-grid').forEach(function (grid) {
    Array.from(grid.children).forEach(function (child, i) {
      child.style.transitionDelay = (i * 55) + 'ms';
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  HERO CANVAS — OST 960 animated emblem
  // ══════════════════════════════════════════════════════════════════════════
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let size, cx, cy, R, raf;
  let particles = [];
  let fontLoaded = false;

  // Wait for Space Grotesk then start
  document.fonts.ready.then(function () {
    fontLoaded = true;
    setup();
    raf = requestAnimationFrame(tick);
  });

  function setup() {
    // Match CSS-set canvas display size
    const rect = canvas.getBoundingClientRect();
    size = Math.round(rect.width || 500);
    // Retina
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    cx = size / 2;
    cy = size / 2;
    R  = size * 0.42;
    buildParticles();
  }

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    setup();
    raf = requestAnimationFrame(tick);
  });

  function buildParticles() {
    particles = [];
    const count = Math.round(size * 0.12);
    for (let i = 0; i < count; i++) {
      const angle  = Math.random() * Math.PI * 2;
      const radius = Math.random() * R * 0.52;
      particles.push({
        angle,
        radius,
        drift:   (Math.random() * 0.004 + 0.001) * (Math.random() < 0.5 ? 1 : -1),
        radialV: (Math.random() - 0.5) * 0.12,
        sz:      Math.random() * 1.8 + 0.4,
        alpha:   Math.random() * 0.28 + 0.06,
      });
    }
  }

  function tick(ts) {
    raf = requestAnimationFrame(tick);
    draw(ts * 0.001);
  }

  function draw(t) {
    ctx.clearRect(0, 0, size, size);

    // ── 1. Outer ring — slow CW dashes ──────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.11);
    ctx.strokeStyle = 'rgba(201,74,28,0.28)';
    ctx.lineWidth = 1;
    ctx.setLineDash([7, 15]);
    ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── 2. Tick ring — slow CCW ──────────────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-t * 0.055);
    for (let i = 0; i < 60; i++) {
      const a      = (i / 60) * Math.PI * 2;
      const major  = i % 5 === 0;
      const inner  = major ? R * 0.77 : R * 0.83;
      ctx.strokeStyle = major
        ? 'rgba(201,74,28,0.55)'
        : 'rgba(240,230,211,0.1)';
      ctx.lineWidth = major ? 1.5 : 0.75;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * inner,     Math.sin(a) * inner);
      ctx.lineTo(Math.cos(a) * R * 0.88,  Math.sin(a) * R * 0.88);
      ctx.stroke();
    }
    // Thin ring line
    ctx.strokeStyle = 'rgba(240,230,211,0.06)';
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.88, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    // ── 3. Middle dashed ring — slow CW ─────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.04);
    ctx.strokeStyle = 'rgba(240,230,211,0.05)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 20]);
    ctx.beginPath(); ctx.arc(0, 0, R * 0.63, 0, Math.PI * 2); ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // ── 4. Cardinal spokes ───────────────────────────────────────────────────
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.035);
    ctx.strokeStyle = 'rgba(240,230,211,0.045)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.18, Math.sin(a) * R * 0.18);
      ctx.lineTo(Math.cos(a) * R * 0.6,  Math.sin(a) * R * 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // ── 5. Orbiting accent dots ──────────────────────────────────────────────
    for (let i = 0; i < 10; i++) {
      const a     = (i / 10) * Math.PI * 2 + t * 0.22;
      const pulse = 0.35 + Math.sin(t * 2.8 + i * 0.9) * 0.28;
      const x = cx + Math.cos(a) * R * 0.88;
      const y = cy + Math.sin(a) * R * 0.88;
      ctx.fillStyle = `rgba(201,74,28,${pulse})`;
      ctx.beginPath();
      ctx.arc(x, y, i % 3 === 0 ? 2.8 : 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 6. Counter-orbit small dots (inner) ──────────────────────────────────
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2 - t * 0.18;
      const x = cx + Math.cos(a) * R * 0.63;
      const y = cy + Math.sin(a) * R * 0.63;
      ctx.fillStyle = `rgba(240,230,211,0.12)`;
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 7. Drift particles ───────────────────────────────────────────────────
    particles.forEach(function (p) {
      p.angle  += p.drift;
      p.radius += p.radialV * 0.4;
      if (p.radius > R * 0.55 || p.radius < 2) p.radialV *= -1;
      const x = cx + Math.cos(p.angle) * p.radius;
      const y = cy + Math.sin(p.angle) * p.radius;
      ctx.fillStyle = `rgba(201,74,28,${p.alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, p.sz, 0, Math.PI * 2);
      ctx.fill();
    });

    // ── 8. OST text ───────────────────────────────────────────────────────────
    const fOst = Math.round(R * 0.5);
    ctx.font      = `700 ${fOst}px 'Space Grotesk', sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // soft heat glow
    ctx.shadowColor = 'rgba(201,74,28,0.35)';
    ctx.shadowBlur  = R * 0.15;
    ctx.fillStyle   = 'rgba(240,230,211,0.13)';
    ctx.fillText('OST', cx, cy - fOst * 0.1);
    ctx.shadowBlur = 0;

    // ── 9. 960 text ───────────────────────────────────────────────────────────
    const f960 = Math.round(R * 0.54);
    ctx.font      = `700 ${f960}px 'Space Grotesk', sans-serif`;
    ctx.shadowColor = 'rgba(201,74,28,0.45)';
    ctx.shadowBlur  = R * 0.2;
    ctx.fillStyle   = 'rgba(201,74,28,0.22)';
    ctx.fillText('960', cx, cy + f960 * 0.9);
    ctx.shadowBlur = 0;

    // ── 10. Centre pulse ─────────────────────────────────────────────────────
    const pulse  = 0.5 + Math.sin(t * 2.2) * 0.5;
    const dotR   = 2.5 + pulse * 3;
    ctx.fillStyle = `rgba(201,74,28,${0.4 + pulse * 0.35})`;
    ctx.beginPath();
    ctx.arc(cx, cy + (f960 * 0.9 - fOst * 0.1) / 2 - f960 * 0.45 + fOst * 0.05, dotR, 0, Math.PI * 2);
    ctx.fill();

    // small inner ring pulse
    const ringAlpha = 0.04 + pulse * 0.06;
    ctx.strokeStyle = `rgba(201,74,28,${ringAlpha})`;
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.22 + pulse * R * 0.04, 0, Math.PI * 2);
    ctx.stroke();
  }

})();
