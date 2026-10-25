# Haritavanam — Product Requirements Document (PRD)

**Document status:** Initial draft — intended to evolve during discovery and implementation  
**Product:** Haritavanam  
**Product type:** Installable Progressive Web App (PWA)  
**Brand tagline:** Plant · Track · Preserve  
**Hero message:** A Greener Tomorrow

> This PRD organizes the current ideas into product areas and workflows. Items marked **Proposed**, **Open decision**, or **Later phase** are not confirmed requirements. Validate them with the project team before implementation.

---

## 1. Product vision

Haritavanam aims to help people register, locate, monitor and care for trees and planted fields through a responsive, installable web application. It should maintain useful records over time, encourage shared responsibility for plant care, and make selected plant information accessible through QR codes.

The app should feel app-like on mobile while remaining usable on desktop and tablet. It should use the agreed visual identity: olive green `#3A5A40`, sage green `#A3B18A`, beige `#F5F1E8`, and accent red `#EF4444`.

## 2. Problem statement

Tree and field planting records can be scattered, difficult to maintain, or disconnected from ongoing care. A planting record alone does not show whether a tree is being watered, whether a field has someone monitoring it, or whether a plant may need attention.

Haritavanam proposes a shared record and monitoring workflow with map-based discovery, monitoring requests, care updates, QR access, support tickets and context-aware recommendations.

## 3. Product goals

1. Create stable user accounts and plant/field records.
2. Represent an individual tree and a planted field differently on the map.
3. Let each tree or field have a clear owner and, where allowed, one additional monitor.
4. Record care activity, including a configurable watering schedule and completion history.
5. Let users discover trees/fields by location and plant type.
6. Use QR codes to make approved plant/field information easy to access.
7. Provide an inquiry/ticket system for adoption, ownership/monitoring issues, removed plants and other support needs.
8. Help users identify possible plant diseases from photos using an existing service/model, with suitable uncertainty and safety messaging.
9. Provide weather- and season-aware care insights using location and reputable data sources.
10. Provide administrators with tools to review monitoring requests, tickets and ownership changes.
11. Keep the app responsive, accessible, secure and suitable for gradual expansion.

## 4. Non-goals and constraints for the initial version

- Do not train a plant-disease or plant-identification ML model from scratch for the initial version.
- Do not assume that every phone exposes a reliable ambient-light sensor or lux reading to a PWA.
- Do not expose a user's private contact details or exact location publicly through a QR code by default.
- Do not automatically transfer ownership based only on an unreviewed activity score.
- Do not assume PWA support for every native mobile capability; test support in target browsers and operating systems.
- Do not commit to a specific framework, database, map provider or AI API until the requirements, costs, licensing and team skills are reviewed.

## 5. Users and roles

### 5.1 Registered user

Can create an account, add records, manage their own records, request to monitor another record, record care activity, raise tickets and provide feedback, subject to permissions.

### 5.2 Record owner

The user who initially creates a tree/field record is its default owner. The owner can manage the record and may invite or approve a monitor if that workflow is adopted. The owner role can potentially be transferred through an admin-reviewed process.

### 5.3 Monitor

A registered user who has been approved to help care for a particular record. A record should have at most two active responsible people in total under the current proposal: one owner and one additional monitor. The exact policy for fields versus individual trees should be confirmed.

### 5.4 Administrator

Can review monitoring/adoption requests, manage tickets, inspect care-update history, investigate inactive ownership and perform authorized record/ownership actions. Admin capabilities must be enforced on the backend, not just hidden in the UI.

### 5.5 Public visitor / QR scanner

Can view only the information explicitly designated as public for a QR-linked record. Account creation should not be required merely to read public information unless the team decides otherwise.

---

## 6. Core concepts and terminology

Use consistent terminology in UI and data models:

