# Digital Business — course slides

Static slide site for a 10-session, 2-hour **Digital Business** course taught to accounting students in Indonesia. English lecture language, with Indonesian key terms (UMKM, pembukuan, faktur pajak, and similar) as glossary chips.

Lecturer: **Randy Brilliant**.

Works fully offline: self-hosted fonts, no CDN, no server required. Open `index.html` or deploy the repo to GitHub Pages.

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
assets/fonts/              Self-hosted Source Serif 4 + Source Sans 3
assets/img/mark.svg        Course mark
```

## Design rules

- One 1920×1080 stage, scaled to the projector (reveal.js-style).
- No code-editor chrome, no programming-course leftovers.
- Tables, cards, funnels, and journal layouts — not monospaced comment dumps.
- Accounting and Indonesian tax/finance angles where they fit the session.

## License

Course materials: use and adapt for teaching. Fonts: SIL Open Font License (Source Serif 4, Source Sans 3).
