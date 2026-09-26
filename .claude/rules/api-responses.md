---
paths:
  - "src/**/*.ts"
  - "src/**/*.tsx"
---

# API responses

A direct `fetch` to an upstream API must parse its JSON with a zod schema (`src/schemas/api/`); app-kit hooks already do this. Reuse an app-kit schema when the caller is a client component — server code can't import app-kit's barrels, which create React contexts at import.