- **Plant record:** Generic record for a registered item.
- **Tree record:** A record representing one individual tree, displayed as a map pin.
- **Field record:** A record representing an area/polygon of planted crops or plants, with a marker associated with that area.
- **Owner:** The primary person responsible for a record.
- **Monitor:** The additional approved person helping maintain a record.
- **Care log:** A dated history of watering and other maintenance activity.
- **Monitoring request:** A request to become a record's monitor.
- **Support ticket:** A request or issue raised through the inquiry system.
- **QR destination:** A stable URL that resolves to a public or permission-checked record view.

“Plan” in the original description appears to mean “plant”; confirm the preferred terminology before the UI is finalized.

---

## 7. Information architecture and page responsibilities

The current page list is a starting point. Some areas may be separate routes or sections within a page.

| Page / area | Main responsibility | Key features |
|---|---|---|
| Splash / Welcome | Establish brand and launch experience | Logo, app icon/launch artwork, tagline, onboarding entry |
| Sign in / Sign up | Account access | Name, phone and/or email, verification and recovery based on selected auth design |
| Dashboard / Map | Discover and inspect nearby or registered records | Tree pins, field polygons, map/list view, filters, location permission fallback |
| Explore / Plant catalogue | Browse plant/tree types and records | Location and plant-type filters, popular/recent entries, pagination/infinite loading |
| Add Record | Register an individual tree or field | Record-type selector, photo, name/species, description, location or field boundary, review |
| Plant/Field Details | View record details and care status | Owner/monitor roles, photos, location, care schedule/log, QR, updates and monitoring request |
| QR Centre / Scanner | Scan and manage QR codes | Camera permission, scan frame, custom tree/hand-inspired visual theme, public record view |
| Inquiry / Support | Submit and track issues | Ticket categories, description, optional photo, status table/list, replies |
| Disease Check | Analyse a plant photo for possible disease | Camera/gallery input, analysis result, confidence/limitations, remedy guidance |
| Settings / Profile | Manage account and app preferences | Profile details, privacy, notification and permission guidance, account actions |
| About Us | Explain project and team | Aim, team members, research and references |
| Feedback | Collect app feedback | Rating or structured questions, optional message, submission status |
| Admin | Operate the service securely | Requests, tickets, care activity, records, users and audited ownership actions |

**Navigation decision:** The current list has been described as seven pages but includes more than seven areas. Finalize the navigation after confirming whether Explore, Add Record, Details, QR Centre and Disease Check are separate pages or flows within existing pages.

---

## 8. Feature requirements and workflows

### 8.1 User accounts and identity

**Purpose:** Give each registered user a stable identity used throughout the application.

**Initial requirements**
- Collect the user's name and the chosen contact identifier(s), phone and/or email.
- Generate a unique internal user ID.
- Use the internal ID as the relationship key for records, care logs, tickets and monitoring requests.
- Support sign-in, sign-out and account recovery appropriate to the chosen authentication method.
- Keep phone/email changes and verification under controlled account settings.

**Acceptance criteria**
- Each account has one stable internal ID.
- Duplicate or unverified contact identifiers are handled according to the chosen authentication policy.
- A user cannot access another user's private account data simply by changing a URL or ID.
- Administrative permissions are not granted based on a user-editable field.

**Open decisions**
- Phone, email or either?
- OTP, password, magic link or external identity provider?
- Account deletion, data export and retention policy?

### 8.2 Add a tree or field

**Purpose:** Allow the user to register either an individual tree or a planted area.

#### Flow
1. User selects **Add Record**.
2. User chooses **Individual Tree** or **Field**.
3. User captures/uploads a photo.
4. User enters a name/species or reviews a suggested identification.
5. User optionally adds a description and other approved metadata.
6. User sets the location:
   - Individual tree: choose/capture a point.
   - Field: draw or edit a polygon boundary on the map.
7. App shows a review screen.
8. User confirms and submits.
9. App saves the record and displays a success view with its details and QR option.

#### Individual tree
- Represent it as a single map pin.
- Tapping the pin shows a concise summary.
- Opening the record shows the full details, care history and allowed actions.

