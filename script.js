/* OST 960 — interactions, lightbox, hero canvas */
(function () {
  'use strict';

  // ── Sticky nav ────────────────────────────────────────────────────────────
  const nav = document.getElementById('nav');
  function updateNav() { nav.classList.toggle('scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav();

  // ── Mobile nav ────────────────────────────────────────────────────────────
  const toggle   = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  toggle.addEventListener('click', function () {
    const open = this.getAttribute('aria-expanded') === 'true';
    this.setAttribute('aria-expanded', String(!open));
    navLinks.classList.toggle('open', !open);
    document.body.style.overflow = open ? '' : 'hidden';
  });
  navLinks.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
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

  // ── Active nav section highlight ──────────────────────────────────────────
  const anchors = navLinks.querySelectorAll('a[href^="#"]');
  const secObs  = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      const id = e.target.getAttribute('id');
      anchors.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + id); });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('[id]').forEach(function (s) { secObs.observe(s); });

  // ── Scroll fade-in ────────────────────────────────────────────────────────
  const fadeEls = document.querySelectorAll(
    '.activity-card, .gallery-item, .vision-mood-card, .ba-pair, .program-item, .meta-row, .about-text, .about-meta'
  );
  fadeEls.forEach(function (el) {
    el.style.opacity  = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  });
  const fadeObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.style.opacity  = '1';
      e.target.style.transform = 'translateY(0)';
      fadeObs.unobserve(e.target);
    });
  }, { threshold: 0.07 });
  fadeEls.forEach(function (el) { fadeObs.observe(el); });

  // Stagger grids
  ['.gallery-grid', '.program-grid', '.activities-grid'].forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (grid) {
      Array.from(grid.children).forEach(function (c, i) { c.style.transitionDelay = (i * 50) + 'ms'; });
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  LIGHTBOX
  // ══════════════════════════════════════════════════════════════════════════
  const lb         = document.getElementById('lightbox');
  const lbImg      = document.getElementById('lbImg');
  const lbCaption  = document.getElementById('lbCaption');
  const lbClose    = document.getElementById('lbClose');
  const lbPrev     = document.getElementById('lbPrev');
  const lbNext     = document.getElementById('lbNext');
  const lbBackdrop = document.getElementById('lbBackdrop');

  // Collect all lightbox-enabled items in DOM order
  var lbItems = [];
  var lbIdx   = 0;

  function buildLbItems() {
    lbItems = Array.from(document.querySelectorAll('[data-lightbox]'));
    lbItems.forEach(function (el, i) {
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.setAttribute('aria-label', el.dataset.caption || 'Otvoriť fotografiu');
      el.addEventListener('click',   function () { openLb(i); });
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); } });
    });
  }

  function openLb(idx) {
    lbIdx = idx;
    const item    = lbItems[idx];
    const src     = item.dataset.src  || item.querySelector('img').src;
    const alt     = item.querySelector('img').alt || '';
    const caption = item.dataset.caption || '';
    lbImg.src     = src;
    lbImg.alt     = alt;
    lbCaption.textContent = caption;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    updateArrows();
    lbClose.focus();
  }

  function closeLb() {
    lb.hidden = true;
    document.body.style.overflow = '';
    lbImg.src = '';
  }

  function showPrev() { if (lbIdx > 0) openLb(lbIdx - 1); }
  function showNext() { if (lbIdx < lbItems.length - 1) openLb(lbIdx + 1); }

  function updateArrows() {
    lbPrev.style.opacity        = lbIdx === 0 ? '0.25' : '1';
    lbPrev.style.pointerEvents  = lbIdx === 0 ? 'none' : '';
    lbNext.style.opacity        = lbIdx === lbItems.length - 1 ? '0.25' : '1';
    lbNext.style.pointerEvents  = lbIdx === lbItems.length - 1 ? 'none' : '';
  }

  lbClose.addEventListener('click', closeLb);
  lbBackdrop.addEventListener('click', closeLb);
  lbPrev.addEventListener('click', showPrev);
  lbNext.addEventListener('click', showNext);

  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape')     closeLb();
    if (e.key === 'ArrowLeft')  showPrev();
    if (e.key === 'ArrowRight') showNext();
  });

  // Basic touch swipe
  var touchStartX = 0;
  lb.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend',   function (e) {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) { dx < 0 ? showNext() : showPrev(); }
  });

  buildLbItems();

  // ══════════════════════════════════════════════════════════════════════════
  //  HERO CANVAS — OST 960 animated emblem
  // ══════════════════════════════════════════════════════════════════════════
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  // cW/cH = canvas logical size (non-square O letterform)
  // oW/oH = half-extents of the O rounded-rect ring
  // oRad  = corner radius of the O shape
  let cW, cH, cx, cy, R, oW, oH, oRad, raf;
  let particles = [];

  document.fonts.ready.then(function () {
    setup();
    raf = requestAnimationFrame(tick);
  });

  function setup() {
    const rect = canvas.getBoundingClientRect();
    cW = Math.round(rect.width  || 420);
    cH = Math.round(rect.height || 560);
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = cW * dpr;
    canvas.height = cH * dpr;
    ctx.scale(dpr, dpr);
    cx = cW / 2;
    cy = cH / 2;
    // R drives tick-mark radii and orbiting dots — use shorter half-dimension
    R  = Math.min(cW, cH) * 0.44;
    // O-shape half-extents: nearly fills the canvas with a little padding
    oW   = cW * 0.46;
    oH   = cH * 0.46;
    // Corner radius — large enough for a bold rounded-O feel
    oRad = Math.min(oW, oH) * 0.54;
    buildParticles();
  }

  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    setup();
    raf = requestAnimationFrame(tick);
  });

  function buildParticles() {
    particles = [];
    const count = Math.round((cW + cH) * 0.06);
    for (var i = 0; i < count; i++) {
      particles.push({
        angle:   Math.random() * Math.PI * 2,
        radius:  Math.random() * R * 0.52,
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

  // Helper: draw a centred rounded-rect path at (cx,cy) with half-extents hw×hh
  // and corner radius rad, scaled by factor s, with optional rotation.
  function oPath(hw, hh, rad) {
    ctx.roundRect(-hw, -hh, hw * 2, hh * 2, rad);
  }

  function draw(t) {
    ctx.clearRect(0, 0, cW, cH);

    // ── O-shape clip — everything is masked to the letterform ──────────────
    // Build clip path in raw canvas coords (no active translate) so subsequent
    // save/translate(cx,cy)/restore blocks don't accumulate an extra offset.
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - oW, cy - oH, oW * 2, oH * 2, oRad);
    ctx.clip();

    // Outer dashed O-ring — CW
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t * 0.11);
    ctx.strokeStyle = 'rgba(201,74,28,0.28)'; ctx.lineWidth = 1.5; ctx.setLineDash([7,15]);
    ctx.beginPath(); oPath(oW, oH, oRad); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    // Tick ring — CCW (tick marks arranged on the O outline via parametric walk)
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(-t * 0.055);
    for (var i = 0; i < 60; i++) {
      var a     = (i / 60) * Math.PI * 2;
      var major = i % 5 === 0;
      // Map angle to a point on the outer O ellipse approximation for tick positions
      var tx88  = Math.cos(a) * oW * 0.88;
      var ty88  = Math.sin(a) * oH * 0.88;
      var txIn  = Math.cos(a) * (major ? oW * 0.77 : oW * 0.83);
      var tyIn  = Math.sin(a) * (major ? oH * 0.77 : oH * 0.83);
      ctx.strokeStyle = major ? 'rgba(201,74,28,0.55)' : 'rgba(240,230,211,0.1)';
      ctx.lineWidth   = major ? 1.5 : 0.75;
      ctx.beginPath();
      ctx.moveTo(txIn, tyIn);
      ctx.lineTo(tx88, ty88);
      ctx.stroke();
    }
    // Inner guide O-ring for ticks
    ctx.strokeStyle = 'rgba(240,230,211,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); oPath(oW * 0.88, oH * 0.88, oRad * 0.88); ctx.stroke();
    ctx.restore();

    // Middle dashed O-ring — CW
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t * 0.04);
    ctx.strokeStyle = 'rgba(240,230,211,0.05)'; ctx.lineWidth = 1; ctx.setLineDash([4,20]);
    ctx.beginPath(); oPath(oW * 0.63, oH * 0.63, oRad * 0.63); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    // Cardinal spokes (unchanged — radial lines, naturally clipped)
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t * 0.035);
    ctx.strokeStyle = 'rgba(240,230,211,0.045)'; ctx.lineWidth = 1;
    for (var i = 0; i < 4; i++) {
      var a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * R * 0.18, Math.sin(a) * R * 0.18);
      ctx.lineTo(Math.cos(a) * R * 0.6,  Math.sin(a) * R * 0.6);
      ctx.stroke();
    }
    ctx.restore();

    // Orbiting dots — outer (follow the O ellipse)
    for (var i = 0; i < 10; i++) {
      var a  = (i / 10) * Math.PI * 2 + t * 0.22;
      var p  = 0.35 + Math.sin(t * 2.8 + i * 0.9) * 0.28;
      ctx.fillStyle = 'rgba(201,74,28,' + p + ')';
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * oW * 0.88,
        cy + Math.sin(a) * oH * 0.88,
        i % 3 === 0 ? 2.8 : 1.5, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // Counter dots — inner
    for (var i = 0; i < 6; i++) {
      var a = (i / 6) * Math.PI * 2 - t * 0.18;
      ctx.fillStyle = 'rgba(240,230,211,0.12)';
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * oW * 0.63,
        cy + Math.sin(a) * oH * 0.63,
        1.2, 0, Math.PI * 2
      );
      ctx.fill();
    }

    // Drift particles
    particles.forEach(function (p) {
      p.angle  += p.drift;
      p.radius += p.radialV * 0.4;
      if (p.radius > R * 0.55 || p.radius < 2) p.radialV *= -1;
      ctx.fillStyle = 'rgba(201,74,28,' + p.alpha + ')';
      ctx.beginPath();
      ctx.arc(cx + Math.cos(p.angle) * p.radius, cy + Math.sin(p.angle) * p.radius, p.sz, 0, Math.PI * 2);
      ctx.fill();
    });

    // Centre pulse
    var pulse = 0.5 + Math.sin(t * 2.2) * 0.5;
    ctx.fillStyle = 'rgba(201,74,28,' + (0.4 + pulse * 0.35) + ')';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5 + pulse * 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,74,28,' + (0.04 + pulse * 0.06) + ')';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 0.22 + pulse * R * 0.04, 0, Math.PI * 2);
    ctx.stroke();

    // End O-shape clip
    ctx.restore();
  }

})();
