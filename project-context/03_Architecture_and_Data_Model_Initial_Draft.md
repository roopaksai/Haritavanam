# Haritavanam — Architecture & Data Model (Initial Draft)

**Status:** Preliminary planning document  
**Important:** This is a neutral starting point, not a final technology selection.

## 1. Logical system components

1. **PWA frontend:** Responsive interface, routing, reusable components and client-side validation.
2. **PWA platform layer:** Web app manifest, service worker, caching and installation-related assets.
3. **Authentication:** Verifies identity and manages sessions/tokens through a suitable provider or backend.
4. **Application API/backend:** Enforces authorization, validates data, and manages plant records, tickets, feedback and QR resolution.
5. **Database:** Stores user profiles, plant records, metadata, tickets and audit events as appropriate.
6. **Object storage:** Stores plant photographs and approved attachments.
7. **Map layer:** Displays records using the selected map library and tile/data provider.
8. **Optional plant-identification service:** Receives a photo and returns candidate species with confidence information and limitations.
9. **Administration interface:** Protected routes with server-enforced role permissions.

## 2. Suggested logical data entities

These are candidate entities. The exact schema depends on the full requirements and chosen backend.

| Entity | Candidate fields | Notes |
|---|---|---|
| User | `id`, `name`, `phone`, `email`, `created_at`, `status` | Use a stable generated ID; enforce uniqueness only where required |
| PlantRecord | `id`, `owner_user_id`, `common_name`, `scientific_name`, `description`, `latitude`, `longitude`, `planted_at`, `status`, `created_at`, `updated_at` | Exact fields and location precision depend on privacy and product decisions |
| PlantPhoto | `id`, `plant_record_id`, `storage_key`, `uploaded_by`, `created_at` | Store files in object storage; database stores metadata/references |
| PlantUpdate | `id`, `plant_record_id`, `author_user_id`, `update_type`, `notes`, `photo_id`, `created_at` | Potential support for growth and maintenance history |
| QRReference | `id`, `plant_record_id`, `public_token`, `status`, `created_at`, `revoked_at` | Use an opaque token/stable URL; do not embed personal data |
| SupportTicket | `id`, `created_by_user_id`, `subject`, `description`, `status`, `priority`, `created_at`, `updated_at` | Add ticket messages and attachments if needed |
| TicketMessage | `id`, `ticket_id`, `author_user_id`, `message`, `created_at` | Supports a conversation trail |
| Feedback | `id`, `user_id` (nullable), `rating`, `message`, `created_at` | Anonymous-feedback policy is undecided |
| AdminRole | Role assignments and permission definitions | Depends on authentication and authorization design |
| AuditEvent | Actor, action, target, timestamp and relevant metadata | Especially useful for sensitive admin actions |

## 3. Important data and security rules

- Enforce authorization on the backend, not only by hiding frontend pages.
- Keep public QR views separate from owner-only and administrator-only data.
- Validate coordinates and all user-supplied text on the server.
- Apply upload limits and validate image content/type; do not trust filenames.
- Use HTTPS in deployment and keep credentials/secrets out of source control.
- Plan backups, deletion/retention rules and auditability for admin actions.
- Store only the device data needed for offline use. Define conflict handling before supporting offline edits.
- Avoid exposing precise coordinates publicly without an explicit product/privacy decision.
- Define how a user proves ownership before editing or deleting a record.
- Consider abuse prevention for public endpoints and QR pages.

## 4. Offline and synchronization questions

Before choosing a storage strategy, determine:

- Which pages must work offline?
- Can users register a plant without a network connection?
- If offline registration is allowed, when are photos and records uploaded?
- How are duplicate submissions and conflicting edits resolved?
- What should the UI show when a change is pending synchronization?
- How long can data remain stored on a shared or lost device?

Offline behaviour should be explicitly designed rather than assumed from PWA installability.

## 5. Technology choices still open

The following choices have not yet been finalized:

- Frontend framework and routing approach
- UI/component library
- Map library and tile provider
- Backend framework/API
- Database
- Authentication provider
- Object/file storage
- Hosting and deployment
- QR-code library and QR destination design
- Optional plant-identification service
- Monitoring, logging and backups

Choose technologies after all requirements, team skills, cost constraints and deployment expectations are known.