#### Field
- Let the user trace a boundary/polygon on the map and edit it before saving.
- Display the polygon as a filled/outlined area.
- Display a marker on or near the field to open its summary/details.
- Store the polygon geometry and, if useful, a derived centre point for marker placement.
- Show the owner and any approved monitor according to privacy rules.

**Acceptance criteria**
- The user can choose the correct record type before entering type-specific location data.
- A tree saves as a point; a field saves as a valid polygon.
- If location permission is denied or unavailable, the user can select a location manually.
- Invalid/incomplete records produce understandable validation messages.
- The saved record is visible only to users authorized to see it, according to its privacy setting.

**Open decisions**
- Can one field contain multiple crop/species types?
- Are field boundaries editable after creation? Who may edit them?
- Are fields measured or labelled by area?
- Can a user register a tree without a photo?

### 8.3 Map and record discovery

**Purpose:** Show the spatial distribution of trees and fields and help users discover records.

**Requirements**
- Use an open-source-friendly mapping approach, with final library and tile provider selected after reviewing licensing, usage policies and cost.
- Show individual trees as pins.
- Show fields as polygons with an associated marker.
- Tapping a pin or polygon opens a brief record summary.
- Provide a route to the full details view.
- Support filtering by location and plant/tree type.
- Provide a list alternative for accessibility and for small screens.
- Handle loading, empty, failed network and location-permission states.
- Avoid exposing private records or precise coordinates to unauthorized users.

**Potential enhancements**
- Marker clustering at low zoom levels.
- Filter chips, map legend and search.
- Bounds-based loading for large record collections.
- Optional distance sorting, if the user grants location access.

### 8.4 Explore / plant catalogue filters

**Purpose:** Let users browse records and discover plants or fields matching their interests.

**Requirements**
- Provide multi-select filters for plant/tree type and location.
- By default, show a useful feed of recent and/or popular entries.
- Continue loading additional results as the user scrolls or uses pagination.
- Provide loading, empty and error states.
- Define “popular” using a transparent metric such as views, saves or care activity; do not invent popularity values.
- Apply visibility and permission rules to every result.

**Open decisions**
- Does “popular” mean most viewed, most monitored, most recently updated, or another metric?
- Should location filtering use the user's current location, a manually selected area, or both?
- Does the catalogue show only plants/fields, or also educational plant species independent of registered records?

### 8.5 Owner and monitor roles

**Purpose:** Allow shared responsibility while limiting the number of people responsible for one record.

**Current proposal**
- The creator becomes the default owner.
- At most one additional monitor may be active, meaning at most two active responsible users total.
- Another user can select **Request to Monitor** on a record.
- The request is submitted for administrator review.
- Once approved, the monitor can see the additional record details and submit care updates.
- A monitor cannot automatically change ownership or perform owner-only actions.

#### Proposed workflow
1. User opens a record.
2. User chooses **Request to Monitor**.
3. User provides a reason or short note, if required.
4. System creates a pending monitoring request.
5. Admin reviews the request and approves or rejects it with an optional response.
6. If approved and the record still has capacity, the requester becomes its monitor.
7. The requester receives a status notification.
8. The record details view shows the owner and monitor roles, subject to privacy settings.

**Acceptance criteria**
- The system prevents more than one active monitor per record under the current rule.
- Concurrent requests cannot cause the capacity limit to be exceeded.
- Only authorized admins can approve/reject requests if admin approval remains the chosen policy.
- A rejected requester does not gain privileged record access.
- A monitor can access the care information needed for the role but not unrelated private owner data.
- Request status and decision history are retained.

**Open decisions**
- Can the owner approve a monitor directly, or must all requests go through an admin?
- Can a monitor resign or be removed by the owner/admin?
- Does the two-person limit apply to a whole field or each individual tree within it?
- Are there emergency or temporary exceptions?

### 8.6 Watering schedule and care log

**Purpose:** Help responsible users coordinate recurring care and show whether the record is being maintained.

