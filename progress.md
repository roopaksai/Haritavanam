# Haritavanam — Project Progress Tracker

> Persistent working record for the Haritavanam project. Any future OpenCode session or model should read this file first, then inspect the relevant source files before trusting recorded status.

---

## A. Project overview

- **Project name:** Haritavanam
- **Objective:** Build an installable Progressive Web App (PWA) that lets users register, locate, monitor and care for trees and planted fields, with map-based discovery, owner/monitor roles, care logs, QR access, support tickets, optional disease analysis, weather-aware recommendations, and an administrator experience.
- **Brand tagline:** Plant · Track · Preserve
- **Hero message:** A Greener Tomorrow
- **Current development phase:** Phase 7 (PWA foundation) in progress; Phases 2–3 completed and verified; Phase 4/5 partially done (Figma file populated via plugin, visual match unverified). Phase 7.5 (UI/UX rebuild + local backend) starting next, on hold for owner assets.
- **Current project status:** Application scaffold exists in `app/` and builds (`tsc --noEmit` clean, `vite build` emits SW + manifest). UI is placeholder-grade (Unicode glyphs, no real components). Supabase wiring is being **dropped** in favour of a local backend in `server/`. Asset handover pending — see `docs/ASSET_REQUEST.md`.
- **Last updated:** 2026-10-25 (direction change: no Supabase, local backend + demo accounts, full UI/UX rebuild; asset request issued)
- **Current development environment:** Windows 11 (win32), working directory `C:\Users\LENOVO\Desktop\Haritavanam`, Git repository on branch `main` (up to date with `origin/main`).
- **Selected model (this session):** opencode / beam-free.

---

## B. Phase checklist

Statuses: `NOT STARTED`, `IN PROGRESS`, `BLOCKED`, `COMPLETED — VERIFIED`, `COMPLETED — NOT VERIFIED`.

### 1. Project discovery and context review — COMPLETED — VERIFIED
- **Completed tasks:**
  - Reviewed all five project-context documents: brand/visual design, initial product requirements, architecture/data model draft, Figma UI design specification, consolidated PRD.
  - Confirmed repository baseline: only `README.md` tracked; `project-context/` untracked.
  - Created `progress.md` as the persistent handoff record.
- **Remaining tasks:** Re-review if new context documents or reference images are added.
- **Acceptance criteria:** Context documents read and summarized; repository state inspected.
- **Test/verification evidence:** Files read in session on 2026-10-24; `git status`/`git ls-tree` inspected.
- **Blockers/dependencies:** Reference images (logo/icon sheet, colour palette) are mentioned in docs but not present in repository.

### 2. Requirements consolidation — COMPLETED — VERIFIED
- **Completed tasks:**
  - Consolidated PRD created (`05_Product_Requirements_Document_Haritavanam.md`) covering vision, users/roles, information architecture, feature workflows, data model, non-functional requirements, phased delivery, risks and open questions.
  - Brand identity, colours and tagline recorded.
- **Remaining tasks:**
  - Resolve the open questions listed in PRD §14 (e.g. two-person rule scope, admin vs. owner approval, inactivity definition, public QR fields, multi-species fields, disease service, weather source, "clients page" meaning, MVP scope).
  - Confirm terminology ("plant" vs. "plan", "tree" vs. "field").
  - Confirm MVP feature set for the capstone demonstration.
- **Acceptance criteria:** All open decisions in PRD §14 either resolved or explicitly deferred with rationale; navigation labels finalized; MVP scope documented.
- **Test/verification evidence:** None (documentation review only).
- **Blockers/dependencies:** Requires project-team decisions; no external credentials yet.

### 3. Technical architecture and data model — COMPLETED — VERIFIED
- **Completed tasks:**
  - Logical components and candidate entities documented (`03_Architecture_and_Data_Model_Initial_Draft.md`, PRD §9).
  - Data design notes (stable IDs, geospatial types, validation, storage separation, audit history) recorded.
