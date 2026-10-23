# Haritavanam — Product Requirements (Consolidated)

Source of truth for product behaviour. Derived from `project-context/05_Product_Requirements_Document_Haritavanam.md` (consolidated PRD) and earlier drafts. Items marked **Proposed**, **Open decision** or **Later phase** are not confirmed.

## 1. Vision and goals
Haritavanam helps people register, locate, monitor and care for trees and planted fields through a responsive, installable PWA. It maintains records over time, encourages shared responsibility, and makes approved plant information accessible via QR codes.

Goals (PRD §3): stable accounts and records; distinct tree (point) vs field (polygon) representation; clear owner + optional monitor; care activity with configurable watering schedule and history; location/plant-type discovery; QR access; inquiry tickets; optional disease analysis; weather/season insights; admin tools; responsive/accessible/secure.

## 2. Non-goals / constraints (initial)
No custom ML model training; no guaranteed native sensor access (e.g. lux); no public exposure of private contacts/precise locations by default; no automatic ownership transfer from activity score; no commitment to a specific stack/API until reviewed (PRD §4).

## 3. Users and roles
- **Registered user:** account, records, care updates, tickets, feedback (subject to permissions).
- **Record owner:** creator by default; manages record; may invite/approve monitor (policy TBD).
- **Monitor:** approved helper; at most one active monitor per record (two responsible people total). Access to care info only.
- **Administrator:** reviews monitoring requests, tickets, care history, inactive ownership, audited ownership actions. Enforced server-side.
- **Public visitor / QR scanner:** only explicitly public fields; no account required to read public info unless decided.

## 4. Core concepts / terminology
Plant record (generic), tree record (individual, map pin), field record (area/polygon + marker), owner, monitor, care log, monitoring request, support ticket, QR destination. "Plan" in original notes means "plant" (confirm). See PRD §6.

## 5. Information architecture (pages)
Splash/Welcome; Sign in/Sign up; Dashboard/Map; Explore/Plant catalogue; Add Record; Plant/Field Details; QR Centre/Scanner; Inquiry/Support; Disease Check; Settings/Profile; About Us; Feedback; Admin. Final navigation TBD (PRD §7). Avoid forcing every area into a top-level tab.

## 6. Feature requirements (summary)
- **Accounts (8.1):** name + phone/email; stable internal ID as relational key; sign-in/out/recovery; backend-enforced access.
- **Add tree/field (8.2):** type selector → photo → name/species (or suggestion) → description → location (point or polygon) → review → save → success + QR. Manual location fallback.
- **Map/discovery (8.3–8.4):** pins + polygons, filters by location and plant type, list alternative, loading/empty/error/permission states, privacy.
- **Owner/monitor (8.5):** request → admin review → approve/reject; capacity enforcement; status history.
- **Care (8.6):** weekly schedule, mark complete with actor+timestamp, history, next planned; distinguish planned vs completed.
- **Admin ownership transfer (8.7):** reviewed, audited, no automatic transfer from activity.
- **QR (8.8):** stable URL/opaque token, camera permission on demand, manual fallback, invalid/revoked states, limited public fields.
- **Tickets (8.9):** categories, description, optional photo, status table, admin queue/replies. Statuses: New, Under review, Waiting for user, Approved, Rejected, Resolved, Closed (simplify in design).
- **Disease check (8.10):** photo → existing service → possible conditions with uncertainty + next steps; consent and rate limits. Later phase.
- **Recommendations (8.11):** weather/season/species/context; graceful degradation; no unsupported sensor promises. Later phase.
- **Settings/About/Feedback (8.12):** profile, privacy/permission guidance, sign-out, project info, feedback with confirmation.

## 7. Data model (candidate)
User, PlantRecord (tree/field, owner, names, description, point/polygon, privacy/status, timestamps), PlantPhoto, MonitoringRequest, PlantMonitor, CareSchedule, CareLog, PlantObservation, QRReference, SupportTicket, TicketMessage, Feedback, DiseaseAnalysis, Recommendation, AdminAuditEvent. Use stable generated IDs; geospatial types; store photos in object storage; keep public QR fields separate. See `docs/DATA_MODEL.md`.

## 8. Non-functional
Responsive (mobile/tablet/desktop), accessibility (contrast, focus, no colour-only status, keyboard/touch), performance (pagination, clustering, image compression), security/privacy (HTTPS, server-side roles, input/upload validation, no precise-location leakage, rate limits), reliability (offline/timeout/permission states, safe retry).

## 9. Phased delivery (PRD §11)
Phase 0 requirements/tech decisions; Phase 1 PWA foundation + core records; Phase 2 fields + shared monitoring; Phase 3 support + admin; Phase 4 smart assistance; Phase 5 hardening/release. See `docs/IMPLEMENTATION_PLAN.md`.

## 10. Success measures and risks
Candidate measures and risk/mitigation table in PRD §12–§13. Key risks: disease inaccuracy, QR privacy, map tile limits, owner/monitor disputes, false inactivity, browser sensor limits, scope creep.

## 11. Acceptance criteria
Every major feature has acceptance criteria in PRD §8.* (referenced). Milestone quality gates in master prompt §12 / `docs/IMPLEMENTATION_PLAN.md`.

## 12. MVP vs later
MVP / capstone demonstration features (confirmed by owner): user database, add plant, generate QR, gather all plant information about the plant, photo-based disease detection. Remaining features (fields/polygons, monitoring, care logs, tickets, admin, weather, notifications) planned accordingly. Confirmed stack: React 18 + Vite + TS, Tailwind + shadcn/ui, Supabase, Leaflet + OSM, Vercel.