**Requirements**
- Show a weekly watering plan/schedule on the record details page.
- Let authorized users mark a watering event as completed and record its timestamp.
- Retain a history of who updated the care log and when.
- Show the next planned watering and recent completion history.
- Allow the care schedule to be configured based on species, plant stage or user/admin settings where appropriate.
- Avoid treating a generic schedule as universally correct; watering needs depend on species, age, soil, rainfall, climate and growing conditions.

**Potential enhancements**
- Other care activities such as fertilizing, pruning and inspection.
- Reminders or notifications when a scheduled task is due.
- Weather-aware suggestions to adjust watering, with clear explanation and user control.

**Acceptance criteria**
- Only the owner, approved monitor and authorized admin can add or modify care logs.
- Each event records who performed it and when.
- The interface distinguishes a planned watering from a confirmed completed event.
- Missed tasks are shown as reminders, not proof that no watering occurred elsewhere.

### 8.7 Admin review and ownership transfer

**Purpose:** Help administrators identify records that may need a change of responsible person while avoiding unfair or automatic transfers.

**Admin dashboard should provide**
- Pending monitoring requests.
- Ticket queues and ticket details.
- Record details and owner/monitor status.
- Care-log history and recent activity.
- Signals for records that may be neglected.
- A reviewed ownership-transfer action with confirmation and audit history.

**Proposed inactive-owner workflow**
1. The system displays care-log activity for the owner and monitor separately.
2. A possible inactivity signal is generated from configurable rules.
3. Admin reviews the record history and context.
4. Admin may contact the owner or wait for a response if that workflow is adopted.
5. Admin may transfer ownership to the monitor when justified.
6. The former owner becomes the monitor, if appropriate and if the two-role policy allows it.
7. The transfer is logged and relevant users are notified.

**Important safeguards**
- Do not transfer ownership automatically solely because the monitor logs watering more frequently.
- Define inactivity using an agreed period and meaningful activity criteria.
- Allow exceptions for seasonal plants, dormant periods, connectivity issues or legitimate absence.
- Record the admin, reason, old owner, new owner and timestamp.
- Define how the record behaves if the owner disputes the transfer or the monitor is no longer available.

**Open decisions**
- What period counts as owner inactivity?
- Should an owner be notified and given time to respond before transfer?
- What happens if both owner and monitor are inactive?
- Can ownership transfer happen only with consent, or can an admin override it under defined conditions?

### 8.8 QR code experience

**Purpose:** Connect a physical tree/field label to its digital record.

**Requirements**
- Generate a QR code linked to a stable record destination.
- Provide a customized scanning interface inspired by a tree or a hand holding a QR frame, while keeping the scan area clear and usable.
- Request camera permission only when needed.
- Provide a manual fallback if camera access is denied or unavailable, such as entering a record code or opening a QR image from the device if supported.
- On scan, resolve the QR and display the record according to its visibility and permissions.
- Provide understandable invalid, removed, revoked and network-error states.
- Allow an authorized user to display/download a printable QR asset if that feature is selected.

**Privacy and security**
- Do not encode phone numbers, emails or sensitive user data directly in the QR code.
- Use a stable URL or opaque token.
- Decide which fields are public, such as plant name, broad location, planting date and approved care information.
- Keep owner/monitor contact details private by default.
- Consider revocation and abuse prevention.

### 8.9 Inquiry and ticket system

**Purpose:** Let users report problems and track how those reports are handled.

**Initial ticket categories**
- Tree/plant may have been removed.
- A tree or field appears to have no active person monitoring it.
- Request to monitor/adopt a particular tree or field.
- General issue or other support request.

**User workflow**
1. User opens Inquiry/Support.
2. User selects a category.
3. If relevant, user links/selects a tree or field.
4. User enters a description and may attach a photo.
5. User submits the ticket.
6. System creates a ticket ID and displays confirmation.
7. User sees a list/table of their tickets with status and last update.
8. User opens a ticket to see the details and any admin reply.

