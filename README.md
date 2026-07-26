# PSK — Peruvian Street Kitchen website

Production-ready static rebuild of peruvianstreetkitchen.com in the new brand (ink/stone/leaf/flame, playbill system). Built 24 Jul 2026.

## Structure

```
site/                  ← the deployable site (everything in here goes live)
  index.html           homepage: hero, sauce, menu, versus, story, reviews, catering, find us
  catering/index.html  full order builder: items, minimums, event details, enquiry
  contact/index.html   contact cards, hours, message composer
  donate/index.html    Winter Warmth Campaign: meal matcher, bank details
  404.html             branded fallback so old inbound links land somewhere useful
  assets/css/style.css
  assets/js/main.js      mobile menu, scroll reveals, sticky order bar, live open/closed status
  assets/js/catering.js  order builder, minimum validation, enquiry composer
  assets/js/contact.js   message composer
  assets/js/donate.js    meal matcher, copy bank details
  assets/img/            webp food shots, logo crops, favicon, og.jpg
  CNAME, robots.txt, sitemap.xml
assets-src/            source material: real photos, nano-banana originals, process.py
.impeccable.md         design context (read before any redesign work)
```

## Forms without a backend

The old Next.js site posted enquiries through `/api/*` routes to an SMTP inbox. This
build is static, so each form instead composes a plain-text enquiry and hands it to
**WhatsApp** (primary) or the visitor's **mail client** (`hello@peruvianstreetkitchen.com`).
No server, no secrets, and the customer keeps a copy of what they sent.

If you ever want true form posts back, drop in Formspree/Basin and point the two
`send-*` handlers at it — the message-building functions already return the full body.

## Cache busting

`style.css`, the JS files and the hero images all carry a `?v=N` query. **Bump N in every
HTML file whenever you change CSS/JS or replace a hero image**, otherwise returning
visitors keep the cached copy.

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

## Things to keep in sync

1. **Bank details** on `/donate/` (`donate/index.html` and the copy handler in `donate.js`)
   were carried over from the old site: Sifat Ahmed, 31975353, 60-83-71, ref `donation`.
   **Confirm these are still correct** — wrong details send money to the wrong place.
   The £10-per-meal figure also lives in both files.
2. **COLLECT20** — the 20% offer is hardcoded in the offer bar, hero CTA, closer CTA,
   mobile menu and sticky bar, on every page. Grep `COLLECT20` and `20%`.
3. **Hours** live in three places: the hours list in `index.html`, the same list in
   `contact/index.html`, and the `HOURS` map in `main.js` (plus the JSON-LD block).
4. **Menu prices are deliberately absent.** Toast is the single source of truth, reached
   through the order links, so prices can never go stale here. The only money on the
   site is the donation amount.
5. **Catering minimums** are `data-min` attributes on each `.cat` block (20 boxes,
   2 wing boxes, 5 of everything else).
6. Order links point at Toast (click & collect) and Deliveroo Chadwell Heath — both
   taken from the live ordering pages 24 Jul 2026.

## Not carried over from the old site

- `/taseel` and `/tending-hearts` (plus their admin views and order APIs) were one-off
  campaign pages; Taseel already showed "Ordering Is Now Closed". They now hit the
  branded 404. Say the word if either needs reviving.
- The waitlist email signup is gone — the shop is open, so the CTA is to order.

## Regenerating imagery

`assets-src/process.py` converts sources → webp/icons/og. Food shots were generated with Nano Banana (Gemini 3 Pro Image) using the real photos in `assets-src/real-*.png` as references; prompts kept the actual dishes faithful. Regenerate at will, rerun process.py.
