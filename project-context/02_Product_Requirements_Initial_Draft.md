# Haritavanam — Product Requirements Document (Initial Draft)

**Status:** Draft based on the initial project discussion  
**Important:** This is not the final specification. Add the forthcoming feature ideas and resolve open questions before implementation.

## 1. Product overview

Haritavanam is a proposed installable Progressive Web App (PWA) intended to let users register planted trees/plants, maintain records about them, view their locations on an interactive map, and share selected plant information through a QR code.

## 2. Initial goals

1. Maintain user records and a stable internal user identifier.
2. Register plants/trees with a photo, location, name/species and optional description.
3. Optionally suggest a likely plant/tree species from an uploaded photo where a suitable identification service or model is available. Show uncertainty and allow the user to confirm or correct the suggestion.
4. Generate a QR code associated with a plant record so scanning it opens an appropriate details page.
5. Display registered plant locations as pins on an interactive map.
6. Provide a support/inquiry ticket system and an app feedback mechanism.
7. Provide an administrator experience for authorized admin accounts.
8. Offer a branded launch/splash experience within platform-supported PWA capabilities.

## 3. Initial page and feature inventory

| Page / area | Initial intent | Open questions |
|---|---|---|
| Dashboard / Map | Interactive map showing registered plant/tree records as pins | Map provider, filters, clustering, privacy, list alternative, location permission and manual fallback |
| Settings | App preferences and account-related settings using familiar mobile-app patterns | Which settings are required for the first release? |
| Clients / My Trees — terminology to confirm | Likely an area for viewing plant records, but “clients page” is ambiguous | Does this mean My Trees, users/clients, or another feature? |
| About Us | Project aim, team members and research/reference material | Team details, approved content and citation format |
| Sign in / Sign up | Create or access an account using phone number and/or email, with name as required | Authentication provider, verification, recovery and account deletion |
| QR page | Scan a QR code and show the associated plant record; potentially display/download/print a QR code | Which record fields are public? What should happen for invalid or revoked QR codes? |
| Inquiry / Support | Create support tickets and track their status | Ticket fields, statuses, attachments, admin response workflow and notifications |
| Feedback | Collect feedback about the application | Rating/questions, anonymous submissions, moderation and privacy |
| Admin area | Restricted administration interface for authorized administrators | Roles, permissions, user/record management, ticket handling, audit logs and admin provisioning |

## 4. User records

Fields mentioned so far:

- Internal unique user ID
- Name
- Phone number
- Email address

The final account design may require email, phone or either one. The system should generate a stable internal ID and use it as the database reference. Do not use a phone number or email address as the primary internal identifier because either can change.

## 5. Plant/tree records

Candidate fields based on the current requirements:

- Internal plant/tree record ID
- Owner/creator user ID
- Photo or photos
- Geographic coordinates, collected only with permission and with a manual-location fallback
- Common name and/or species name
- Optional user-provided description
- Planting date and additional metadata to be decided
- QR code or stable QR destination associated with the record

The exact required fields should be confirmed before the registration form is finalized.

## 6. QR code and privacy requirements

- A QR code should encode a stable URL or opaque record reference rather than sensitive personal information.
- Define which plant details are public when scanned. Keep owner contact details private by default.
- Provide a way to revoke, rotate or disable a QR destination if a record is removed or misused.
- Ask for appropriate permission before making precise plant locations publicly accessible.
- Define behaviour for invalid, removed, private or revoked records.
- Consider abuse prevention and rate limiting for public QR pages.

## 7. PWA expectations

- Responsive layout for phone, tablet and desktop.
- Installability through a valid web app manifest and supported browser/OS installation flow.
- A service worker and caching strategy designed around actual offline requirements.
- Camera, geolocation and notification use must be feature-detected and permission-aware.
- Do not promise identical native-app capabilities across all browsers or operating systems.
- A PWA can provide an app-like standalone experience, but splash-screen and device-feature behaviour varies by platform.

## 8. Initial quality requirements

- Accessible colour contrast, keyboard/focus support and readable text.
- Secure authentication and server-side authorization for administrative features.
- Validate uploaded files and limit file types and sizes.
- Provide loading, empty, error, denied-permission and offline states.
- Test map and location functionality on supported mobile browsers.
- Explain how user data, photos and precise locations are used.
- Define data retention, account deletion and backup expectations.

## 9. Decisions to resolve before implementation

- Clarify the “clients page” and confirm final navigation labels.
- Confirm whether email, phone or both are required and how accounts are verified.
- Choose a map library/provider and decide how map tiles will be sourced and used.
- Define which plant details can be accessed publicly through a QR scan.
- Choose the backend, database, authentication, image storage and hosting.
- Define offline scope and synchronization behaviour.
- Define administrator roles and permissions.
- Decide whether plant identification is a first-release requirement or a later enhancement.
- Confirm whether users can edit, transfer, archive or delete plant records.
- Define the minimum viable release versus future enhancements.
