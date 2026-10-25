# Haritavanam — Design System

## Brand identity
- Product: Haritavanam; tagline "Plant · Track · Preserve"; hero "A Greener Tomorrow".
- Visual direction: natural, calm, trustworthy, modern, sustainable. Generous whitespace, beige surfaces, olive emphasis, red used selectively for location pins/alerts/important actions.

## Colour tokens
- `color.primary` #3A5A40 (primary actions, nav, headers)
- `color.secondary` #A3B18A (secondary actions, icons, highlights)
- `color.background` #F5F1E8 (app bg, cards, surfaces)
- `color.accent` #EF4444 (location pins, alerts, important actions)
- Add semantic text/border/surface/success/warning/error/info tokens after contrast review.

## Typography
- NOT FINALIZED. Proposed default: Inter or system-ui stack for UI; a readable serif optional for headings. Document chosen family + type scale during design. Do not treat as confirmed.

## Spacing, radii, elevation
- Define 4/8px spacing scale; consistent radii (sm/md/lg/full); subtle elevation on cards. Exact values selected with frontend framework.

## Reusable components
Buttons (primary/secondary/outline/destructive/disabled/loading); form controls with labels/helper/validation/focus; plant/field cards, status badges, photo thumbnails, metadata rows; map markers + legend (planted/healthy/under-care/other if approved); navigation items, dialogs, toasts, confirmation panels, empty states; QR panel, scan frame, camera-permission state; ticket status components; feedback controls; page headers, cards, spacing, radii, elevation.

## States
Loading, empty, error, denied-permission, offline, success for all relevant screens. Avoid hover-only interactions; ensure touch targets and keyboard focus.

## Responsive
Phone-first; bottom nav on phones; sidebar/wider nav on desktop/tablet. Maps require accessible list alternative. Breakpoints defined in implementation tokens.

## Accessibility
Contrast, legible text, visible focus, no colour-only status, text alternatives for map-only info, keyboard/touch usability, contextual permission prompts with alternatives.

## Assets
Preserve supplied logo concept; use editable/vector assets when available. Do not stretch/crop screenshots. Reference images not currently in repository (blocker).
