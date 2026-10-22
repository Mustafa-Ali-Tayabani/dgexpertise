# DG Expertise — Angular site

Angular 21 (standalone, zoneless, signals) website for DG Expertise, built from the original `.dc.html` design prototype.

```bash
npm install
npm start          # http://localhost:4200
npm run build      # → dist/web
```

The site is a client-side rendered single-page app, so the host must fall back to `index.html` for every route.

## Routes

| Route | Design file |
|---|---|
| `/` | DG Expertise Homepage v2.dc.html |
| `/expertise` | Expertise.dc.html |
| `/diagnostic-amiante`, `/diagnostic-plomb`, `/diagnostic-pcb`, `/diagnostic-hap`, `/diagnostic-hbcd`, `/suivi-de-chantier`, `/mesures-d-air`, `/certificat-cecb`, `/gestion-des-dechets`, `/energies-renouvelables` | Service.dc.html (one per slug) |
| `/qui-sommes-nous`, `/references`, `/application`, `/formations-polluants`, `/bibliotheque-des-polluants`, `/laboratoires-partenaires`, `/actualites`, `/contact` | Page.dc.html (one per info page) |

## Layout

- `src/app/data/` — content copied verbatim from the prototype (`site-data`, `info-data`, `site-images`, plus the homepage copy in `home-data`). Edit copy here.
- `src/app/shared/` — header, footer, `<image-slot>`, the CTA pill (`a[dgCta]`), `a[dgLink]` (maps design hrefs like `./Contact.dc.html` to routes) and reusable sections (steps, promises, trust marquee, FAQ, band, hero).
- `src/app/pages/` — home, expertise, service, info-page.
- `src/styles.css` — all keyframes (`dgArrow`, `dgShine`, `dgPing`, `dgMarquee`, …) and shared button/hover classes.
- `public/swiss-map.html`, `public/office-map.html` — the interactive maps, embedded via iframe and driven by `postMessage`, the same way as in the prototype.

Language (FR/EN) is persisted in `localStorage` under `dg-lang`.

## Responsive

Desktop at 1440px matches the design exactly; wider screens stretch full-width. Below that, everything scales from three CSS variables in `src/styles.css`:
`--gx` (side gutter 64 → 40 → 20px), `--k` (section spacing ×1 → .75 → .6) and `--g64` (column gap), with display type set as `clamp(min, Npx/1440·100vw, Npx)`.
Grids collapse through the `r-*` classes defined at the bottom of `styles.css` (breakpoints 1200 / 1024 / 900 / 640px). The header switches to a burger menu below 1200px.


## Content from dgexpertise.ch

Service and info page copy, images, the 33 news articles and the legal pages were imported from the live WordPress site.
- Images are hosted locally under `public/assets/site/` (same folder structure as `wp-content/uploads`).
- Articles: `public/content/articles.json` (index, FR + EN titles/excerpts) and `public/content/articles/<slug>.html` (sanitised body, French only), shown at `/actualites/<slug>`.
- Legal pages: `src/app/data/legal-data.ts` → `/mentions-legales`, `/protection-des-donnees`.

## Motion

- `src/app/core/motion.service.ts`: Lenis smooth scroll (desktop), scroll reveals (applied automatically to headings, grid items, split blocks, bands), hero intro, hero/photo parallax, top progress bar.
- `src/app/shared/cursor.component.ts`: service-themed cursor pinned to the pointer (no easing/idle motion): reticle → ring on links, service badge with animated icon on service links, framed scan lens on photos ("Scan · Pb" on service pages), "Lire" on articles.
- `src/app/shared/icons.ts`: line icons per service/page (asbestos fibres, Pb tile, PCB/HAP molecules, CECB bars…), shared by the cursor and the mega menu.
- Header mega menu (`shared/header.component.*`): Expertise → services by group with live photo preview + quote/booking; Information → info pages + latest article.
- Page transitions use the Router's View Transitions (`::view-transition-*` rules in `styles.css`).
- Mark any element with `data-no-reveal` to opt it out. Everything is disabled under `prefers-reduced-motion`; the cursor and smooth scroll only run on fine pointers (not touch).

## Booking ("Prendre rendez-vous")

The header button opens a 4-step booking panel (`src/app/shared/booking/`): service(s) + meeting type → canton/address/building → date & time slot → contact details, then a confirmation screen with an `.ics` download.
- On a service page the service is pre-selected. Any URL with `?rdv` opens the panel (`?rdv=plomb` pre-selects a service).
- **Where requests go** (booking panel *and* the Contact page form) — `src/app/core/forms.config.ts`:
  - `email: 'dev@dgexpertise.ch'` with `endpoint: ''` (current): opens the visitor's email app pre-filled to that address.
  - Create a free form at https://formspree.io, then set `endpoint: 'https://formspree.io/f/<your-id>'` — submissions are sent directly, no email app needed.
- Dates: weekdays only, from the next business day up to 60 days ahead; slots follow office hours (8–12h, 13–17h).

## Google reviews

`src/app/core/reviews.service.ts` shows all 5★ Google reviews (homepage card + Expertise page) and the live rating/count, read from the reviews Worker in `../reviews-worker` (setup guide in its README). Until `feed` is set in `src/app/data/google-reviews.ts`, the three real reviews quoted on dgexpertise.ch and the 4.6 / 25 score are used.

## Passcode (site preview lock)

`middleware.js` (Vercel Routing Middleware) locks the whole deployed site — pages, images and data — behind a passcode page.
- Set **`SITE_PASSCODE`** in Vercel → Project → Settings → Environment Variables (Production, and Preview if wanted), then redeploy.
- Visitors who enter it get a secure cookie valid 30 days. Changing the passcode logs everyone out.
- Remove the variable (and redeploy) to open the site to the public. Local `ng serve` is never locked.
