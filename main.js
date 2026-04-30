/* ============================================
   SMIRNOVADS.COM — MAIN JS v1.2
   ============================================ */

const SITE = {
  formspreeId:  'YOUR_FORMSPREE_ID',
  telegramBot:  'YOUR_BOT_TOKEN',
  telegramChat: 'YOUR_CHAT_ID',
};

// ---- NAV BURGER ----
const burger     = document.querySelector('.nav-burger');
const mobileMenu = document.querySelector('.nav-mobile');

if (burger && mobileMenu) {
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  mobileMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
}

// ---- MODAL ----
const overlay    = document.querySelector('.modal-overlay');
const modalClose = document.querySelector('.modal-close');

function openModal() {
  if (overlay) { overlay.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal() {
  if (overlay) { overlay.classList.remove('open'); document.body.style.overflow = ''; }
}

document.querySelectorAll('[data-modal]').forEach(el => {
  el.addEventListener('click', e => { e.preventDefault(); openModal(); });
});
if (modalClose) modalClose.addEventListener('click', closeModal);
if (overlay)    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

// ---- LEAD FORM ----
const leadForm    = document.getElementById('lead-form');
const formSuccess = document.querySelector('.form-success');

if (leadForm) {
  leadForm.addEventListener('submit', async e => {
    e.preventDefault();
    const btn      = leadForm.querySelector('button[type=submit]');
    const origText = btn.textContent;
    btn.textContent = '...';
    btn.disabled    = true;

    const data    = Object.fromEntries(new FormData(leadForm));
    const message = `Новая заявка с smirnovads.com\n\nИмя: ${data.name}\nКонтакт: ${data.contact}\nПроект: ${data.message || '—'}`;

    await Promise.allSettled([
      fetch(`https://formspree.io/f/${SITE.formspreeId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data),
      }),
      fetch(`https://api.telegram.org/bot${SITE.telegramBot}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: SITE.telegramChat, text: message }),
      }),
    ]);

    leadForm.style.display = 'none';
    if (formSuccess) formSuccess.style.display = 'block';
    btn.textContent = origText;
    btn.disabled    = false;
  });
}

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

// ---- CASE ACCORDION ----
document.querySelectorAll('.case-header').forEach(header => {
  header.addEventListener('click', function () {
    const body   = this.nextElementSibling;
    const toggle = this.querySelector('.case-toggle');
    const isOpen = body.classList.contains('open');

    if (isOpen) {
      body.classList.remove('open');
      if (toggle) toggle.classList.remove('open');
    } else {
      body.classList.add('open');
      if (toggle) toggle.classList.add('open');

      // Animate metric bars
      const bodyBars = body.querySelectorAll('.bar-fill');
      bodyBars.forEach(b => { b.style.width = '0%'; });
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bodyBars.forEach(b => {
            setTimeout(() => { b.style.width = b.getAttribute('data-w') || '0%'; }, 120);
          });
        });
      });
    }
  });
});

// ---- ACTIVE NAV LINK ----
const sections = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');
if (sections.length && navLinks.length && 'IntersectionObserver' in window) {
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