- **Remaining tasks:**
  - Select frontend framework/routing, UI component library, map library and tile provider.
  - Select backend framework/API, database, authentication provider, object/file storage, hosting/deployment.
  - Select QR library, disease-analysis service, weather provider.
  - Finalize schema, migrations and authorization model.
- **Acceptance criteria:** All technology choices in §5 of the architecture draft are decided and recorded with rationale; data model finalized.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Blocked on requirements consolidation (Phase 2) and team skill/cost review.

### 4. Design system and Figma setup — BLOCKED
- **Completed tasks:** None (specification only in `04_Figma_UI_Design_Specification.md`).
- **Remaining tasks:** Create Figma file; define variables/tokens; build reusable components; document typography (currently undecided).
- **Acceptance criteria:** Figma file exists with foundations, components, screens and prototype flows; tokens match brand colours.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Figma access/credentials; typography decision; Phase 3 completion not strictly required but recommended.

### 5. Figma screens and interactive prototype — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Build screen inventory from PRD §7; prototype primary journey (sign up → register plant → confirm location → generate QR → view record) plus QR scanning, ticket creation/tracking, admin access.
- **Acceptance criteria:** Clickable prototype covers primary journeys with loading/empty/error/permission-denied states.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 4.

### 6. Design validation — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Review prototype against acceptance criteria; compare implementation screenshots to Figma later.
- **Acceptance criteria:** Design review notes recorded; accessibility/contrast checks documented.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 5.

### 7. PWA foundation — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Scaffold app shell, manifest, service worker, caching strategy, responsive layout, installability.
- **Acceptance criteria:** Valid manifest; service worker registered; app installable on supported browsers; responsive shell renders.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 3 (stack selection).

### 8. Authentication and user management — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Implement sign up/sign in/sign out, stable internal user ID, profile, recovery, role checks.
- **Acceptance criteria:** Accounts have stable IDs; authorization enforced server-side.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 3, Phase 7.

### 9. Tree registration and details — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Add/view/edit tree records, photo upload, location capture with manual fallback, details view, QR generation.
- **Acceptance criteria:** Tree saves as point; validation messages; visibility rules enforced.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 7, Phase 8.

### 10. Field registration and map polygons — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Polygon drawing/editing, field marker, storage of geometry and derived centre point.
- **Acceptance criteria:** Field saves as valid polygon; editable per policy.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 9.

### 11. Map discovery and filtering — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Map rendering, pins/polygons, filters by location and plant type, list alternative, loading/empty/error states.
- **Acceptance criteria:** Map usable on mobile; accessible list alternative; permission-denied fallback.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 9, Phase 10.

### 12. Owner and monitor workflows — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Monitoring requests, admin approval, capacity enforcement (max one monitor), role-based access.
- **Acceptance criteria:** Capacity limit enforced under concurrency; rejected requesters gain no privileged access.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 8, Phase 9.

### 13. Watering schedules and care logs — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Weekly schedule display, mark-complete events with actor/timestamp, history, next planned watering.
- **Acceptance criteria:** Only owner/monitor/admin can add logs; planned vs. completed distinguished.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 12.

### 14. QR generation and scanning — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Generate QR linked to stable opaque token; scanner with camera permission; public record view; invalid/revoked states.
- **Acceptance criteria:** No sensitive data in QR; public view limited to approved fields.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 9.

### 15. Inquiry and ticket management — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Ticket creation with categories, status tracking, admin queue/replies, attachments.
- **Acceptance criteria:** Users see own tickets; admins see permitted queue; history retained.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 8.

### 16. Administrator dashboard and permissions — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Admin routes, monitoring-request review, ticket queue, record/care history, audited ownership transfer.
- **Acceptance criteria:** Admin capabilities enforced server-side; audit events recorded.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 8, Phase 12, Phase 15.

### 17. Disease-analysis integration — NOT STARTED (Later phase)
- **Completed tasks:** None.
- **Remaining tasks:** Integrate existing identification/diagnosis API; consent, rate limits, uncertainty messaging.
- **Acceptance criteria:** Results framed as possible matches; third-party data sharing documented.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Service selection and budget approval (Phase 3).

