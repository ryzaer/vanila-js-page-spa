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
  
  /* ================= CONTRACT abaikan selain html ================= */
  function isDocumentNavigation(link) {
      if (!(link instanceof HTMLAnchorElement)) return false;

      // abaikan target / download
      if (link.target && link.target !== '_self') return false;
      if (link.hasAttribute('download')) return false;

      const href = link.getAttribute('href');
      if (!href) return false;

      // abaikan skema khusus
      if (/^(mailto|tel|javascript):/i.test(href)) return false;

      // abaikan hash-only
      if (href.startsWith('#')) return false;

      const url = new URL(link.href, location.origin);

      // abaikan external
      if (url.origin !== location.origin) return false;

      // abaikan asset non-dokumen
      if (/\.(css|json|png|jpe?g|gif|mp3|mp4|webm|svg|webp|ico|pdf|zip|rar|woff2?|ttf|eot|wasm)$/i.test(url.pathname)) {
          return false;
      }

      return true;
  }

  function normalizePath(href) {
    const url = new URL(href, location.origin);
    const path = url.pathname;
    const file = path.split('/').pop();

    // index normalization
    if (file === '' || file === 'index' || file === 'index.html') {
      return {
        fetch: 'index.html',
        url: '/' + url.search
      };
    }
    return {
      fetch: path,
      url: path + url.search
    };
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

  /* ================= REFETCH ERROR ================= */
  async function loadError(status, push, urlPath) {
    const errorPath = 'error.html';

    let parsed;

    if (PageCache.has(errorPath)) {
      parsed = PageCache.get(errorPath);
    } else {
      const res = await fetch(errorPath);
      if (!res.ok) return location.href = errorPath;

      const html = await res.text();
      parsed = parseHTML(html);
      PageCache.set(errorPath, parsed);
    }

    await applyPage(parsed, push, urlPath);
    renderError(status);
  }

  function renderError(code) {
    const map = {
      404: ['404', 'Halaman tidak ditemukan'],
      500: ['500', 'Kesalahan server'],
      403: ['403', 'Akses ditolak'],
      0:   ['Offline', 'Tidak dapat terhubung ke server']
    };

    const [title, msg] = map[code] || [code, 'Terjadi kesalahan'];

    document.getElementById('err-code').textContent = title;
    document.getElementById('err-message').textContent = msg;

    document.title = `${title} | ${msg}`;
  }
  /* ================= PAGE LOADER ================= */
  async function loadPage(fetchPath, push = true, urlPath = fetchPath) {
    log('loadPage', fetchPath);

    // 1️⃣ cache hit
    if (CONFIG.mode === 'prod' && PageCache.has(fetchPath)) {
      applyPage(PageCache.get(fetchPath), push, urlPath);
      return;
    }

    try {
      const res = await fetch(fetchPath);

      if (!res.ok) {
        return loadError(res.status, push, urlPath);
      }

      const html = await res.text();
      const parsed = parseHTML(html);

      PageCache.set(fetchPath, parsed);
      applyPage(parsed, push, urlPath);

    } catch (err) {
      // network / offline
      return loadError(0, push, urlPath);

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

  async function applyPage(data, push, urlPath) {
    await applyLayout(data.layout);

    document.querySelector('#app').innerHTML = data.content;
    document.title = data.title;

    if (push) {
      history.pushState({}, data.title, urlPath);
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
    const target = normalizePath(link.getAttribute('href'));
    loadPage(target.fetch, true, target.url);
  });

  window.addEventListener('popstate', () => {
    loadPage(location.pathname, false);
  });

  /* ================= INIT ================= */
  const initialLayout = document.body.dataset.layout || 'default';
  applyLayout(initialLayout);

})();
