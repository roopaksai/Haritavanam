# Haritavanam — Figma Design & UI Specification

**Status:** Initial draft  
**Purpose:** Translate the current brand references and product areas into a consistent responsive design system and clickable prototype.

## 1. Design source of truth

Use the supplied logo/icon sheet and colour-palette sheet as visual references. Figma should contain editable components, design variables/tokens, screen frames and prototype flows. The reference images themselves are not a substitute for editable source assets.

## 2. Core design tokens

| Token | Value |
|---|---|
| `color.primary` | `#3A5A40` |
| `color.secondary` | `#A3B18A` |
| `color.background` | `#F5F1E8` |
| `color.accent` | `#EF4444` |

Also define semantic tokens for text, borders, surfaces, success, warning, error and information.

Typography is not finalized. Choose an accessible, web-available font family and document a consistent type scale during design.

## 3. Candidate screen inventory

1. Splash/launch artwork and app-icon variants.
2. Welcome/hero screen with “A Greener Tomorrow” and “Plant · Track · Preserve”.
3. Sign in, sign up, verification and account-recovery states.
4. Dashboard/interactive map with marker states, loading and permission-denied fallback.
5. Plant registration flow:
   - Capture or upload photo
   - Suggest or enter plant name/species
   - Add optional description
   - Capture location or choose a manual fallback
   - Review and confirm
   - Show successful registration and QR code
6. Plant details and QR display.
7. QR scanner and public QR details view.
8. Settings and profile.
9. About Us, team and project references.
10. Inquiry ticket list, ticket detail and ticket creation.
11. Feedback form and submission confirmation.
12. Admin dashboard and management views, accessible only to authorized administrators.

The screen list must be updated after the user clarifies the “clients page” and shares the remaining feature ideas.

## 4. Responsive design requirements

- Design phone-first, then adapt to tablet and desktop rather than stretching a fixed mobile frame.
- Use bottom navigation where suitable on phones; consider a sidebar or wider navigation pattern on desktop.
- Ensure maps have an accessible list alternative and remain usable on narrow screens.
- Define responsive breakpoints in implementation tokens; exact values can be selected with the frontend framework.
- Include loading, empty, error, denied-permission, offline and success states.
- Avoid relying on hover alone for any important interaction.
- Check touch target size and form usability on mobile.

## 5. Reusable components to build

- Buttons: primary, secondary, outline, destructive, disabled and loading.
- Form controls with labels, helper text, validation and focus states.
- Plant/tree cards, status badges, photo thumbnails and metadata rows.
- Map markers and a marker legend, including planted/healthy/under-care/other states if approved.
- Navigation items, dialogs, toasts, confirmation panels and empty states.
- QR-code panel, scan frame and camera-permission state.
- Ticket status components and feedback controls.
- Consistent page headers, cards, spacing, radii and elevation.

## 6. Figma MCP workflow

1. Inspect which operations the connected MCP server actually supports before relying on it for file creation or editing.
2. Create Figma pages for foundations, components, application screens and prototype flows.
3. Build reusable components and variables/tokens before duplicating screens.
4. Prototype the primary journey: sign up → register plant → confirm location → generate QR → view record.
5. Prototype QR scanning, support-ticket creation/tracking and administrator access.
6. Use realistic loading, empty, failure and permission-denied states in the prototype.
7. Compare implementation screenshots against Figma and iterate.

MCP provides tool access; it does not guarantee that a generated design is polished or that implementation code will match it. Review the result.

## 7. Accessibility and quality checks

- Check contrast, legibility, touch target sizes, focus visibility and form-error messaging.
- Do not rely on colour alone to communicate plant health or ticket status.
- Pair ambiguous icons with labels.
- Verify splash/launch behaviour on the supported PWA platforms.
- Check the design at small phone, large phone, tablet and desktop widths.
- Ensure permission prompts are contextual and provide an alternative when users deny access.
