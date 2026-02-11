# Vanila JS SPA “mini framework” tanpa framework.
Javascript SPA STRICT dengan Layout deklaratif yang sudah tersedia Cache per halaman atau partial serta otomatis mode Dev & Prod
### 📁 STRUKTUR FOLDER
```
vanila-js-page-spa/
│
├── index.html
├── about.html
├── contact.html
│
├── partials/
│   ├── nav-default.html
│   ├── nav-marketing.html
│   └── footer.html
│
└── js/app.js
```
### ✅ Kelebihan
```
✔ HTML source of truth
✔ SPA type accelerator, bukan router
✔ Aman untuk SEO
✔ Elemen partial tidak direload jika sama
✔ Layout deklaratif & eksplisit
✔ Mudah migrasi ke PHP / Laravel / SSR
✔ Bisa hidup lama tanpa refactor besar
```
### Custom URL REWRITE 
```
/index.html → /index
/about.html → /about
/contct.html → /contct
```
#### .nginx
```
server {
    listen 80;
    server_name localhost;

    root /var/www/html;
    index index.html;

    # ROOT
    location = / {
        try_files /index.html =404;
    }

    # REMOVE .html / .php FROM URL (BROWSER ONLY)
    location ~ ^/(.+)\.(html|php)$ {
        return 302 /$1$is_args$args;
    }

    # SPA ROUTE HANDLER
    location / {
        try_files $uri $uri.html /index.html;
    }

    # PHP (jika pakai PHP-FPM)
    location ~ \.php$ {
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        fastcgi_pass unix:/run/php/php-fpm.sock;
    }
}
```
#### .htaccess
```
```