**Admin workflow**
1. Admin views all tickets permitted to their role.
2. Admin filters by status/category/priority.
3. Admin opens a ticket and reviews the description and attachments.
4. Admin replies and changes status.
5. Admin approves/rejects the requested action where relevant.
6. User can view the decision and reply in the ticket history.

**Suggested statuses**
- New
- Under review
- Waiting for user
- Approved
- Rejected
- Resolved
- Closed

These statuses should be simplified or adjusted during design. Not every ticket category needs every status.

**Acceptance criteria**
- Users can see their own tickets and authorized admins can see the admin queue.
- Every ticket has a stable ID, category, creation time, status and history.
- Status changes and admin replies are retained.
- A ticket about a tree/field links to the correct record where applicable.
- Rejecting a ticket requires an appropriate reason or response if the team adopts that policy.

### 8.10 Photo-based plant disease check

**Purpose:** Let a user photograph a plant and receive an initial indication of possible disease and next steps.

**Proposed workflow**
1. User opens Disease Check from Inquiry/Support or the relevant plant details page.
2. User captures a live photo or chooses an existing image.
3. App asks for any useful context, such as plant type and visible symptoms, if needed.
4. The image is sent to a selected existing identification/diagnosis API or model, subject to privacy and cost review.
5. The app displays possible conditions, confidence/uncertainty if available, and recommended next steps.
6. User can attach the result to a support ticket or save it as a plant observation, if those flows are approved.

**Important limitations**
- Do not build a custom ML model from scratch for the first version, per the current idea.
- A photo alone may not reliably distinguish diseases, pests, nutrient deficiencies, physical damage or normal seasonal changes.
- Results must be framed as possible matches, not a guaranteed diagnosis.
- Remedy advice should come from a reputable source and account for plant type and local context.
- If confidence is low, recommend another photo or review by a qualified horticulture/agriculture expert.
- Explain whether the image is sent to a third-party service and how it is retained.
- Add rate limits and cost controls before enabling the feature for all users.

**Open decisions**
- Which service/API will be used?
- Does it support the intended plant types and geographic region?
- What are its costs, usage limits, data policies and licence?
- Should disease checking be a standalone tool, a ticket attachment flow, or both?

### 8.11 Context-aware care recommendations

**Purpose:** Provide useful, understandable suggestions based on available plant, location and environmental information.

**Potential input sources**
- User-approved location or manually selected location.
- Weather API data such as forecast, rainfall, temperature and humidity where available.
- Plant species and planting date, if known.
- Local date/season and broad climate context.
- Care-log history.
- Optional device sensor data only when supported and permissioned.

**Example recommendation types**
- “Rain is forecast; check soil moisture before watering.”
- “High temperatures are forecast; monitor young plants for signs of water stress.”
- “Based on the selected species and local season, review whether this is a suitable planting period.”
- “This record has no recent care update; check the plant when convenient.”

These are examples, not approved recommendation rules. Actual recommendations need reliable sources and species-specific logic.

**Device capability caveat**
- A PWA cannot reliably collect every kind of device information.
- Ambient-light/lux sensors are not universally available to web apps. Do not promise automatic lux collection until the target browser/device support is verified.
- Do not collect unrelated phone/device details. Collect only data needed for a clear feature, explain why, and obtain permission where required.
- Weather/location-based insights should degrade gracefully when location is denied or an API is unavailable.

**Acceptance criteria**
- Each recommendation identifies its basis in understandable language.
- Recommendations are not presented as certain when the data is incomplete.
- Location and weather failures do not prevent basic plant record access.
- Users can use a manually selected location if they do not grant geolocation.
- No background collection is assumed unless the platform supports it and the user has been informed.

**Open decisions**
- Which weather provider and data licence will be used?
- Which recommendations are in the first release?
- How will season and plant-care rules be validated?
- Should users be able to disable recommendations or notifications?

### 8.12 Settings, About Us and Feedback