### 18. Weather and plant-care recommendations — NOT STARTED (Later phase)
- **Completed tasks:** None.
- **Remaining tasks:** Weather API integration, recommendation rules, graceful degradation.
- **Acceptance criteria:** Recommendations identify their basis; location/weather failures don't block record access.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 3 (weather provider).

### 19. Settings, About Us and feedback — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Profile/preferences, privacy guidance, sign-out, About Us content, feedback form.
- **Acceptance criteria:** No settings for unimplemented features; feedback confirmation shown.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 8.

### 20. Responsive, accessibility and security testing — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Responsive/accessibility/security/permission testing; offline behaviour if included.
- **Acceptance criteria:** Documented test results across target browsers/devices.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Implementation phases.

### 21. Deployment and release verification — NOT STARTED
- **Completed tasks:** None.
- **Remaining tasks:** Hosting, HTTPS, secrets, backups, installability testing across browsers/OS.
- **Acceptance criteria:** Production deployment verified; rollback plan documented.
- **Test/verification evidence:** None.
- **Blockers/dependencies:** Phase 20.

---

## C. Current implementation snapshot

- **Frontend framework and version:** React 19 + Vite 8 + TypeScript 6, Tailwind CSS v4 (`@theme` tokens), React Router 7. Scaffolded in `app/`.
- **Backend and database:** **Superseded decision.** Supabase is no longer used. Target: `server/` folder — Node + Express + SQLite (file DB) + seeded demo data + JWT/session auth. Not yet built.
- **Authentication approach:** Local credential auth in `server/` with three seeded demo accounts (admin/owner/monitor). Frontend keeps a demo-mode fallback so screens render without the backend running.
- **Map library and provider:** Leaflet + OpenStreetMap tiles (confirmed; tile licensing still to verify).
- **UI/component system:** Tailwind CSS + hand-rolled accessible primitives (to be rebuilt from the installed design skills). shadcn/ui no longer required.
- **PWA manifest and service worker:** CONFIGURED (`vite-plugin-pwa`, autoUpdate, precache 6 entries). Icon files referenced but not yet supplied.
- **External integrations:** None. Disease analysis will be mocked behind a service interface.
- **Current routes:** `/welcome`, `/signin`, shell with `/dashboard`, `/plants/:id`, `/add`, `/qr`, `/settings`, `/about`, `/feedback`, 404. `/map`, admin and tickets routes not yet added.
- **Database migrations and implemented entities:** None.
- **Available automated tests:** None. Vitest + Playwright installed as a plan, not yet configured.
- **Deployment status:** NOT DEPLOYED.
- **Installed project skills:** 10 under `.agents/skills/` — accessibility, deploy-to-vercel, design-mobile-apps, frontend-design, playwright-best-practices, supabase, supabase-postgres-best-practices, tailwind-design-system, vercel-react-best-practices, web-design-guidelines.

---

## D. Files created or modified

