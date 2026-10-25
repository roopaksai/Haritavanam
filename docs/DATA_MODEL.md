# Haritavanam — Data Model

Candidate entities; final schema depends on selected DB and requirements. Prefer PostgreSQL with PostGIS for geospatial.

## Entities
- **User:** `id` (stable generated), `name`, `phone`, `email`, `status`, timestamps. Phone/email changes controlled.
- **PlantRecord:** `id`, `record_type` (tree/field), `owner_user_id`, common/scientific names, description, point coords (tree) / polygon geometry (field) + derived centre, privacy/status, timestamps.
- **PlantPhoto:** `id`, `plant_record_id`, storage key, uploader, timestamp.
- **MonitoringRequest:** `id`, `plant_record_id`, `requester_user_id`, note, status, reviewer, decision reason, timestamps.
- **PlantMonitor:** `plant_record_id`, `monitor_user_id`, status, start/end timestamps.
- **CareSchedule:** `id`, `plant_record_id`, care type, cadence/rules, timezone, active.
- **CareLog:** `id`, `plant_record_id`, `actor_user_id`, activity type, completion time, notes, optional photo.
- **PlantObservation:** `id`, `plant_record_id`, author, type, notes, photo/ref, timestamp.
- **QRReference:** `id`, `plant_record_id`, opaque token, status, created/revoked timestamps.
- **SupportTicket:** `id`, creator, category, linked record, description, status, priority, timestamps.
- **TicketMessage:** `id`, `ticket_id`, author, message, attachments, timestamp.
- **Feedback:** `id`, optional user ref, rating, message, timestamp.
- **DiseaseAnalysis:** `id`, record/user ref, provider, result summary, confidence (if supplied), consent/data metadata, timestamp.
- **Recommendation:** `id`, record/user ref, type, message, source/basis, created/expiry.
- **AdminAuditEvent:** actor, action, target, reason, before/after summary, timestamp.

## Rules
- Stable generated IDs as relational keys (never phone/email).
- Geospatial types for points/polygons; validate on backend.
- Photos in object storage; DB stores metadata.
- Public QR response fields kept separate from private record fields.
- Track role/ownership history for audits and disputes.
- Timestamps consistent (UTC stored, local display).
- Define retention/deletion for tickets, photos, disease images, audit events.
- At most one active monitor per record; prevent concurrent over-approval.
- Role checks enforced in DB (RLS) and API.

## Relationships
User 1—* PlantRecord (owner); PlantRecord 1—* PlantPhoto; PlantRecord 1—* MonitoringRequest; PlantRecord 1—0..1 PlantMonitor; PlantRecord 1—* CareSchedule/CareLog/PlantObservation/QRReference/SupportTicket; SupportTicket 1—* TicketMessage; User 1—* Feedback (optional). AdminAuditEvent references actor/target.
