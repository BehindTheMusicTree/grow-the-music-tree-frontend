# Testing Strategy

## Table of Contents

1. [Goals](#1-goals)
2. [Tools](#2-tools)
   - [Unit & Component Testing](#unit--component-testing)
   - [End-to-End Testing](#end-to-end-testing)
3. [Test Types](#3-test-types)
   - [Unit Tests](#31-unit-tests)
   - [Component Tests](#32-component-tests)
   - [Integration Tests](#33-integration-tests)
   - [End-to-End Tests](#34-end-to-end-tests)
4. [Next.js-Specific Testing Rules](#4-nextjs-specific-testing-rules)
5. [Mocking Strategy](#5-mocking-strategy)
6. [React Strict Mode](#6-react-strict-mode)
7. [Directory Structure](#7-directory-structure)
8. [Running Tests](#8-running-tests)
9. [CI/CD Rules](#9-cicd-rules)
10. [Coverage Expectations](#10-coverage-expectations)
11. [Writing New Tests](#11-writing-new-tests)
12. [Continuous Improvement](#12-continuous-improvement)

---

## 1. Goals

- Ensure reliability of client and server components.
- Prevent regressions in routing, rendering, and data‑fetching logic.
- Provide fast feedback during development using Vitest.
- Maintain confidence in critical user flows through integration and E2E testing.
- Keep tests deterministic, isolated, and easy to maintain.

---

## 2. Tools

### Unit & Component Testing

- Vitest
- @testing-library/react
- @testing-library/jest-dom
- happy-dom or jsdom
- MSW (Mock Service Worker)

### End-to-End Testing

- Playwright (Chromium) against the production build, specs in `e2e/`

---

## 3. Test Types

### 3.1 Unit Tests

Used for:

- Utility functions
- Server‑side logic
- Small client components

Guidelines:

- Keep tests isolated
- Mock external dependencies
- Avoid rendering full pages

### 3.2 Component Tests

Used for:

- Client components
- Server components (rendering only)

Guidelines:

- Test behavior, not implementation details
- **Finding elements:** Use Testing Library queries from `screen` (or the result of `render`). Prefer, in order: `getByRole`, `getByLabelText`, `getByText`. Use `getByTestId` only when role/label/text are impractical; see [Data attributes](./DATA_ATTRIBUTES.md). Do **not** use `document.querySelector` or other DOM selectors (e.g. `input[type="file"]`) — they tie tests to implementation and bypass accessibility. Example: for an input with `aria-label="Choose an audio file"`, use `screen.getByLabelText(/choose an audio file/i)` instead of `document.querySelector('input[type="file"]')`.
- Mock server actions and data‑fetching

### 3.3 Integration Tests

Used for:

- API routes
- Server actions
- Data‑fetching logic
- Component + API interaction

Guidelines:

- Use MSW for network mocking
- Avoid real external API calls
- Test flows between modules

### 3.4 End-to-End Tests

Used for:

- Routing
- Authentication
- Critical user journeys
- Server vs client rendering

Guidelines:

- Keep E2E tests minimal and focused
- Only test critical paths
- Avoid flakiness

Browser journeys (`e2e/entity-url.spec.ts`):

- Run locally: `pnpm build`, copy `public` to `.next/standalone/public` and `.next/static` to `.next/standalone/.next/static` (as the `Dockerfile` does), then `pnpm test:e2e`. The config serves `.next/standalone/server.js` on port 3100. Kill a leftover server on that port after rebuilding, or Playwright reuses the stale one.
- The API is frozen: `e2e/support/api.ts` stubs `**/api/grow-proxy/**` with `e2e/support/fixtures.ts`, each payload parsed by the schema the app uses. A call outside the stubs is answered 599 and collected in `unstubbed`; never point a journey at staging. Route patterns must accept the trailing slash (308 to no-slash) and query strings.
- The map runs in headless Chromium through SwiftShader (launch args in `playwright.config.ts`).
- `e2e/support/invariants.ts` is asserted after each step: no `at`/`region` on `/`, no `view`/`zoom` on `/map`, tab title and panel match the URL. It waits for the page to settle first, because a title read early can match a transient value.
- Not covered by a journey: the title observer in `useEntityDocumentTitle` (unit-tested); Next's metadata commit does not race the hook on the production build.

---

## 4. Next.js-Specific Testing Rules

### Server Components

- Test pure logic with unit tests
- Test rendering with component tests
- Mock `fetch`, server actions, and external services

### Client Components

- Use React Testing Library
- Mock `next/navigation` when needed

### Routing

Example mock:

```ts
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));
```

---

## 6. React Strict Mode

We use a **hybrid** approach:

- **Unit and component tests (Vitest):** Run **without** React Strict Mode. Do not wrap components in `<StrictMode>` in custom render helpers or test setup; do not call `configure({ reactStrictMode: true })` in RTL. Prefer exact assertions (e.g. `toHaveLength(6)`, `getByRole(...)` for a single element). If your environment still double-renders (e.g. some React 19 / Vite setups), use resilient assertions: `expect(elements.length).toBeGreaterThanOrEqual(n)` for counts and `getAllByRole` / `getAllByLabelText` then `expect(...length).toBeGreaterThanOrEqual(1)` for elements that should appear once.
- **E2E tests (Playwright/Cypress):** Run the real app (dev or production build). The app uses whatever is configured in the Next.js root (e.g. `reactStrictMode` in `next.config.ts`). If you enable Strict Mode in the app later, E2E will automatically exercise that behavior; no test change needed.

This keeps Vitest tests simple and stable when possible; E2E still validates real user-facing behavior.

---

## 7. Directory Structure

- **Unit and component tests:** Co-locate with source as `*.test.ts` or `*.test.tsx` next to the file under test (e.g. `page.tsx` → `page.test.tsx`, `utils.ts` → `utils.test.ts`).
- **Integration tests:** Place in a dedicated directory so they are easy to run separately and don’t blur with unit/component tests. Use **`tests/integration/`** at the project root (e.g. `tests/integration/genre-tree-flow.test.tsx`). Optionally mirror `src/` structure under `tests/integration/` if you have many integration tests. Use MSW and real or wrapped providers (e.g. `PopupProvider`) only where the test needs a multi-module flow.
- **E2E tests:** Place in **`e2e/`** or **`tests/e2e/`** (e.g. Playwright specs). Keep them separate from Vitest so they can be run with a different command and config.
