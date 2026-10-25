# Haritavanam Figma Design Generator

This Figma plugin generates the Haritavanam design system and key screens directly inside your Figma file.

## How to run

1. Open your Figma file: https://www.figma.com/design/8WJhUxdIyqru8pUj2OUcRN/Untitled
2. In Figma desktop (or web with the desktop bridge), go to **Plugins → Development → Import plugin from manifest...**
3. Select `manifest.json` from the `figma-plugin/` folder.
4. Run the plugin: **Plugins → Development → Haritavanam Design Generator**.

The plugin will create three pages:
- **Foundations** — brand colours, typography scale.
- **Components** — buttons, plant cards, status badges, map marker.
- **Screens** — Welcome, Sign in, Dashboard, Plant details, Add tree, QR scan (mobile frames with bottom nav).

## Note
Figma's REST API and MCP are read-only and cannot create or edit file content. This plugin uses the Figma Plugin API (which runs inside the Figma app) to generate the design. Run it locally in Figma.
