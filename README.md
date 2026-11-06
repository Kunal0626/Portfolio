# Kunal Singh: portfolio

Plain HTML, CSS and JS. No build step, no dependencies, no trackers.

```
index.html   page content + the SVG diagrams
style.css    all styling (neo-brutalist "retro OS" look, day/night themes)
script.js    terminal, explorer, project dialog, starfield, theme toggle
theme.js     tiny head script that sets the theme before first paint
vercel.json  clean URLs + security headers (CSP, X-Frame-Options, ...)
assets/      Kunal_Singh_Resume.pdf
```

## Deploy on Vercel

**Option A: Vercel CLI**
```bash
cd kunal-portfolio
npx vercel          # first time: log in, accept defaults, Framework = "Other"
npx vercel --prod   # publish
```

**Option B: GitHub + dashboard**
1. Push this folder to a GitHub repo.
2. vercel.com/new, import the repo. Framework preset: **Other**. Leave Build Command and Output Directory empty.
3. Deploy. Every push redeploys.

Rename the project in Vercel to get a URL like `kunal-singh.vercel.app`.

## Things to update as you go

- **Project status:** in `index.html`, each project is an `<article class="proj" data-status="building" data-repo="">`.
  - When a project is really finished, change `data-status="building"` to `data-status="done"`.
  - Add its repo: `data-repo="https://github.com/Kunal0626/chainlog"`. The GitHub button turns on and the NOW.LOG card updates by itself.
- **Photo:** the avatar is an SVG shield. To use a photo, put `profile.jpg` in `assets/` and replace the `<svg>…</svg>` inside `.avatar-frame` with `<img src="assets/profile.jpg" alt="Kunal Singh">`.
- **Résumé:** replace `assets/Kunal_Singh_Resume.pdf` and keep the filename.
- **Project text and details:** the short text is in `index.html`; the "Details" popups and terminal output come from the `PROJECTS` object at the top of `script.js`.

## Test locally
```bash
cd kunal-portfolio
python3 -m http.server 4173
```
Open http://localhost:4173

## Notes
- Phone number is intentionally not on the public page.
- The CSP in `vercel.json` only allows your own files plus Google Fonts. If you add another script or font host, add it there.
