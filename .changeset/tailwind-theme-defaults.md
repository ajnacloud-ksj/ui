---
"@ajnacloud/ui": patch
---

Emit light and dark theme variables from the Tailwind v3 preset so native consumers no longer need a token stylesheet import. Preserve standalone CSS and the separate token export.

Use CVA for Button variants while preserving its public API and class overrides. Fall back to defaults for invalid runtime Button options and Dialog sizes.