| File or directory | Change | Status |
|---|---|---|
| `README.md` | Project title only | Existing (tracked) |
| `project-context/01_Brand_and_Visual_Design.md` | Brand identity, colours, visual direction, icon concepts, design-system recommendations | Existing (untracked) |
| `project-context/02_Product_Requirements_Initial_Draft.md` | Initial goals, page/feature inventory, user/plant record fields, QR privacy, PWA expectations, quality requirements, open decisions | Existing (untracked) |
| `project-context/03_Architecture_and_Data_Model_Initial_Draft.md` | Logical components, candidate entities, security/data rules, offline questions, open technology choices | Existing (untracked) |
| `project-context/04_Figma_UI_Design_Specification.md` | Design tokens, screen inventory, responsive rules, reusable components, Figma MCP workflow, accessibility checks | Existing (untracked) |
| `project-context/05_Product_Requirements_Document_Haritavanam.md` | Consolidated PRD: vision, roles, terminology, information architecture, feature workflows, data model, non-functional requirements, phased delivery, risks, open questions | Existing (untracked) |
| `progress.md` | Persistent progress tracker created per mandatory handoff rules | Created |
| `docs/PRODUCT_REQUIREMENTS.md` | Consolidated product requirements (roles, pages, features, acceptance criteria, MVP vs later) | Created |
| `docs/USER_FLOWS.md` | Primary/secondary user journeys A–G and supporting flows | Created |
| `docs/TECHNICAL_ARCHITECTURE.md` | Logical components, proposed stack (not confirmed), security/privacy, offline/sync, env | Created |
| `docs/DATA_MODEL.md` | Candidate entities, relationships, geospatial and privacy rules | Created |
| `docs/DESIGN_SYSTEM.md` | Brand tokens, typography (undecided), components, states, responsive, accessibility | Created |
| `docs/IMPLEMENTATION_PLAN.md` | Milestones 1–8, dependencies, acceptance criteria, quality gates | Created |
| `docs/DECISIONS_AND_OPEN_QUESTIONS.md` | Confirmed/proposed/open decisions, conflicts, blocking decisions | Created / Updated |
| `design-mockup/index.html` | Local HTML/CSS visual reference (design tokens + key screens) | Created |
| `figma-plugin/manifest.json` | Figma plugin manifest for design generation | Created |
| `figma-plugin/code.js` | Figma plugin (Plugin API) that generates Foundations, Components and Screens pages | Created |
| `figma-plugin/README.md` | Instructions to import and run the plugin in Figma | Created |
| `docs/ASSET_REQUEST.md` | Exact asset/input checklist given to the owner (logo, icons, splash, hero, demo location, credentials) | Created |
| `app/` | Vite + React + TS + Tailwind v4 + PWA scaffold (config, entry, router, 10 placeholder pages, Supabase client stub) | Created |
| `app/src/index.css` | Brand tokens via Tailwind v4 `@theme` | Created |
| `app/vite.config.ts` | PWA manifest + autoUpdate service worker | Created |
| `.agents/skills/` | 10 project-level agent skills installed (React, design, Supabase, a11y, Playwright, Tailwind, mobile, Vercel) | Created |

Note: Reference images (logo/icon sheet, colour-palette sheet) are referenced by docs but not present in the repository.

---

## E. Decisions and rationale

