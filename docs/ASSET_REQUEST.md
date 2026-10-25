# Haritavanam — Asset & Input Request

> Owner asked for the exact list of things to supply before the UI/UX rebuild starts.
> Status: **WAITING ON OWNER**
> Requested: 2026-10-25

Handover: drop files anywhere and tell me the path, or place them in
`app/public/brand/` using the exact filenames below. I will generate every
derivative (favicons, PWA sizes, iOS startup images, social preview) myself.

---

## 1. Must-have brand assets

| # | Asset | Format | Exact spec | Where it is used |
|---|---|---|---|---|
| M1 | **Logo mark** (icon/symbol only, no text) | SVG preferred, else PNG | 1024×1024, transparent background | Header, splash, QR label, app icon source, favicon |
| M2 | **Logo lockup** (mark + "Haritavanam" + optional tagline) | SVG preferred, else PNG | 2048 px wide, transparent | Welcome screen, About, install prompt |
| M3 | **App icon master** | PNG | 1024×1024, **no transparency, no rounded corners, no drop shadow** (the OS applies its own mask) | All PWA/Android/iOS icons |
| M4 | **Maskable icon** — or confirm M3 has ≥20% empty padding | PNG | 1024×1024 | Android adaptive icon (prevents clipping) |
| M5 | **Splash / launch artwork** | PNG | 1080×1920 portrait, either transparent or flat `#F5F1E8` — tell me which | Custom splash shown before the app paints |
| M6 | **Hero image** | JPG/PNG/WebP | 1600×1200 landscape **or** 1200×1600 portrait, ≥150 KB so it is not compressed mush | Welcome screen + Dashboard banner |

Current `app/src/assets/hero.png` is only **343×361** — too small; it will look blurry on any phone.

### If your logo only exists as a screenshot
Send the original source instead — `.svg`, `.ai`, `.pdf`, `.eps`, or a Figma frame link.
A screenshot cannot be turned into a crisp app icon.

---

## 2. Strongly recommended (small effort, big quality gain)

| # | Asset | Format | Spec | Why |
|---|---|---|---|---|
| R1 | **Light/reverse logo** (mark in white or beige) | SVG/PNG | same sizes as M1 | Needed on the olive `#3A5A40` header and splash |
| R2 | **Monochrome logo** (single-colour black) | SVG | — | Watermark on photos, print, favicons |
| R3 | **Custom UI icon set** | SVG | 24×24 grid, stroke 1.75–2 px, `currentColor`, no fills | Only if you dislike the default icon library. Needed names: home, plant, leaf, sprout, tree, map, map-pin, plus, scan-qr, camera, bell, search, filter, calendar, droplet, sun, thermometer, shield, alert, check, chevron-left/right, share, download, user, settings, log-out, edit, trash, ticket, info |
| R4 | **Demo plant photos** (4–8) | JPG | 1200 px long edge | Seeded records look real instead of grey boxes. Shot list: neem tree, young sapling, paddy/field row, field aerial, healthy leaf close-up, diseased leaf close-up |
| R5 | **Empty-state / onboarding illustrations** | SVG | transparent, 2–3 pieces | "No plants yet", "No tickets", "Scan a QR" |

If you send only **3–4 brand-specific icons** (leaf, tree, field), that is fine — I will use them
and match the rest of the set from a consistent library so stroke weights agree.

---

## 3. Do NOT send these — I will generate them

- `favicon.ico` + `favicon.svg` (derived from M1)
- `pwa-192x192.png`, `pwa-512x512.png`, `maskable-512x512.png`
- `apple-touch-icon.png` (180×180, flattened onto beige)
- iOS startup images for the common device sizes
- Open Graph / social preview image (1200×630)
- OG title/description copy

---

## 4. Answers I need (no files)

1. **Fonts** — do you own a brand typeface? If yes, send the files + licence.
   If no, I will use a pairing (display serif for headings, humanist sans for UI) loaded locally, not from a CDN.
2. **Demo location** — which city / campus should the seeded trees and fields sit on?
   Give a place name or lat/long, e.g. `Thrissur, Kerala` ≈ `10.5276, 76.2144`.
3. **Test credentials** — approve or change these. Proposed:

   | Role | Email | Password |
   |---|---|---|
   | Admin | `admin@haritavanam.test` | `Haritavanam@123` |
   | Owner | `owner@haritavanam.test` | `Haritavanam@123` |
   | Monitor | `monitor@haritavanam.test` | `Haritavanam@123` |

   Sign-in page will also get one-tap "Use demo account" buttons so you can jump between roles.
4. **Disease detection for now** — mock analyser with a deterministic fake result (my recommendation,
   keeps the flow demonstrable) or plug in a real API key later?
5. **Splash behaviour** — once per browser session (recommended) or on every load? Minimum 1.2 s or skip as soon as the app is ready?
6. **Backend** — confirm local-first: `server/` folder, Node + Express + SQLite file database, seeded demo data, JWT session cookies. No Supabase, no cloud account, runs with `npm run dev` at the repo root.

---

## 5. What happens the moment these land

1. Replace tokens and placeholder glyphs with the real logo, icon set, splash and type scale.
2. Rebuild every screen in the app shell (Welcome, Sign in, Dashboard, Map, Plant detail, Add wizard, QR, Admin, Tickets, Settings, About) with real states: loading skeletons, empty, error, permission-denied, offline.
3. Stand up `server/` with auth, plants, fields, care logs, monitoring requests, tickets, QR tokens and uploads; seed it; point the frontend at it.
4. Verify: build passes, unit + e2e tests run, primary journey clicked through, responsive screenshots at 360 / 768 / 1440, a11y checks, then record evidence in `progress.md`.
