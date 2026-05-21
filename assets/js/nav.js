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

  var platformStyle = 'style="display:block;font-size:13px;color:var(--text2);margin-bottom:9px"';
  function platform(name) {
    return '<span ' + platformStyle + '>' + name + '</span>';
  }

  var s = getActiveSection();
  var isHome = (s === 'home');

  /* ---- NAV HTML ---- */
  var navOnlyHTML = '<nav class="site-nav"><div class="nav-inner"><a href="/" class="nav-logo">\u0410. \u0421\u043c\u0438\u0440\u043d\u043e\u0432</a><div class="nav-links">' +
    navLink(isHome ? '#geography' : '/#geography', '\u0413\u0435\u043e\u0433\u0440\u0430\u0444\u0438\u044f', '', s) +
    navLink(isHome ? '#niches' : '/#niches', '\u041d\u0438\u0448\u0438', '', s) +
    navLink('/cases/', '\u041a\u0435\u0439\u0441\u044b', 'cases', s) +
    navLink(isHome ? '#advantages' : '/#advantages', '\u041f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0430', '', s) +
    navLink('/blog/', '\u0411\u043b\u043e\u0433', 'blog', s) +
    navLink(isHome ? '#contacts' : '/#contacts', '\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b', '', s) +
    '</div><div class="nav-right"><a href="https://t.me/alx_smr" target="_blank" rel="noopener" class="btn btn-primary">\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f</a></div>' +
    '<button class="nav-burger" aria-label="\u041c\u0435\u043d\u044e"><span></span><span></span><span></span></button>' +
    '</div></nav>';

  /* ---- NAV-MOBILE HTML ---- */
  var mobileOnlyHTML = '<div class="nav-mobile" id="nav-mobile">' +
    navLink(isHome ? '#geography' : '/#geography', '\u0413\u0435\u043e\u0433\u0440\u0430\u0444\u0438\u044f', '', s) +
    navLink(isHome ? '#niches' : '/#niches', '\u041d\u0438\u0448\u0438', '', s) +
    navLink('/cases/', '\u041a\u0435\u0439\u0441\u044b', 'cases', s) +
    navLink(isHome ? '#advantages' : '/#advantages', '\u041f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0430', '', s) +
    navLink('/blog/', '\u0411\u043b\u043e\u0433', 'blog', s) +
    navLink(isHome ? '#contacts' : '/#contacts', '\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b', '', s) +
    '<a href="https://t.me/alx_smr" target="_blank" rel="noopener" class="btn btn-primary">\u0421\u0432\u044f\u0437\u0430\u0442\u044c\u0441\u044f</a>' +
    '</div>';

  /* ---- FOOTER HTML ---- */
  var year = new Date().getFullYear();
  var footerHTML =
    '<footer class="site-footer">' +
      '<div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-brand">' +
            '<a href="/" class="nav-logo">\u0410. \u0421\u043c\u0438\u0440\u043d\u043e\u0432</a>' +
            '<p>\u0421\u043f\u0435\u0446\u0438\u0430\u043b\u0438\u0441\u0442 \u043f\u043e \u043f\u043b\u0430\u0442\u043d\u043e\u0439 \u0440\u0435\u043a\u043b\u0430\u043c\u0435 \u0441 2012 \u0433\u043e\u0434\u0430. \u041f\u043e\u043c\u043e\u0433\u0430\u044e \u0431\u0438\u0437\u043d\u0435\u0441\u0443 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u044c \u043a\u0430\u0447\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u044b\u0435 \u043b\u0438\u0434\u044b \u0438 \u0441\u0434\u0435\u043b\u043a\u0438.</p>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h5>\u041f\u043b\u0430\u0442\u0444\u043e\u0440\u043c\u044b</h5>' +
            platform('Google Ads') +
            platform('\u042f\u043d\u0434\u0435\u043a\u0441.\u0414\u0438\u0440\u0435\u043a\u0442') +
            platform('\u042f\u043d\u0434\u0435\u043a\u0441.\u0411\u0438\u0437\u043d\u0435\u0441') +
            platform('Microsoft Ads') +
            platform('LinkedIn Ads') +
          '</div>' +
          '<div class="footer-col">' +
            '<h5>\u041a\u043e\u043d\u0442\u0435\u043d\u0442</h5>' +
            '<a href="/blog/">\u0411\u043b\u043e\u0433</a>' +
            '<a href="/cases/">\u041a\u0435\u0439\u0441\u044b</a>' +
            '<a href="/#geography">\u0413\u0435\u043e\u0433\u0440\u0430\u0444\u0438\u044f</a>' +
            '<a href="/#advantages">\u041e \u043f\u043e\u0434\u0445\u043e\u0434\u0435</a>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h5>\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b</h5>' +
            '<a href="https://t.me/alx_smr" target="_blank" rel="noopener">Telegram</a>' +
            '<a href="https://www.linkedin.com/in/alexey-smirnov-740728200/" target="_blank" rel="noopener">LinkedIn</a>' +
            '<a href="mailto:a.smirnov1905@gmail.com">a.smirnov1905@gmail.com</a>' +
            '<a href="/privacy/">\u041f\u043e\u043b\u0438\u0442\u0438\u043a\u0430 \u043a\u043e\u043d\u0444\u0438\u0434\u0435\u043d\u0446\u0438\u0430\u043b\u044c\u043d\u043e\u0441\u0442\u0438</a>' +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<p>\u00a9 ' + year + ' \u0410\u043b\u0435\u043a\u0441\u0435\u0439 \u0421\u043c\u0438\u0440\u043d\u043e\u0432 \u00b7 smirnovads.com</p>' +
        '</div>' +
      '</div>' +
    '</footer>';

  /* ---- BACK TO TOP ---- */
  var btnHTML = '<button id="back-to-top" aria-label="\u041d\u0430\u0432\u0435\u0440\u0445" style="position:fixed;bottom:24px;right:24px;z-index:300;width:40px;height:40px;border-radius:10px;background:var(--bg3);border:1px solid var(--border2);color:var(--text2);display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;visibility:hidden;transform:translateY(8px);transition:opacity .22s,transform .22s,visibility 0s linear .22s"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><polyline points="18 15 12 9 6 15"/></svg></button>';

  /* ---- HELPERS ---- */
  function makeEl(html) {
    var t = document.createElement('div');
    t.innerHTML = html;
    return t.firstChild;
  }

  /* ---- INJECT ---- */
  function inject() {

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

    var newFooter = makeEl(footerHTML);
    var oldFooter = document.querySelector('footer.site-footer');
    if (oldFooter) {
      oldFooter.parentNode.replaceChild(newFooter, oldFooter);
    } else {
      document.body.appendChild(newFooter);
    }

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
