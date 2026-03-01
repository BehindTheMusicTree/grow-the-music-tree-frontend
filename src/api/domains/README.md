# API endpoint contracts

Paths are **relative** to `NEXT_PUBLIC_BACKEND_BASE_URL`:

- **No leading slash** – e.g. `me/spotify/`, `me/genres/`, not `/me/spotify/`
- **Trailing slash** – used for collection and resource URLs (Django-style)

The fetch layer normalizes the base URL (strips trailing slashes) then joins with a single `/`. A path with a leading slash is invalid and will throw at runtime.
