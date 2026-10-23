# Haritavanam — Project Progress Tracker

> Persistent working record for the Haritavanam project. Any future OpenCode session or model should read this file first, then inspect the relevant source files before trusting recorded status.

---

## A. Project overview

- **Project name:** Haritavanam
- **Objective:** Build an installable Progressive Web App (PWA) that lets users register, locate, monitor and care for trees and planted fields, with map-based discovery, owner/monitor roles, care logs, QR access, support tickets, optional disease analysis, weather-aware recommendations, and an administrator experience.
- **Brand tagline:** Plant · Track · Preserve
- **Hero message:** A Greener Tomorrow
- **Current development phase:** Phase 1 — Project discovery and context review (context documents reviewed); Phase 2 — Requirements consolidation and Phase 3 — Technical architecture are in progress as drafts.
- **Current project status:** Discovery/documentation only. No application code, Figma file, backend, database or deployment exists yet. All technology choices are undecided.
- **Last updated:** 2026-10-24 02:00:45 +05:30 (Asia/Kolkata, inferred from system timezone)
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

### 2. Requirements consolidation — IN PROGRESS
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

### 3. Technical architecture and data model — IN PROGRESS
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

### 4. Design system and Figma setup — NOT STARTED
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

- **Frontend framework and version:** NOT CONFIGURED (no application code).
- **Backend and database:** NOT CONFIGURED.
- **Authentication approach:** NOT DECIDED.
- **Map library and provider:** NOT DECIDED (open-source-friendly approach required; licensing/cost review pending).
- **UI/component system:** NOT CONFIGURED.
- **PWA manifest and service worker:** NOT CONFIGURED.
- **External integrations:** None (disease-analysis service, weather provider, image storage, hosting all undecided).
- **Current routes and implemented screens:** None.
- **Database migrations and implemented entities:** None.
- **Available automated tests:** None.
- **Deployment status:** NOT DEPLOYED.

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
| `docs/DECISIONS_AND_OPEN_QUESTIONS.md` | Confirmed/proposed/open decisions, conflicts, blocking decisions | Created |

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

---

## F. Bugs, blockers and limitations

No defects exist yet (no implementation). Open items below are unimplemented features, open decisions or external limitations.

| # | Description | Severity/Priority | Affected feature | Status | Next troubleshooting action |
|---|---|---|---|---|---|
| 1 | Many requirements are open decisions (PRD §14, architecture §5) | High | All | Open | Consolidate with project team; record resolutions in PRD/progress |
| 2 | Reference images (logo/icon sheet, colour palette) not in repository | Medium | Design system | Open | Obtain and commit editable/vector assets |
| 3 | Typography undecided | Medium | Design system/UI | Open | Select accessible web font and type scale |
| 4 | No Figma file or design tokens created | High | Design | Not started | Create Figma file manually or provide a file key; Figma MCP here is read-only (get_*/list_files) and token lacks projects:read scope, so files cannot be created/edited via MCP |
| 5 | No backend/database/auth selected | High | All implementation | Blocked | Complete Phase 3 technology selection |
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

No automated tests exist. No visual/browser verification performed (no UI implemented).

---

## H. Next actions

Prioritized concrete tasks for the next session:

1. **Priority: High** — Resolve requirements open questions (PRD §14) with the project team; confirm MVP scope and navigation labels.
   - Dependencies: None.
   - Expected outcome: Updated PRD with confirmed requirements; deferred items documented.
   - Acceptance criteria: Each open question either answered or marked deferred with rationale.

2. **Priority: High** — Complete Phase 3 technology selection (frontend, backend, DB, auth, map provider, storage, hosting) with cost/licensing/skill review.
   - Dependencies: Task 1 (MVP scope).
   - Expected outcome: Recorded decisions in §E with rationale.
   - Acceptance criteria: No "NOT DECIDED" items remain for MVP-critical choices.

3. **Priority: High** — Obtain and commit editable logo/icon assets and colour-palette reference; select and document typography.
   - Dependencies: None.
   - Expected outcome: Design assets available in repo.
   - Acceptance criteria: Assets present; font family and type scale documented.

4. **Priority: Medium** — Create Figma file with foundations, variables/tokens and reusable components.
   - Dependencies: Tasks 2–3.
   - Expected outcome: Figma file with brand tokens and base components.
   - Acceptance criteria: Tokens match brand colours; components have states.

5. **Priority: Medium** — Scaffold PWA foundation (app shell, manifest, service worker) once stack is selected.
   - Dependencies: Task 2.
   - Expected outcome: Running dev app with manifest and registered service worker.
   - Acceptance criteria: App builds/runs; manifest valid; SW registered.

6. **Priority: Low** — Evaluate disease-analysis and weather providers for later phases.
   - Dependencies: Task 1 (MVP scope confirms whether in MVP).
   - Expected outcome: Provider comparison notes.
   - Acceptance criteria: At least one feasible option documented per integration.

**Immediate next action:** Resolve requirements open questions (PRD §14) and confirm MVP scope before any design or implementation work.

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

### Session 2026-10-24 (documentation consolidation)
- **Main objective:** Execute master prompt Phase 0/1: inspect tool/MCP capabilities and create project documentation set.
- **Work completed:** Verified Figma MCP is read-only (get_file_info, get_components, get_styles, get_file_comments, get_file_versions, get_file_nodes, list_files) with no create/edit operations; token lacks projects:read scope. Verified browser automation tools available. Created docs/PRODUCT_REQUIREMENTS.md, USER_FLOWS.md, TECHNICAL_ARCHITECTURE.md, DATA_MODEL.md, DESIGN_SYSTEM.md, IMPLEMENTATION_PLAN.md, DECISIONS_AND_OPEN_QUESTIONS.md. Updated progress.md.
- **Files changed:** docs/*.md (7 created), progress.md (updated).
- **Tests performed and results:** None (documentation only).
- **Decisions made:** Recorded proposed default stack as proposal (not confirmed); recorded Figma MCP limitation.
- **Outstanding blockers:** Open requirements decisions; undecided stack; missing design assets; no Figma file key.
- **Exact next step:** Obtain project owner decisions on MVP scope/navigation and technology stack; provide Figma file key or create file manually before design phase.
