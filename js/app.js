(() => {

  /* ================= CONFIG ================= */
  const CONFIG = {
    root: document.currentScript.src.replace(/\/[^\/]+$/, ''),
    mode: location.hostname === 'localhost' ? 'dev' : 'prod'
  };

  const DEBUG = CONFIG.mode === 'dev';
  const log = (...a) => DEBUG && console.log('[SPA]', ...a);

  /* ================= LAYOUT MAP ================= */
  const LAYOUTS = {
    default: {
      nav: 'partials/nav-default.html',
      footer: 'partials/footer.html'
    },
    marketing: {
      nav: 'partials/nav-marketing.html',
      footer: 'partials/footer.html'
    }
  };

  const PageCache = new Map();
  const PartialCache = new Map();

  /* ================= STATE ================= */
  let currentLayout = null;
  
  /* ================= CONTRACT ================= */
  function isDocumentNavigation(link) {
    if (!link || !link.href) return false;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#')) return false;
    if (link.hasAttribute('target')) return false;
    if (/^https?:\/\//i.test(href)) return false;

    return href.endsWith('.html');
  }

  /* ================= PARTIAL LOADER ================= */
  async function loadPartial(selector, url) {
    const container = document.querySelector(selector);
    if (!container) return;

    if (container.dataset.source === url) return;

    let html = PartialCache.get(url);
    if (!html) {
      const res = await fetch(url);
      html = await res.text();
      PartialCache.set(url, html);
    }

    container.innerHTML = html;
    container.dataset.source = url;
  }

  /* ================= LAYOUT APPLIER ================= */
  async function applyLayout(nextLayout) {
    if (nextLayout === currentLayout) return;

    currentLayout = nextLayout;
    const cfg = LAYOUTS[nextLayout];
    if (!cfg) return;

    await loadPartial('#nav', cfg.nav);
    await loadPartial('#footer', cfg.footer);
  }

  /* ================= PAGE LOADER ================= */
  async function loadPage(path, push = true) {
    log('loadPage', path);

    if (CONFIG.mode === 'prod' && PageCache.has(path)) {
      applyPage(PageCache.get(path), push, path);
      return;
    }

    try {
      const res = await fetch(path);
      if (!res.ok) throw 'fetch failed';

      const html = await res.text();
      const parsed = parseHTML(html);

      PageCache.set(path, parsed);
      applyPage(parsed, push, path);

    } catch {
      location.href = path;
    }
  }

  function parseHTML(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');

    return {
      title: doc.title,
      content: doc.querySelector('#app').innerHTML,
      layout: doc.body.dataset.layout || 'default'
    };
  }

  async function applyPage(data, push, path) {
    await applyLayout(data.layout);

    document.querySelector('#app').innerHTML = data.content;
    document.title = data.title;

    if (push) {
      history.pushState({}, '', path);
    }
  }

  /* ================= PREFETCH ================= */
  document.addEventListener('mouseover', e => {
    const link = e.target.closest('a');
    if (!isDocumentNavigation(link)) return;

    const href = link.getAttribute('href');
    if (PageCache.has(href)) return;

    fetch(href)
      .then(r => r.text())
      .then(html => {
        PageCache.set(href, parseHTML(html));
        log('prefetched', href);
      });
  });

  /* ================= EVENTS ================= */
  document.addEventListener('click', e => {
    const link = e.target.closest('a');
    if (!isDocumentNavigation(link)) return;

    e.preventDefault();
    loadPage(link.getAttribute('href'));
  });

  window.addEventListener('popstate', () => {
    loadPage(location.pathname, false);
  });

  /* ================= INIT ================= */
  const initialLayout = document.body.dataset.layout || 'default';
  applyLayout(initialLayout);

})();
