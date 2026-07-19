# Algorequiem — deployment & editing guide

## What changed

The site is no longer one HTML file. It's now:

```
index.html            ← shell: landing markup, reading-view scaffold, script tags
favicon.svg            ← browser tab icon
engine/
  styles.css            ← all shared CSS (unchanged from before, just extracted)
  engine.js             ← all shared behaviour (unchanged from before, just extracted
                           and made to read content from movements/ instead of
                           having Androït's content hardcoded into it)
movements/
  androit.js             ← Movement I — full content, status: 'sealed'
  sileicon.js             ← Movement II — placeholder, status: 'sealed'
  of-vectors.js           ← Movement III — placeholder
  synced-up.js            ← Movement IV — placeholder
  pie-gpu.js              ← Movement V — placeholder
  agnus-data.js           ← Movement VI — placeholder
  flops-aeterna.js        ← Movement VII — placeholder
  lib-erase.js            ← Movement VIII — placeholder
  in-parameter.js         ← Movement IX — placeholder
```

Every visible behaviour is identical to what's currently live — this is a
reorganisation, not a redesign. It's been tested end-to-end in a headless
browser (contents list building, sealed/live gating, entering Androït,
page rendering, term tooltips, the bg-code panel, the heading tumble, and
the call-line) before being handed to you.

## Deploying to Netlify

Your current Netlify deploy is a single `index.html`. This new version is
a **folder** — Netlify needs the whole thing, with `engine/` and
`movements/` kept as subfolders (not flattened).

**If you're using Netlify's drag-and-drop deploy** (Sites → your site →
Deploys → drag a folder onto the deploy area, or the same on the "add new
site" screen): drag the whole `site` folder — the one containing
`index.html`, `favicon.svg`, `engine/`, and `movements/` — onto Netlify.
Don't drag the individual files one at a time; drag the parent folder so
the subfolder structure comes with it.

**If you're using Netlify CLI** (`netlify deploy`): run it from inside
the `site` folder, or point `--dir` at it, e.g.:
```
netlify deploy --dir=site --prod
```

**If you're using git-based deploys**: commit the whole `site` folder
structure to your repo (replacing the old single `index.html` at the
root) and push.

After deploying, do a hard refresh (Netlify serves the new files
immediately, but your browser may have the old single-file version
cached).

## Going live with a movement

Open `movements/<name>.js` and change one line:

```js
status:   'sealed',
```
to
```js
status:   'live',
```

That's it — no other file needs to change. The engine will automatically:
- render that movement's contents-list row as clickable
- enable the `.globl _start` button and Enter-key entry if it's the
  first live movement in the sequence, sending readers straight into
  the reading view (the waitlist modal only shows while no movement is
  live yet — it turns itself off the moment Androït's status flips)
- build its poem pages, wire up its exegesis terms, and drive the
  bg-code panel from its data

## The waitlist modal

While no movement is `'live'`, `.globl _start` opens a modal instead of
entering the reading view: a tumbling "The cursor is waiting" heading
with a blinking accent-red cursor, and links out to Instagram, YouTube,
and TikTok. It's pure chrome — lives entirely in `engine/engine.js`
(`openWaitlistModal` / `closeWaitlistModal`) and `engine/styles.css`,
and isn't tied to any movement file, so it needs no upkeep as movements
go live one at a time.

When you're ready to move it to the `call   II_sileicon` link at the
foot of Androït instead (once Androït is live but Sileicon is still
sealed), that's a small follow-up: the call-line link currently has no
click handler at all, just a hover tumble — add one that opens the same
modal when the target movement (read via `currentNextLabel`) is sealed.
Ask in a future session and I can wire that up when you're there.

## Building a new movement's content

Copy the shape in `movements/androit.js` (for a movement that's poem
pages + tappable terms, same as Androït) or see
`engine-movement-contract.md` from earlier in this conversation for how
`type: 'custom'` movements (like Sileicon is expected to be) plug in —
they supply their own `render(container)` function instead of a `pages`
array, and the engine still handles the landing row, the transition, the
heading, and the call-line around it.

## Favicon

Generated from your uploaded 512×512 mark: `favicon.ico` (16/32/48
multi-res), `favicon-16x16.png`, `favicon-32x32.png`,
`apple-touch-icon.png` (180×180), `android-chrome-192x192.png`,
`android-chrome-512x512.png`, and `site.webmanifest` tying the two
Android sizes together with your void/accent theme colours. All are
referenced from the `<link>` tags in `<head>` and just need to sit at
the site root next to `index.html` — already in place in this bundle.

If you have the rest of a favicon-generator kit for this same mark
(sometimes includes `mstile-*.png` / `browserconfig.xml` for Windows
tiles), send those over and I'll wire them in too — not essential, just
extra polish for that platform.
