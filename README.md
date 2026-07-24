# PSK — Peruvian Street Kitchen website

Production-ready static rebuild of peruvianstreetkitchen.com in the new brand (ink/stone/leaf/flame, playbill system). Built 24 Jul 2026.

## Structure

```
site/                  ← the deployable site (everything in here goes live)
  index.html           single page: hero, sauce, menu, versus, reviews, find us
  assets/css/style.css
  assets/js/main.js    mobile menu, scroll reveals, sticky order bar, live open/closed status
  assets/img/          webp food shots, logo crops, favicon, og.jpg
  robots.txt, sitemap.xml
assets-src/            source material: real photos, nano-banana originals, process.py
.impeccable.md         design context (read before any redesign work)
```

## Deploy

Deployed via **GitHub Pages**. Pushing to `main` runs `.github/workflows/deploy.yml`,
which publishes the `site/` folder. The custom domain `peruvianstreetkitchen.com` is
pinned in `site/CNAME`.

DNS (at the registrar) points the apex at GitHub Pages:

```
A     @      185.199.108.153
A     @      185.199.109.153
A     @      185.199.110.153
A     @      185.199.111.153
CNAME www    sakibahmed09.github.io
```

Local preview: `python3 -m http.server 8840` inside `site/`.

Other static hosts work too (drag `site/` into Vercel or Netlify) if you ever move off Pages.

## Before switching the domain

1. **/donate** — the old site has a Donate page this build does not include. Port it or drop the route knowingly.
2. **COLLECT20** — the 20% offer is hardcoded in: offer bar, hero CTA, closer CTA, mobile menu, sticky bar. Change all five if the promo changes (grep COLLECT20 and "20%").
3. **Hours** live in three places: the hours list in index.html, the `HOURS` map in main.js, and the JSON-LD block. Keep them in sync.
4. Order links point at Toast (click & collect) and Deliveroo Chadwell Heath — both taken from the live ordering pages 24 Jul 2026.

## Regenerating imagery

`assets-src/process.py` converts sources → webp/icons/og. Food shots were generated with Nano Banana (Gemini 3 Pro Image) using the real photos in `assets-src/real-*.png` as references; prompts kept the actual dishes faithful. Regenerate at will, rerun process.py.
