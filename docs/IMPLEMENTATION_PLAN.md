# Haritavanam — Implementation Plan

Milestones, dependencies and acceptance criteria. Adjust order when dependencies or MVP justify.

## Milestone 1 — Foundation
Design system, responsive shell + nav, PWA manifest + SW, auth foundation, shared components.
Acceptance: app builds/runs; manifest valid; SW registered; auth sign-in works; responsive shell at mobile/tablet/desktop.

## Milestone 2 — Core records
User profile; add/view/edit tree; photos; location selection + manual fallback; map pins; plant details.
Acceptance: tree saves as point; validation messages; visibility rules enforced; map renders pins.

## Milestone 3 — Fields
Field registration; polygon draw/edit; field rendering + details; validation/permissions.
Acceptance: field saves as valid polygon; editable per policy.

## Milestone 4 — Shared care
Owner/monitor roles; monitoring requests; admin review; watering schedule; care logs + history.
Acceptance: capacity enforced under concurrency; only authorized roles log care; planned vs completed distinguished.

## Milestone 5 — QR
QR generation; camera scanning; public/private views; invalid/revoked handling.
Acceptance: no sensitive data in QR; public view limited; manual fallback works.

## Milestone 6 — Support and administration
Inquiry categories; ticket create/track; admin replies/status; feedback; audit history + ownership transfer.
Acceptance: users see own tickets; admins see permitted queue; history retained; audit events recorded.

## Milestone 7 — Smart assistance (later phase)
Photo identification (if selected); disease analysis via existing service; weather; recommendations; notifications where supported.
Acceptance: results framed as possible; graceful degradation; consent/rate limits.

## Milestone 8 — Release preparation
Accessibility, security review, responsive visual QA, performance, offline/sync tests, deployment/install verification.
Acceptance: production build verified; documented tests across browsers/devices.

## Quality gates (per milestone)
Build succeeds; automated tests pass; type checks + lint pass; primary journey works; major responsive issues resolved; implementation compared to Figma; known limitations documented. Never claim a test passed without running it.