**Settings**
- Account/profile preferences.
- Privacy controls and location/camera permission guidance.
- Notification preferences, if notifications are implemented.
- Sign-out and account actions.
- Avoid showing settings for features that do not exist yet.

**About Us**
- Project aim and problem statement.
- Team members and responsibilities.
- Research work and references.
- Clear distinction between project claims and externally sourced information.

**Feedback**
- Collect a rating and/or structured feedback, plus an optional message.
- Show confirmation after submission.
- Define whether anonymous feedback is allowed.
- Protect feedback from unauthorized access and decide how admins review it.

---

## 9. Data model — candidate entities

Final schema depends on the selected database and complete requirements.

| Entity | Purpose / candidate fields |
|---|---|
| User | `id`, `name`, `phone`, `email`, `status`, timestamps |
| PlantRecord | `id`, `record_type` (`tree`/`field`), `owner_user_id`, names/species, description, point coordinates, field geometry, privacy/status, timestamps |
| PlantPhoto | `id`, `plant_record_id`, storage reference, uploader, timestamp |
| MonitoringRequest | `id`, `plant_record_id`, `requester_user_id`, note, status, reviewer, decision reason, timestamps |
| PlantMonitor | `plant_record_id`, `monitor_user_id`, status, start/end timestamps |
| CareSchedule | `id`, `plant_record_id`, care type, cadence/rules, timezone, active status |
| CareLog | `id`, `plant_record_id`, `actor_user_id`, activity type, completion time, notes, optional photo |
| PlantObservation | `id`, `plant_record_id`, author, observation type, notes, photo/reference, timestamp |
| QRReference | `id`, `plant_record_id`, opaque token, status, creation/revocation timestamps |
| SupportTicket | `id`, creator, category, linked record, description, status, priority, timestamps |
| TicketMessage | `id`, `ticket_id`, author, message, attachments, timestamp |
| Feedback | `id`, optional user reference, rating, message, timestamp |
| DiseaseAnalysis | `id`, record/user reference, provider, result summary, confidence if supplied, timestamp and consent/data metadata |
| Recommendation | `id`, record/user reference, recommendation type, message, source/basis, created/expiry timestamps |
| AdminAuditEvent | actor, action, target record, reason, before/after summary, timestamp |

### Data design notes

- Use stable generated IDs rather than phone/email as relational keys.
- Use a suitable geospatial type for field polygons if supported by the chosen database.
- Validate polygons and coordinates on the backend.
- Keep public QR response fields separate from private record fields.
- Store photos in object storage and references/metadata in the database.
- Track role and ownership history to support audits and dispute resolution.
- Store timestamps consistently and display them in the user's chosen/local timezone.
- Define retention/deletion rules for tickets, photos, disease images and audit events.

---

## 10. Non-functional requirements

### Responsive UI and accessibility
- Support mobile, tablet and desktop layouts.
- Maintain readable contrast and visible focus states.
- Do not communicate status using colour alone.
- Provide text alternatives for map-only information.
- Make important actions usable by keyboard and touch.

### Performance
- Load the core shell and essential pages efficiently.
- Paginate or progressively load large record lists.
- Use map clustering or viewport-based loading if scale requires it.
- Resize/compress photos appropriately without destroying analysis quality.
- Cache only what is appropriate for offline use and privacy.

### Security and privacy
- Use HTTPS in production.
- Enforce role checks on the server.
- Protect admin functions with strong authentication and authorization.
- Validate user input and uploaded files.
- Avoid leaking precise location and private contact data.
- Document third-party API data sharing.
- Define rate limits for ticket creation, QR endpoints and image analysis.
- Plan backups and secure secret management.

### Reliability
- Handle offline, timeout, permission-denied and API-failure states.
- Preserve user-entered form data where safe and practical.
- Show pending synchronization if offline edits are supported.
- Provide meaningful error messages and safe retry behaviour.

---

## 11. Suggested phased delivery

