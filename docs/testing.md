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
6. [Directory Structure](#6-directory-structure)
7. [Running Tests](#7-running-tests)
8. [CI/CD Rules](#8-cicd-rules)
9. [Coverage Expectations](#9-coverage-expectations)
10. [Writing New Tests](#10-writing-new-tests)
11. [Continuous Improvement](#11-continuous-improvement)

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

- Playwright (recommended) or Cypress

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

## 6. Directory Structure

- **Unit and component tests:** Co-locate with source as `*.test.ts` or `*.test.tsx` next to the file under test (e.g. `page.tsx` → `page.test.tsx`, `utils.ts` → `utils.test.ts`).
- **Integration tests:** Place in a dedicated directory so they are easy to run separately and don’t blur with unit/component tests. Use **`tests/integration/`** at the project root (e.g. `tests/integration/metadata-manager-flow.test.tsx`). Optionally mirror `src/` structure under `tests/integration/` if you have many integration tests. Use MSW and real or wrapped providers (e.g. `PopupProvider`) only where the test needs a multi-module flow.
- **E2E tests:** Place in **`e2e/`** or **`tests/e2e/`** (e.g. Playwright specs). Keep them separate from Vitest so they can be run with a different command and config.
