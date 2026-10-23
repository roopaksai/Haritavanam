# Haritavanam — Brand & Visual Design Reference

**Status:** Initial draft  
**Purpose:** Record the current brand decisions based on the supplied logo/icon and colour-palette reference images.

> Keep the original reference images alongside this file when sharing the project with an AI coding agent or developer. The images are visual references; this document captures their key design information.

## 1. Brand identity

- **Product name:** Haritavanam
- **Tagline:** Plant · Track · Preserve
- **Hero headline:** A Greener Tomorrow
- **Hero supporting copy:** Plant trees, track their growth and be a part of a sustainable future.

## 2. Core brand colours

| Token | Hex value | Intended use |
|---|---|---|
| Primary / Olive Green | `#3A5A40` | Primary actions, navigation, headers |
| Secondary / Sage Green | `#A3B18A` | Secondary actions, supporting icons, highlights |
| Background / Beige | `#F5F1E8` | App background, cards and surfaces |
| Accent Red | `#EF4444` | Location pins, alerts and important actions |

## 3. Visual direction

The visual identity should feel **natural, calm, trustworthy, modern and sustainable**.

- Use generous whitespace, beige surfaces and olive-green emphasis.
- Use red selectively for location pins, alerts and important states.
- Nature photography and landscape illustrations may support the landing/hero area. Keep operational screens legible and uncluttered.
- Maintain a consistent icon family. The supplied reference includes line icons and filled/circular UI icons; choose a primary style for each context and avoid mixing styles arbitrarily.
- Logo variants shown in the reference: horizontal logo, vertical logo, light app icon, dark app icon, favicon and adaptive splash/icon artwork.

## 4. Icon concepts in the reference

- Home
- Map
- My Trees
- Profile
- Camera / Add Photo
- Add Tree / Plant
- Tree Details
- Analytics / Stats
- Settings
- Notifications / Alert
- Help
- Achievements
- Care
- Date / Calendar
- Current Location
- Logout

## 5. Design-system recommendations

- Define semantic tokens for primary, secondary, background, text, border, success, warning, error and informational states.
- Check text and interactive-element contrast. Brand colours must not override accessibility requirements.
- Provide hover, focus, pressed, disabled, loading, empty and error states for interactive components.
- Create responsive rules for small phones, large phones, tablets and desktop layouts.
- Use a PWA manifest and suitable app-icon assets. Verify launch/splash behaviour on supported browsers and operating systems instead of assuming one image behaves identically everywhere.
- **Typography is not finalized.** The reference image does not establish a dependable font-family specification. Choose and document an accessible, web-available typeface and type scale during design.

## 6. Suggested semantic tokens

These are naming recommendations, not additional approved colours:

```css
:root {
  --color-primary: #3A5A40;
  --color-secondary: #A3B18A;
  --color-background: #F5F1E8;
  --color-accent: #EF4444;
}
```

Add semantic text, border, surface, success, warning, error and information tokens after contrast and usage are reviewed.

## 7. Assets to retain

Keep the supplied logo/icon reference and colour-palette reference with the project files. When possible, use editable/vector logo assets rather than extracting a logo from a screenshot.