| # | Decision | Reason | Status | Date | Consequences / follow-up |
|---|---|---|---|---|---|
| 1 | Brand colours: primary `#3A5A40`, secondary `#A3B18A`, background `#F5F1E8`, accent `#EF4444` | From supplied colour-palette reference | Confirmed | 2026-10-24 | Use as design tokens; verify contrast/accessibility |
| 2 | Tagline "Plant · Track · Preserve"; hero headline "A Greener Tomorrow" | From brand reference | Confirmed | 2026-10-24 | Use in splash/welcome surfaces |
| 3 | Use stable generated internal IDs as relational keys; never use phone/email as primary ID | Phone/email can change; stability required | Confirmed | 2026-10-24 | Schema must use generated IDs |
| 4 | PWA approach (responsive, installable, permission-aware, no guaranteed native parity) | Product goal and quality requirements | Confirmed | 2026-10-24 | Feature-detect camera/geolocation/notifications |
| 5 | No custom ML model from scratch for disease analysis; use existing service | Scope/cost constraint (non-goal) | Confirmed | 2026-10-24 | Service selection pending (Phase 3/17) |
| 6 | QR codes encode stable URL/opaque token, never sensitive personal data | Privacy/security requirement | Confirmed | 2026-10-24 | Define public fields before implementation |
| 7 | Backend-enforced authorization for admin/owner/monitor roles | Security requirement | Confirmed | 2026-10-24 | Frontend hiding is insufficient |
| 8 | At most one active monitor per record (two responsible people total) | Current proposal in PRD §8.5 | Proposed | 2026-10-24 | Open: applies to whole field or per tree? Owner direct approval? |
| 9 | Admin review required for monitoring requests | Current proposal | Proposed | 2026-10-24 | Open: can owner approve directly? |
| 10 | Typography not finalized | Reference image does not specify font | Open decision | 2026-10-24 | Choose accessible web-available typeface during design |
| 11 | All technology stack choices (frontend, backend, DB, auth, map, storage, hosting, disease/weather APIs) | Explicitly undecided in architecture draft | NOT DECIDED | 2026-10-24 | Resolve in Phase 3 before implementation |
| 12 | Navigation structure (whether Explore/Add/Details/QR/Disease are separate pages or flows) | PRD notes ambiguity | Open decision | 2026-10-24 | Finalize after confirming "clients page" meaning |
| 13 | **Drop Supabase for now.** Backend lives in `server/` (Node + Express + SQLite + JWT), demo-seeded | Owner instruction: "we are not using supabase … maintain a proper backend as a separate folder" | Confirmed | 2026-10-25 | Remove `@supabase/supabase-js` and `src/lib/supabase.ts`; keep schema portable so Postgres can replace SQLite later |
| 14 | Three seeded demo accounts (admin/owner/monitor) + one-tap role switching on the sign-in screen | Owner instruction: "create some test credentials to log in and render to all the pages" | Confirmed (emails/password awaiting sign-off) | 2026-10-25 | Credentials stored in `server/` seed script; documented in `docs/ASSET_REQUEST.md` §4 |
| 15 | Rebuild UI/UX from scratch on the existing scaffold rather than patching placeholder pages | Owner: current layouts are "UA functional but not properly graded" | Confirmed | 2026-10-25 | Placeholder glyph icons replaced by a real icon set; every screen gets loading/empty/error states |
| 16 | Owner will supply logo, app icons, splash artwork and hero photo | Owner offered assets; asked for a list | Confirmed | 2026-10-25 | Checklist issued in `docs/ASSET_REQUEST.md`; polish blocked until assets arrive, structure work is not |
| 17 | Disease analysis mocked behind a service interface for the demo | No provider selected or budgeted | Proposed | 2026-10-25 | Real provider can be swapped in without touching UI |

---

## F. Bugs, blockers and limitations

No defects exist yet (no implementation). Open items below are unimplemented features, open decisions or external limitations.

| # | Description | Severity/Priority | Affected feature | Status | Next troubleshooting action |
|---|---|---|---|---|---|
| 1 | Many requirements are open decisions (PRD §14, architecture §5) | High | All | Open | Consolidate with project team; record resolutions in PRD/progress |
| 2 | Brand assets (logo, app icons, splash, hero photo) not supplied; current hero is 343×361 | High | Design system / PWA install | Blocked on owner | Checklist issued in `docs/ASSET_REQUEST.md`; owner to provide files |
| 3 | Typography undecided | Medium | Design system/UI | Open | Pick a pairing in the rebuild (display serif + humanist sans), self-hosted |
| 4 | Figma file populated via plugin but never visually compared to `design-mockup/index.html` | Medium | Design | Open | Deferred until the working UI exists; compare screenshots then |
| 5 | Supabase dropped, local `server/` backend not built yet | High | All implementation | In progress | Build `server/` with auth/plants/fields/care/tickets/QR; seed demo data |
| 6 | Disease-analysis service unselected; budget/cost unknown | Medium | Disease check | Later phase | Evaluate APIs for region/cost/licence |
| 7 | Weather provider unselected | Medium | Recommendations | Later phase | Evaluate providers/licences |
| 8 | Map tile provider licensing/cost unreviewed | Medium | Map discovery | Open | Review terms before selection |
| 9 | Offline scope and sync behaviour undefined | Medium | PWA | Open | Define in Phase 7 |
| 10 | Ambient-light/lux sensor availability unverified across target browsers | Low | Recommendations | Limitation | Feature-detect; do not promise automatic lux collection |

---

## G. Verification record

