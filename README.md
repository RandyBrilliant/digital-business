# Digital Business — course slides

Static slide site for a 10-session, 2-hour **Digital Business** course taught to accounting students in Indonesia. English lecture language, with Indonesian key terms (UMKM, pembukuan, faktur pajak, and similar) as glossary chips.

Lecturer: **Randy Brilliant**.

Works fully offline: self-hosted fonts, icons, brand marks, and photos. No CDN, no server required. Open `index.html` or deploy the repo to GitHub Pages.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 4173
```

Then visit `http://127.0.0.1:4173/`.

Classroom controls (every deck):

| Key | Action |
| --- | --- |
| ← → Space | Previous / next (no wraparound) |
| Home / End | First / last |
| O | Overview grid |
| F | Fullscreen |
| S | Presenter view (notes + timer) |
| ? | Shortcut list |

Slide URLs use `#slide-3`. A reload keeps your place. Print the page to PDF — one 16:9 slide per page.

## Deploy to GitHub Pages

The site is pure static files at the repository root (no build step).

1. Push this repository to GitHub (any public repo you own).
2. **Settings → Pages**.
3. Source: **Deploy from a branch**.
4. Branch: `main` (or `master`), folder: `/ (root)`.
5. Save. After a minute the course hub is at `https://<user>.github.io/<repo>/`.

Use **relative paths only** — already the case. Do not add a custom `<base href>`.

If Pages refuses folders, add an empty `.nojekyll` file at the repo root (this repo includes one).

## Folder structure

```
index.html                 Course hub
sessions/01.html … 10.html One deck per session
assets/css/deck.css        Shared visual system + print stylesheet
assets/js/engine.js        Scaling, hash nav, presenter, overview
assets/fonts/              Plus Jakarta Sans (OFL)
assets/icons/              Lucide icons (ISC)
assets/brands/             Simple Icons (CC0) + wordmark badges
assets/img/photos/         Bundled Unsplash photos
```

## Design rules

- One 1920×1080 stage, scaled to the projector (reveal.js-style). The stage does not shrink with the window.
- Headlines 56–80px, body/labels ≥28px, card icons 64–120px, big numbers 80–120px.
- Cards hug content; leftover space is a photo, funnel, chart, or color slab — not an empty white tile.
- Real Simple Icons marks when the icon is published (Shopee, Instagram, WhatsApp, Gmail, GA4, Meta, TikTok, Bukalapak, Blogger). Otherwise a wordmark in the brand color (Tokopedia, QRIS, GoPay, OVO, DANA, Google Ads, Lazada, Blibli).
- `node tools/qa-slides.mjs` flags overflow, type under 28px at design size, and slides with more than 45% empty stage.

## Slide counts

| Session | File | Slides |
| --- | --- | ---: |
| Hub | `index.html` | — |
| 01 Introduction | `sessions/01.html` | 17 |
| 02 E-Commerce | `sessions/02.html` | 15 |
| 03 Digital Marketing | `sessions/03.html` | 23 |
| 04 Social Media | `sessions/04.html` | 15 |
| 05 Analytics | `sessions/05.html` | 15 |
| 06 Payments | `sessions/06.html` | 15 |
| 07 CRM | `sessions/07.html` | 15 |
| 08 Strategy | `sessions/08.html` | 15 |
| 09 SME transformation | `sessions/09.html` | 15 |
| 10 Capstone | `sessions/10.html` | 15 |

## Facts corrected vs the old site

| Old claim | What we teach now | Source |
| --- | --- | --- |
| Tokopedia is a GoTo company | TikTok / ByteDance has been the controlling shareholder (75.01%) since 31 Jan 2024; GoTo holds 24.99% | Reuters, 31 Jan 2024; GoTo disclosure |
| Bukalapak as a current physical marketplace | Closed physical-goods marketplace in early 2025 (last orders into February); focus on virtual goods and Mitra | Reuters, 8 Jan 2025; Jakarta Post, 17 Jan 2025 |
| Bukalapak was the first tech company on IDX | First Indonesian **unicorn** to IPO on IDX (BUKA, Aug 2021), not the first technology listing | Contemporary IPO coverage |
| Platform cards labelled “2024” with 100M+ MAU | No stale year labels; no memorised MAU figures | Dropped as unverified for 2026 |
| “Only 13% of SMEs are digital” | Retired. Onboarding is widespread; depth (books, tax, margin) is the gap | Government and trade sources disagree on a single % |
| Mitra Bukalapak “30 million+” | Not used. Last widely published company figures were lower and dated | Wikipedia/company history through 2023; treat live counts as unverified |
| Retention “5×” vs “5–25×” | Taught as a **5–25×** study range; students must compute their own CAC vs CRC | Amy Gallo, HBR, 29 Oct 2014 |
| “QRIS is mandatory for merchants” | QRIS is the national **QR standard**; PSPs that offer QR must use it. A cash-only stall is not breaking a QR law | Bank Indonesia QRIS pages |
| S09 roadmap every step `[DONE]` | Every step is **to-do / in progress / blocked** | Template leftover |
| S10 “code review” | Presentation + Q&A. Not a programming course | — |
| Erigo “Rp 300B”, Kopi Kenangan “US$1B”, Netflix price points, Power BI “US$10”, TikTok “min Rp 200k/day”, “2–5%” marketplace fee | Removed or labelled as teaching illustrations | Unverified or too perishable |
| Jl. Padang Galoba | Dropped | Address typo |

**Still treat with care:** BI QRIS user/merchant counts (June 2026 release — dated on the slide). Marketplace fee bands change by category and month — look up the live seller centre. Coretax / e-Faktur process details can move; we teach the idea, not a filing walkthrough.

## License

Course materials: use and adapt for teaching. Fonts: Plus Jakarta Sans (SIL OFL). Icons: Lucide (ISC). Brand SVGs: Simple Icons (CC0). Photos: Unsplash License.
