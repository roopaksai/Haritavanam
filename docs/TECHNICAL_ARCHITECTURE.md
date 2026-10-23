# Haritavanam — Technical Architecture

## Logical components
PWA frontend (responsive UI, routing, components, client validation); PWA platform layer (manifest, service worker, caching); authentication; application API/backend; database; object storage; map layer; optional plant-identification/disease service; administration interface. (Architecture draft §1.)

## Confirmed stack (owner-approved 2026-10-24)
- Frontend: React 18 + Vite + TypeScript; React Router; Tailwind CSS + shadcn/ui; vite-plugin-pwa.
- Backend/data: Supabase (PostgreSQL + PostGIS, Auth, Storage, RLS) for MVP speed; revisit for cost/vendor concerns.
- Map: Leaflet + OpenStreetMap tiles (verify tile usage policy) or MapLibre + vector tiles.
- QR: `qrcode` (gen) + `html5-qrcode` (scan).
- Disease: Plant.id or similar (later phase; evaluate cost/region/licence).
- Weather: Open-Meteo or OpenWeatherMap (later phase).
- Hosting: Vercel (frontend) + Supabase.
- Testing: Vitest + Testing Library + Playwright.
Compare options against constraints, free tiers, licensing, security, maintenance before committing. Do not select solely by familiarity.

## Security and privacy
HTTPS in production; server-enforced roles; validate input/uploads; no precise-location or contact leakage; rate limits on tickets/QR/analysis; secrets via env (`.env.example` with placeholder names only); audit sensitive actions; backups and secret management.

## Offline and sync
Define which pages work offline, offline registration policy, photo upload timing, conflict handling, pending-sync UI, device-data retention before implementing. Do not assume offline from installability.

## Environment
`.env.example` lists variable names only (e.g. `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `FIGMA_ACCESS_TOKEN` is local-only and must not be committed).

## Integration notes
- Map tiles: open-source library ≠ unlimited/free tiles; review terms.
- Disease/weather APIs: evaluate before enabling.
- PWA splash: varies by platform; feature-detect.