### Phase 0 — Requirements and technical decisions
- Confirm roles, page terminology, privacy rules and MVP scope.
- Choose the stack, map provider, authentication and storage.
- Confirm which APIs are affordable and appropriate.
- Define acceptance tests.

### Phase 1 — PWA foundation and core records
- Responsive app shell and brand design system.
- Authentication and user profile.
- Add/view/edit a tree record.
- Map pins and plant details.
- Initial QR generation and public/private access rules.

### Phase 2 — Fields and shared monitoring
- Field polygon drawing and rendering.
- Monitoring requests and admin approval.
- Owner/monitor roles and access rules.
- Watering schedule and care logs.

### Phase 3 — Support and administration
- Ticket creation and tracking.
- Admin ticket queue and replies.
- Admin record review, audit history and ownership-transfer workflow.
- Feedback and About Us pages.

### Phase 4 — Smart assistance
- Plant species suggestions from images, if selected.
- Disease-photo analysis through an existing service.
- Weather-aware and seasonal recommendations.
- Notifications/reminders where supported.

### Phase 5 — Hardening and release
- Responsive, accessibility, security and permission testing.
- Offline behaviour and sync testing if included.
- Performance, backup and deployment checks.
- Installability testing across the target browsers/devices.

Phases may change after technical validation, cost review and capstone priorities are known.

---

## 12. Success measures to consider

Choose measurable targets with the team before release. Candidate measures include:

- Number of valid tree and field records created.
- Percentage of records with usable location data.
- Percentage of records with an active owner and monitor, where applicable.
- Care-log completion and record-update frequency.
- Monitoring-request review time.
- Ticket response/resolution time.
- QR scan success rate.
- Disease-check failure/low-confidence rate.
- User completion rate for the add-record flow.
- Crash/error rate and PWA installation success on target devices.

Do not set arbitrary targets until the team has a baseline and a realistic test plan.

---

## 13. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Plant-disease analysis is inaccurate | Present possibilities with uncertainty; use reputable sources and expert review for uncertain cases |
| Public QR exposes private data | Use opaque QR destinations and a deliberately limited public view |
| Map tile provider has limits or licensing restrictions | Review terms and expected usage before choosing a provider |
| Owner/monitor disputes | Keep role history, notify affected users and require admin review |
| False inactivity signal | Use transparent criteria, grace periods and human review |
| Weather recommendations are too generic | Use species/context data where available and label suggestions as guidance |
| Browser cannot access a sensor | Feature-detect, provide alternatives and do not make unsupported capabilities a dependency |
| AI coding agent generates incomplete or inconsistent UI | Build incrementally, use shared tokens/components, and validate against acceptance criteria |
| Scope grows too large for a capstone | Prioritize a clear MVP and treat costly/uncertain integrations as later phases |

---

## 14. Open questions for the next refinement

1. Does the two-person rule mean one owner plus one monitor for both trees and whole fields?
2. Must every monitoring request be approved by an admin, or can an owner approve directly?
3. What exact actions can a monitor perform besides logging care?
4. What qualifies as owner inactivity, and what safeguards are required before transferring ownership?
5. What fields are visible to an unauthenticated QR scanner?
6. Can fields contain multiple species/crops, and can a field polygon contain holes or multiple separate plots?
7. Which disease-analysis service is feasible for the budget and intended region?
8. Which weather source and recommendation rules should be used?
9. Is automatic lux measurement essential, or is weather/season-based guidance sufficient for the first version?
10. What does the original “clients page” mean?
11. Should “Explore/plant catalogue” be separate from the map dashboard?
12. What is the minimum feature set required for the capstone demonstration?

---

## 15. Working agreement for future changes

This document is a living PRD. As new ideas are discussed:

- Add each idea under the appropriate page, workflow and data entity.
- Separate confirmed requirements from optional suggestions.
- Record dependencies, risks and unresolved questions.
- Update acceptance criteria when behaviour changes.
- Revisit architecture when a feature requires a new data source, permission or integration.
- Do not treat a feature as implemented merely because it appears in this document.
