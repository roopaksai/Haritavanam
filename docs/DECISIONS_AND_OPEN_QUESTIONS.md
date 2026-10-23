# Haritavanam — Decisions and Open Questions

## Confirmed decisions
1. Brand colours: primary #3A5A40, secondary #A3B18A, background #F5F1E8, accent #EF4444 (from reference).
2. Tagline "Plant · Track · Preserve"; hero "A Greener Tomorrow".
3. Stable generated internal IDs as relational keys (never phone/email).
4. PWA approach (responsive, installable, permission-aware, no guaranteed native parity).
5. No custom ML model from scratch for disease analysis; use existing service.
6. QR codes encode stable URL/opaque token; never sensitive personal data.
7. Backend-enforced authorization for admin/owner/monitor roles.

## Proposed (not confirmed)
8. At most one active monitor per record (two responsible people total) — PRD §8.5. Applies to whole field or per tree? Owner direct approval?
9. Admin review required for monitoring requests — PRD §8.5. Can owner approve directly?
10. Proposed default stack: React+Vite+TS, Supabase, Leaflet+OSM, Tailwind+shadcn, Vercel — see TECHNICAL_ARCHITECTURE.md (not confirmed).

## Open decisions (PRD §14)
1. Does two-person rule apply to both trees and whole fields?
2. Must every monitoring request be admin-approved, or can owner approve?
3. Exact monitor actions beyond care logging?
4. Inactivity definition and safeguards before ownership transfer?
5. Fields visible to unauthenticated QR scanner?
6. Can fields contain multiple species/crops; holes/multiple plots?
7. Feasible disease-analysis service for budget/region?
8. Weather source and recommendation rules?
9. Is automatic lux measurement essential or is weather/season guidance sufficient?
10. Meaning of original "clients page"?
11. Should Explore/catalogue be separate from map dashboard?
12. Minimum feature set for capstone demonstration?

## Additional open items
- Navigation structure (separate pages vs flows within pages).
- Typography (font family + type scale) undecided.
- Offline scope and sync behaviour.
- Map tile provider licensing/cost.
- Admin provisioning and role model.
- Account deletion/data export/retention.
- Anonymous feedback policy.

## Conflicts recorded
- Page count: docs describe "seven pages" but inventory lists more areas. Resolution: finalize navigation after confirming "clients page" and MVP scope.
- "Plan" vs "plant" terminology in original notes. Resolution: standardize on "plant"; confirm with team.

## Blocking decisions requiring owner input
- MVP scope and navigation labels.
- Technology stack selection (cost/licensing/skills).
- Typography and Figma file creation (no Figma write tools available via MCP; user must create/provide file key).
- Disease/weather provider selection (budget).
- Reference image assets (not in repository).