| Date | Command/Test | Result | Notes |
|---|---|---|---|
| 2026-10-24 | Read project-context documents (01–05) | Pass (manual) | All five files read and summarized |
| 2026-10-24 | `git status` | Pass | Branch main, up to date; `project-context/` untracked |
| 2026-10-24 | `git ls-tree -r --name-only HEAD` | Pass | Only `README.md` tracked at baseline |
| 2026-10-24 | Inspect directory tree | Pass | No application code present |
| 2026-10-25 | `npx tsc --noEmit` in `app/` | Pass | No type errors |
| 2026-10-25 | `npm run build` in `app/` | Pass | Emitted `dist/sw.js`, `manifest.webmanifest`, `registerSW.js`; 6 precache entries |
| 2026-10-25 | `npm run dev` in `app/` | Pass (server starts) | Served on `http://localhost:5173`; **no screenshot inspected — visual state UNVERIFIED** |

No automated tests exist yet. No visual/browser verification has been successfully completed.

---

## H. Next actions

Prioritized concrete tasks. **Immediate next action = wait for owner assets/answers, then execute items 1–3.**

1. **Priority: High** — Receive owner assets and answers (`docs/ASSET_REQUEST.md`), then place them in `app/public/brand/` and generate all icon/splash derivatives.
   - Dependencies: Owner handover.
   - Acceptance criteria: Every must-have asset present or explicitly waived; derivatives generated and referenced by the manifest.

2. **Priority: High** — Build `server/` (Express + SQLite): auth with 3 seeded demo accounts, plants, fields, care logs, monitoring requests (admin-approved, max 1 monitor), tickets, QR tokens, photo upload; plus a one-command `npm run dev` for root that runs API + app.
   - Dependencies: Credential/location answers.
   - Acceptance criteria: API starts, seeds idempotently, integration tests pass, frontend loads live data.

3. **Priority: High** — Rebuild UI/UX on the existing scaffold: design tokens + type scale, real icon set, app shell with safe-area handling, and every screen with loading/empty/error/permission-denied states; add `/map`, `/admin`, `/tickets` routes.
   - Dependencies: Item 1 for final polish (structure work can start before).
   - Acceptance criteria: Primary journey (sign in → add plant → map pin → QR → care log → ticket) works; screenshots at 360/768/1440; no placeholder glyphs remain.

4. **Priority: Medium** — Configure Vitest + Playwright; write tests for auth, plant CRUD, monitor capacity rule, QR public view.
   - Acceptance criteria: `npm test` and `npx playwright test` pass, output inspected and recorded in §G.

5. **Priority: Medium** — Accessibility and responsive audit against WCAG 2.2 AA (focus order, contrast, 44 px targets, reduced motion, keyboard nav), documented with evidence.

6. **Priority: Low** — Replace mocked disease analyser with a real provider once selected; add weather strip.

**Explicitly parked:** Supabase/Postgres/RLS, cloud deployment, Figma pixel-matching.

---

## I. Session history

### Session 2026-10-24 (initial)
- **Main objective:** Establish persistent progress tracking and review project context.
- **Work completed:** Read all five project-context documents; inspected repository state (only `README.md` tracked); created `progress.md` with required structure.
- **Files changed:** `progress.md` (created).
- **Tests performed and results:** Manual document review and git inspection — pass (see §G).
- **Decisions made:** Recorded confirmed/proposed/open decisions in §E; no new decisions beyond existing docs.
- **Outstanding blockers:** Open requirements decisions; undecided technology stack; missing design assets/Figma file.
- **Exact next step:** Resolve PRD §14 open questions and confirm MVP scope, then proceed to technology selection.

