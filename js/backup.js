class VanillaSPA {
    constructor() {
        this.siteName = "Vanilla SPA Router";
        this.siteHead = "header";
        this.siteMain = "main";
        this.siteFoot = "footer";

        window.addEventListener('popstate', this.getPage);
    }

    route(event) {
        event = event || window.event;
        event.preventDefault();
        window.history.pushState({}, "", event.target.href);
        this.getPage();
    }

    async getPage() {
        const mainElement = document.querySelector(this.siteMain);
        if (!mainElement) return;

        const path = window.location.pathname;
        const part = path.split("/").filter(Boolean).pop() || 'index';
        const currentPage = mainElement.getAttribute("content");

        if (currentPage === part) return;

        let urls = path.endsWith('/') ? `${path}pages/${part}` : path.replace(part, `pages/${part}`);
        let html, page = part;

        try {
            let response = await fetch(urls);
            if (!response.ok) throw new Error('Page not found');
            html = await response.text();
        } catch (err) {
            console.error(err);
            try {
                let fallback = await fetch(urls.replace(page, '404'));
                html = await fallback.text();
                page = `404 ${page} Page Not Found`;
            } catch (e) {
                html = '<h1>404 Page Not Found</h1>';
            }
        }

        let parser = new DOMParser();
        let doc = parser.parseFromString(html, 'text/html');
        let template = doc.querySelector('template');
        mainElement.innerHTML = template ? template.innerHTML : html;

        mainElement.setAttribute('content', page);

        let title = part ? this.capitalize(page) + " ~ " : "";
        document.title = title + this.siteName;

        this.handleHashScroll();
    }

    getHash() {
        return window.location.hash ? window.location.hash.substring(1) : null;
    }

    handleHashScroll() {
        let hash = this.getHash();
        if (hash) {
            let element = document.getElementById(hash);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    capitalize(text) {
        return text.toLowerCase().replace(/\b[a-z]/g, letter => letter.toUpperCase());
    }
}


const F3 = new VanillaSPA();

// Cek hash (berfungsi)
console.log(F3.getHash());

// Pastikan this tetap terikat
window.onpopstate = F3.getPage.bind(F3);
window.onload = F3.getPage.bind(F3);

// Tangkap semua klik pada dokumen
document.addEventListener('click', function(event) {    
    // Pastikan klik terjadi pada elemen <a>
    const anchor = event.target.closest('a');    
    if (anchor) {
        const href = anchor.getAttribute('href');
        // Hanya intercept link internal (bukan hash, bukan target _blank)
        if (anchor.hasAttribute('href') && !anchor.hasAttribute('target') && !href.startsWith('#')) {
            F3.route(event);
        }
    }
});