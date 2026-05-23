/* ============================================
   SMIRNOVADS.COM — MAIN JS v1.4
   Animations · Bars · Cookie Banner
   nav.js is loaded directly in each HTML file
   ============================================ */

// ---- SCROLL ANIMATIONS ----
const fadeEls = document.querySelectorAll('.fade-up');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => io.observe(el));
} else {
  fadeEls.forEach(el => el.classList.add('visible'));
}

// ---- METRIC BARS ANIMATION ----
const bars = document.querySelectorAll('.bar-fill');
if (bars.length && 'IntersectionObserver' in window) {
  const barObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.style.width = el.dataset.w || '0%';
        barObs.unobserve(el);
      }
    });
  }, { threshold: 0.3 });
  bars.forEach(b => barObs.observe(b));
}

// ---- CASE ACCORDION ----
document.querySelectorAll('.case-header').forEach(header => {
  header.addEventListener('click', () => {
    const body   = header.nextElementSibling;
    const toggle = header.querySelector('.case-toggle');
    const isOpen = body.classList.contains('open');
    body.classList.toggle('open', !isOpen);
    if (toggle) toggle.classList.toggle('open', !isOpen);
    if (!isOpen) {
      body.querySelectorAll('.bar-fill').forEach(b => {
        setTimeout(() => { b.style.width = b.dataset.w || '0%'; }, 100);
      });
    }
  });
});

// ---- ACTIVE NAV LINK (home page sections) ----
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
if (sections.length && navLinks.length) {
  const secObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => secObs.observe(s));
}

// ---- COOKIE BANNER ----
(function () {
  const oldBanner = document.getElementById('cookie-banner');
  if (oldBanner) oldBanner.remove();

  if (localStorage.getItem('cookies_accepted')) return;

  const style = document.createElement('style');
  style.textContent = [
    '#cookie-banner{position:fixed;bottom:16px;left:50%;z-index:1000;',
    'width:min(920px,calc(100% - 32px));transform:translateX(-50%);',
    'background:#161515;border:1px solid rgba(255,255,255,.13);border-radius:12px;',
    'padding:10px 0;display:flex;align-items:center;box-shadow:0 10px 32px rgba(0,0,0,.28);}',
    '#cookie-banner .cb-inner{max-width:920px;margin:0 auto;padding:0 16px;',
    'display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap;width:100%;}',
    '#cookie-banner p{font-size:12px;color:#a09890;margin:0;max-width:700px;line-height:1.45;',
    'font-family:"Manrope",sans-serif;}',
    '#cookie-banner a{color:#f0a500;text-decoration:underline;}',
    '#cookie-banner button{background:transparent;color:#a09890;',
    'border:1px solid rgba(255,255,255,.13);border-radius:8px;padding:7px 16px;',
    'font-size:13px;font-weight:500;cursor:pointer;flex-shrink:0;',
    'font-family:"Manrope",sans-serif;transition:color .18s,border-color .18s;}',
    '#cookie-banner button:hover{color:#ede9e3;border-color:rgba(255,255,255,.25);}',
    '@media(max-width:600px){#cookie-banner{bottom:0;left:0;right:0;width:100%;transform:none;border-left:0;border-right:0;border-bottom:0;border-radius:12px 12px 0 0;}#cookie-banner .cb-inner{padding:0 16px;gap:10px;}#cookie-banner button{width:100%;justify-content:center;}}'
  ].join('');
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.id = 'cookie-banner';
  banner.innerHTML = [
    '<div class="cb-inner">',
    '<p>Продолжая использовать сайт, вы соглашаетесь с правилами обработки cookie-файлов. ',
    '<a href="/privacy/">Политика конфиденциальности</a>.</p>',
    '<button id="cookie-accept">Понятно</button>',
    '</div>'
  ].join('');
  document.body.appendChild(banner);

  document.getElementById('cookie-accept').addEventListener('click', function () {
    localStorage.setItem('cookies_accepted', '1');
    banner.remove();
  });
})();