### Session 2026-10-24 (decisions incorporated)
- **Main objective:** Incorporate owner's answers from docs/DECISIONS_AND_OPEN_QUESTIONS.md; update docs and progress.
- **Work completed:** Parsed owner answers; updated DECISIONS (15 confirmed product/policy + 1 confirmed stack), deferred 4 items with proposed defaults. Updated TECHNICAL_ARCHITECTURE (stack confirmed), PRODUCT_REQUIREMENTS MVP, progress snapshot/phase statuses. Figma MCP remains unavailable this session (restart required); no Figma file exists yet.
- **Files changed:** docs/DECISIONS_AND_OPEN_QUESTIONS.md, docs/TECHNICAL_ARCHITECTURE.md, progress.md.
- **Tests performed and results:** None (documentation only).
- **Decisions made:** Confirmed monitoring policy, QR public view, field geometry, lux non-essential, no clients page, Plant page separate, MVP feature set, full stack.
- **Outstanding blockers:** Figma file creation (user must create + provide key after restart); typography; offline scope; admin provisioning; account deletion; anonymous feedback; disease/weather provider (deferred).
- **Exact next step:** User restarts OpenCode; creates a new Figma file and shares its key; then design phase begins (inspect file, build design system + screens).

### Session 2026-10-24 (documentation consolidation)
- **Main objective:** Execute master prompt Phase 0/1: inspect tool/MCP capabilities and create project documentation set.
- **Work completed:** Verified Figma MCP is read-only (get_file_info, get_components, get_styles, get_file_comments, get_file_versions, get_file_nodes, list_files) with no create/edit operations; token lacks projects:read scope. Verified browser automation tools available. Created docs/PRODUCT_REQUIREMENTS.md, USER_FLOWS.md, TECHNICAL_ARCHITECTURE.md, DATA_MODEL.md, DESIGN_SYSTEM.md, IMPLEMENTATION_PLAN.md, DECISIONS_AND_OPEN_QUESTIONS.md. Updated progress.md.
- **Files changed:** docs/*.md (7 created), progress.md (updated).
- **Tests performed and results:** None (documentation only).
- **Decisions made:** Recorded proposed default stack as proposal (not confirmed); recorded Figma MCP limitation.
- **Outstanding blockers:** Open requirements decisions; undecided stack; missing design assets; no Figma file key.
- **Exact next step:** Obtain project owner decisions on MVP scope/navigation and technology stack; provide Figma file key or create file manually before design phase.

### Session 2026-10-25 (direction change + asset request)
- **Main objective:** Act on owner's new direction — drop Supabase, build a real backend in a separate folder, add demo credentials, and rebuild the UI/UX; first deliver the list of assets needed.
- **Work completed:** Verified scaffold state (`app/` builds; `tsc --noEmit` clean; `vite build` emits SW + manifest; dev server serves on :5173). Confirmed remaining UI is placeholder-grade (Unicode glyph icons in `AppLayout.tsx`, 20-line token file, `@supabase/supabase-js` still a dependency). Confirmed all 10 project skills are installed after repeated server restarts interrupted installs. Wrote `docs/ASSET_REQUEST.md` with exact asset specs (logo mark/lockup, 1024 app-icon master, maskable icon, 1080×1920 splash, 1600×1200 hero, optional icon set + demo photos), the list of derivatives I will generate instead, and six open questions (fonts, demo location, credentials, disease mode, splash behaviour, backend confirmation). Updated progress sections A, C, D, E, F, G, H.
- **Files changed:** `docs/ASSET_REQUEST.md` (created), `progress.md` (updated).
- **Tests performed and results:** `npx tsc --noEmit` pass; `npm run build` pass (recorded §G). Visual verification still not completed — browser calls kept being aborted by server restarts.
- **Decisions made:** #13 drop Supabase → `server/` Express + SQLite; #14 three seeded demo accounts; #15 full UI/UX rebuild; #16 owner-supplied brand assets; #17 mock disease analyser.
- **Outstanding blockers:** Owner assets and answers (fonts, demo location, credential approval, disease mode, splash behaviour, backend confirmation). No visual verification evidence yet.
- **Exact next step:** On asset/answer handover, place brand files in `app/public/brand/`, then build `server/` and rebuild the UI/UX per §H items 1–3, recording real evidence in §G.
