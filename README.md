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
### Custom REWRITE RULE
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

    # =========================
    # 1. ROOT
    # =========================
    location = / {
        try_files /index.html =404;
    }

    # =========================
    # 2. HAPUS .html / .php DARI URL (BROWSER ONLY)
    # =========================
    location ~ ^/(.+)\.(html|php)$ {
        return 302 /$1$is_args$args;
    }

    # =========================
    # 3. FILE & FOLDER ASLI
    # =========================
    location / {
        try_files $uri $uri.html =404;
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
<IfModule mod_rewrite.c>
RewriteEngine On

# 1. Root
RewriteRule ^$ index.html [L]

# 2. Hapus .html / .php dari URL browser
# R=302 Dev , R=301 Prod
RewriteCond %{THE_REQUEST} \s/+(.*?)(?:\.html|\.php)([\s?])
RewriteRule ^ %1%2 [R=302,L]

# 3. File & folder asli → langsung
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]

# 4. Route SPA → file html jika ADA
RewriteCond %{REQUEST_FILENAME}.html -f
RewriteRule ^(.+)$ $1.html [L]

# ❌ TIDAK ADA fallback ke index.html di sini
</IfModule>

```