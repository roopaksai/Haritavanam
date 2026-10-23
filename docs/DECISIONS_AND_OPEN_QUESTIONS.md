# Haritavanam — Decisions and Open Questions

## Confirmed decisions

### Product / policy
1. Brand colours: primary #3A5A40, secondary #A3B18A, background #F5F1E8, accent #EF4444 (from reference).
2. Tagline "Plant · Track · Preserve"; hero "A Greener Tomorrow".
3. Stable generated internal IDs as relational keys (never phone/email).
4. PWA approach (responsive, installable, permission-aware, no guaranteed native parity).
5. No custom ML model from scratch for disease analysis; use existing service.
6. QR codes encode stable URL/opaque token; never sensitive personal data.
7. Backend-enforced authorization for admin/owner/monitor roles.
8. Two-person rule (one owner + one monitor) applies per record, for both individual trees and whole fields.
9. Monitoring requests require administrator approval. Owner cannot approve directly; owner may suggest a candidate user to the admin, but only the admin can approve.
10. Fields are not visible to unauthenticated QR scanners (only approved/public fields shown).
11. A field cannot contain multiple species/crops and does not support holes or multiple separate plots (single polygon per field).
12. Automatic lux/ambient-light measurement is not essential; weather/season-based guidance is sufficient, with lux as an optional enhancement.
13. There is no "clients page" requirement; the user did not request one.
14. The map's secondary area is a "Plant page" (not an Explore/catalogue page), separate from the map dashboard.
15. MVP/capstone demonstration features: user database, add plant, generate QR, gather all plant information, photo-based disease detection. Remaining features planned accordingly.

### Technology (confirmed by owner)
16. Stack: React 18 + Vite + TypeScript, Tailwind CSS + shadcn/ui, Supabase (PostgreSQL/PostGIS + Auth + Storage + RLS), Leaflet + OpenStreetMap (verify tile terms), Vercel hosting, Vitest + Playwright. (Proposed default accepted.)

## Deferred / unanswered (proposed defaults)
- **Monitor actions beyond care logging (Q3):** Proposed default — monitor may view record details, care schedule/history and submit care logs only; no editing of record metadata, roles or QR. Owner/admin retain those.
- **Inactivity definition and safeguards before ownership transfer (Q4):** Proposed default — owner considered inactive after a configurable period (e.g. 90 days) with no care-log or login activity; admin reviews care history and context, notifies owner, waits a grace period, then may transfer ownership to monitor with audit trail. Exceptions for seasonal/dormant plants.
- **Disease-analysis service selection (Q7):** Deferred — evaluate Plant.id or similar for region/cost/licence before enabling.
- **Weather source and recommendation rules (Q8):** Deferred — proposed Open-Meteo (free) for MVP experiments; validate rules with reputable sources.

## Additional open items
- Navigation structure (separate pages vs flows within pages) — to finalize with Figma.
- Typography (font family + type scale) — undecided.
- Offline scope and sync behaviour — undefined.
- Map tile provider licensing/cost — unreviewed.
- Admin provisioning and role model — undefined.
- Account deletion/data export/retention — undefined.
- Anonymous feedback policy — undefined.

## Conflicts recorded
- "Seven pages" vs larger area inventory → finalize navigation after confirming MVP scope (resolved partly: Plant page separate from map; no clients page).
- "Plan" vs "plant" terminology → standardize on "plant".

## Blocking decisions requiring owner input
- Typography and Figma file creation: no Figma write tools via MCP; user must create/provide a file key (user will create a new file after restart).
- Reference image assets (logo/icon sheet, colour palette) not in repository.
- Disease/weather provider selection (budget) — deferred.
- Admin provisioning and role model — deferred.
