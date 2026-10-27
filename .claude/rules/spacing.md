---
paths:
  - "src/**/*.tsx"
  - "src/**/*.css"
---

# Spacing

The root font size is the browser default (16px); never set it on `:root`. Spacing is the Tailwind scale (4px steps) or a brand token from the `@behindthemusictree/brand` preset (`gutter`, `header`, `detail-panel`, `player-panel`, `--layout-*`). No `em` spacing and no arbitrary px; the exceptions are fixed geometry (borders, scrollbars, dialog min-widths) and anything a library API only accepts in px.
