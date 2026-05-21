/* ============================================
   SMIRNOVADS.COM — NAV & FOOTER TEMPLATE
   Edit this file to update nav/footer on all pages
   ============================================ */

(function () {

  /* ---- ACTIVE NAV ITEM ---- */
  function getActiveSection() {
    var p = window.location.pathname;
    if (p.indexOf('/cases/') === 0 && p.length > 8) return 'case';
    if (p.indexOf('/cases') === 0) return 'cases';
    if (p.indexOf('/blog/') === 0 && p.length > 7) return 'blog-post';
    if (p.indexOf('/blog') === 0) return 'blog';
    return 'home';
  }

  function navLink(href, label, section, activeSection) {
    var isActive = false;
    if (section === 'cases' && (activeSection === 'cases' || activeSection === 'case')) isActive = true;
    if (section === 'blog' && (activeSection === 'blog' || activeSection === 'blog-post')) isActive = true;
    var style = isActive ? ' style="color:var(--text);border-bottom:2px solid var(--accent);padding-bottom:2px"' : '';
    return '<a href="' + href + '"' + style + '>' + label + '</a>';
  }

  var s = getActiveSection();
  var isHome = (s === 'home');

  /* ---- NAV HTML ---- */
  var navOnlyHTML = [
    '<nav class="site-nav">',
      '<div class="nav-inner">',
        '<a href="/" class="nav-logo">А. Смирнов</a>',
        '<div class="nav-links">',
          navLink(isHome ? '#geography' : '/#geography', 'География', '', s),
          navLink(isHome ? '#niches' : '/#niches', 'Ниши', '', s),
          navLink('/cases/', 'Кейсы', 'cases', s),
          navLink(isHome ? '#advantages' : '/#advantages', 'Преимущества', '', s),
          navLink('/blog/', 'Блог', 'blog', s),
          navLink(isHome ? '#contacts' : '/#contacts', 'Контакты', '', s),
        '</div>',
        '<div class="nav-right">',
          '<a href="https://t.me/alx_smr" target="_blank" rel="noopener" class="btn btn-primary">Связаться</a>',
        '</div>',
        '<button class="nav-burger" aria-label="Меню"><span></span><span></span><span></span></button>',
      '</div>',
    '</nav>'
  ].join('');

  /* ---- NAV-MOBILE HTML ---- */
  var mobileOnlyHTML = [
    '<div class="nav-mobile" id="nav-mobile">',
      navLink(isHome ? '#geography' : '/#geography', 'География', '', s),
      navLink(isHome ? '#niches' : '/#niches', 'Ниши', '', s),
      navLink('/cases/', 'Кейсы', 'cases', s),
      navLink(isHome ? '#advantages' : '/#advantages', 'Преимущества', '', s),
      navLink('/blog/', 'Блог', 'blog', s),
      navLink(isHome ? '#contacts' : '/#contacts', 'Контакты', '', s),
      '<a href="https://t.me/alx_smr" target="_blank" rel="noopener" class="btn btn-primary">Связаться</a>',
    '</div>'
  ].join('');

  /* ---- FOOTER HTML ---- */
  var year = new Date().getFullYear();
  var footerHTML = [
    '<footer class="site-footer">',
      '<div class="container">',
        '<div class="footer-top">',
          '<div class="footer-brand">',
            '<a href="/" class="nav-logo">А. Смирнов</a>',
            '<p>Специалист по платной рекламе с 2012 года. Помогаю бизнесу получать качественные лиды и сделки.</p>',
          '</div>',
          '<div class="footer-col">',
            '<h5>Платформы</h5>',
            '<span>Google Ads</span>',
            '<span>Яндекс.Директ</span>',
            '<span>Яндекс.Бизнес</span>',
            '<span>Microsoft Ads</span>',
            '<span>LinkedIn Ads</span>',
          '</div>',
          '<div class="footer-col">',
            '<h5>Контент</h5>',
            '<a href="/blog/">Блог</a>',
            '<a href="/cases/">Кейсы</a>',
            '<a href="/#geography">География</a>',
            '<a href="/#advantages">О подходе</a>',
          '</div>',
          '<div class="footer-col">',
            '<h5>Контакты</h5>',
            '<a href="https://t.me/alx_smr" target="_blank" rel="noopener">Telegram</a>',
            '<a href="https://www.linkedin.com/in/alexey-smirnov-740728200/" target="_blank" rel="noopener">LinkedIn</a>',
            '<a href="mailto:a.smirnov1905@gmail.com">a.smirnov1905@gmail.com</a>',
            '<a href="/privacy/">Политика конфиденциальности</a>',
          '</div>',
        '</div>',
        '<div class="footer-bottom">',
          '<p>© ' + year + ' Алексей Смирнов · smirnovads.com · <a href="/privacy/" style="color:var(--text3)">Политика конфиденциальности</a></p>',
          '<div class="footer-socials">',
            '<a href="https://t.me/alx_smr" target="_blank" rel="noopener">Telegram</a>',
            '<a href="https://www.linkedin.com/in/alexey-smirnov-740728200/" target="_blank" rel="noopener">LinkedIn</a>',
          '</div>',
        '</div>',
      '</div>',
    '</footer>'
  ].join('');

  /* ---- BACK TO TOP ---- */
  var btnHTML = '<button class="back-to-top" id="back-to-top" aria-label="Наверх" style="position:fixed;bottom:24px;right:24px;z-index:300;width:40px;height:40px;border-radius:10px;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .22s,transform .22s,visibility 0s linear .22s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="18 15 12 9 6 15"/></svg></button>';

  /* ---- HELPERS ---- */
  function makeEl(html) {
    var t = document.createElement('div');
    t.innerHTML = html;
    return t.firstChild;
  }

  /* ---- INJECT ---- */
  function inject() {

    // NAV — separate containers to avoid DOM-move bug
    var newNav    = makeEl(navOnlyHTML);
    var newMobile = makeEl(mobileOnlyHTML);

    var oldNav = document.querySelector('nav.site-nav');
    if (oldNav) {
      oldNav.parentNode.replaceChild(newNav, oldNav);
    } else {
      document.body.insertBefore(newNav, document.body.firstChild);
    }

    var oldMobile = document.querySelector('.nav-mobile');
    if (oldMobile) {
      oldMobile.parentNode.replaceChild(newMobile, oldMobile);
    } else {
      document.body.insertBefore(newMobile, document.body.children[1]);
    }

    // FOOTER
    var newFooter = makeEl(footerHTML);
    var oldFooter = document.querySelector('footer.site-footer');
    if (oldFooter) {
      oldFooter.parentNode.replaceChild(newFooter, oldFooter);
    } else {
      document.body.appendChild(newFooter);
    }

    // BACK TO TOP
    if (!document.getElementById('back-to-top')) {
      document.body.appendChild(makeEl(btnHTML));
    }
    var btn = document.getElementById('back-to-top');
    if (btn) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 400) {
          btn.style.opacity = '1';
          btn.style.visibility = 'visible';
          btn.style.transform = 'translateY(0)';
          btn.style.transition = 'opacity .22s,transform .22s,visibility 0s linear 0s';
        } else {
          btn.style.opacity = '0';
          btn.style.visibility = 'hidden';
          btn.style.transform = 'translateY(8px)';
          btn.style.transition = 'opacity .22s,transform .22s,visibility 0s linear .22s';
        }
      }, { passive: true });
      btn.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // BURGER
    var burger     = document.querySelector('.nav-burger');
    var mobileMenu = document.querySelector('.nav-mobile');
    if (burger && mobileMenu) {
      burger.addEventListener('click', function () {
        burger.classList.toggle('open');
        mobileMenu.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
      });
      mobileMenu.querySelectorAll('a').forEach(function (a) {
        a.addEventListener('click', function () {
          burger.classList.remove('open');
          mobileMenu.classList.remove('open');
          document.body.style.overflow = '';
        });
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }

})();
