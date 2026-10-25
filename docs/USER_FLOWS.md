# Haritavanam — User Flows

Primary and secondary journeys. Combine screens into flows where appropriate; not every area is a top-level tab.

## Journey A — Sign up → add tree → QR
1. Open app → Welcome → Sign up (name + phone/email) → verify → account created (stable internal ID).
2. Add Record → Individual Tree → capture/upload photo → enter/review species → optional description → capture location (or manual fallback) → review → confirm.
3. Save → success view → generate/display QR (stable URL/opaque token).

## Journey B — Add field
1. Add Record → Field → photo → name/species → description → draw/edit polygon on map → review polygon → confirm → save → success + marker.

## Journey C — Discover → request monitoring → admin review
1. Dashboard/Map or Explore → open record summary → full details.
2. Request to Monitor (note) → pending request.
3. Admin reviews → approve (if capacity) or reject (reason).
4. Requester notified; if approved, gains monitor access (care info only).

## Journey D — Care activity
1. Owner/monitor opens record → view weekly schedule + next planned.
2. Mark watering completed (timestamp) → care log entry with actor.
3. Admin reviews activity history.

## Journey E — QR scan
1. QR Centre → request camera permission → scan frame (tree/hand-inspired theme, clear scan area).
2. Resolve QR → public/permission-checked record view.
3. Handle invalid/removed/revoked/network errors; manual fallback (enter code/open image) if camera denied.

## Journey F — Inquiry ticket
1. Inquiry/Support → select category → link tree/field if relevant → description + optional photo → submit → ticket ID + confirmation.
2. User tracks tickets (status, last update) → opens detail + admin replies.
3. Admin filters queue → opens ticket → replies/status change → approve/reject action; user sees decision.

## Journey G — Disease check
1. Disease Check (from Inquiry or record) → capture/choose photo → optional context (plant type/symptoms).
2. Send to existing service (consent + rate limits) → possible conditions + confidence/limitations + next steps.
3. Attach result to ticket or save observation (if approved).

## Supporting flows
- Location permission denied → manual location selection; list alternative for map.
- Offline/network error → cached shell + retry; no false success.
- Admin: monitoring requests, ticket queue, record review, care history, inactive-owner signals, audited ownership transfer.
- Settings: profile, privacy/permission guidance, sign-out; avoid settings for unimplemented features.
- About Us: aim, team, research/references.
- Feedback: rating/structured questions + optional message → confirmation.
