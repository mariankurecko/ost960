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
  let size, cx, cy, R, raf;
  let particles = [];

  document.fonts.ready.then(function () {
    setup();
    raf = requestAnimationFrame(tick);
  });

  function setup() {
    const rect = canvas.getBoundingClientRect();
    size = Math.round(rect.width || 500);
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

  function draw(t) {
    ctx.clearRect(0, 0, size, size);

    // Outer dashed ring — CW
    ctx.save();
    ctx.translate(cx, cy); ctx.rotate(t * 0.11);
    ctx.strokeStyle = 'rgba(201,74,28,0.28)'; ctx.lineWidth = 1; ctx.setLineDash([7,15]);
    ctx.beginPath(); ctx.arc(0,0,R,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    // Tick ring — CCW
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(-t * 0.055);
    for (var i = 0; i < 60; i++) {
      var a     = (i/60)*Math.PI*2;
      var major = i % 5 === 0;
      var inner = major ? R*0.77 : R*0.83;
      ctx.strokeStyle = major ? 'rgba(201,74,28,0.55)' : 'rgba(240,230,211,0.1)';
      ctx.lineWidth   = major ? 1.5 : 0.75;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*inner,    Math.sin(a)*inner);
      ctx.lineTo(Math.cos(a)*R*0.88,   Math.sin(a)*R*0.88);
      ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(240,230,211,0.06)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(0,0,R*0.88,0,Math.PI*2); ctx.stroke();
    ctx.restore();

    // Middle dashed — CW
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(t*0.04);
    ctx.strokeStyle='rgba(240,230,211,0.05)'; ctx.lineWidth=1; ctx.setLineDash([4,20]);
    ctx.beginPath(); ctx.arc(0,0,R*0.63,0,Math.PI*2); ctx.stroke();
    ctx.setLineDash([]); ctx.restore();

    // Cardinal spokes
    ctx.save();
    ctx.translate(cx,cy); ctx.rotate(t*0.035);
    ctx.strokeStyle='rgba(240,230,211,0.045)'; ctx.lineWidth=1;
    for (var i=0;i<4;i++) {
      var a=(i/4)*Math.PI*2;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a)*R*0.18, Math.sin(a)*R*0.18);
      ctx.lineTo(Math.cos(a)*R*0.6,  Math.sin(a)*R*0.6);
      ctx.stroke();
    }
    ctx.restore();

    // Orbiting dots — outer
    for (var i=0;i<10;i++) {
      var a    = (i/10)*Math.PI*2 + t*0.22;
      var p    = 0.35 + Math.sin(t*2.8+i*0.9)*0.28;
      ctx.fillStyle = 'rgba(201,74,28,'+p+')';
      ctx.beginPath();
      ctx.arc(cx+Math.cos(a)*R*0.88, cy+Math.sin(a)*R*0.88, i%3===0?2.8:1.5, 0, Math.PI*2);
      ctx.fill();
    }
    // Counter dots — inner
    for (var i=0;i<6;i++) {
      var a=(i/6)*Math.PI*2 - t*0.18;
      ctx.fillStyle='rgba(240,230,211,0.12)';
      ctx.beginPath();
      ctx.arc(cx+Math.cos(a)*R*0.63, cy+Math.sin(a)*R*0.63, 1.2, 0, Math.PI*2);
      ctx.fill();
    }

    // Drift particles
    particles.forEach(function(p){
      p.angle  += p.drift;
      p.radius += p.radialV*0.4;
      if (p.radius>R*0.55||p.radius<2) p.radialV*=-1;
      ctx.fillStyle='rgba(201,74,28,'+p.alpha+')';
      ctx.beginPath();
      ctx.arc(cx+Math.cos(p.angle)*p.radius, cy+Math.sin(p.angle)*p.radius, p.sz, 0, Math.PI*2);
      ctx.fill();
    });

    // Centre pulse
    var pulse = 0.5+Math.sin(t*2.2)*0.5;
    ctx.fillStyle='rgba(201,74,28,'+(0.4+pulse*0.35)+')';
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5+pulse*3, 0, Math.PI*2);
    ctx.fill();
    ctx.strokeStyle='rgba(201,74,28,'+(0.04+pulse*0.06)+')';
    ctx.lineWidth=1;
    ctx.beginPath();
    ctx.arc(cx, cy, R*0.22+pulse*R*0.04, 0, Math.PI*2);
    ctx.stroke();
  }

})();
