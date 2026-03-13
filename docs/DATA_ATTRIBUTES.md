# Data Attributes in React

Industry-standard use of HTML `data-*` attributes in React projects: when to use them, naming, and what to avoid.

## Summary of data-* attributes

| Attribute | Purpose | When to use |
|-----------|---------|-------------|
| `data-testid` | Stable hook for tests | Fallback when role/label/text queries aren’t practical (e.g. non-interactive wrappers, E2E). Prefer `getByRole` / `getByLabelText` first. |
| `data-state` | Component UI state | On components that define it (e.g. TableRow `selected`, Radix `open`/`closed`). Use only the values that component documents; or define a set for your own component. |
| `data-page` | Page/section identity | Root container of a page or major section, for E2E (“am I on this page?”) or analytics. Value = route/feature name, kebab-case. |
| `data-analytics-event`, `data-track` | Analytics event name | When you need to tag elements for analytics. Prefer small identifiers; resolve details in code/backend. |
| `data-feature` | Feature flag / experiment | To target elements for A/B tests or feature detection. |

Details and examples are in [Common use cases](#common-use-cases) below.

## Table of Contents

- [Summary of data-* attributes](#summary-of-data--attributes)
- [What are data-* attributes?](#what-are-data-attributes)
- [Common use cases](#common-use-cases)
- [Naming conventions](#naming-conventions)
- [When not to use data-*](#when-not-to-use-data-)
- [References](#references)

---

## What are data-* attributes?

`data-*` are HTML5 custom data attributes. They:

- Are valid on any element and pass through the DOM
- Are readable via `element.dataset` or `getAttribute('data-*')`
- Do not affect layout or semantics by default
- Are supported in JSX: use `data-testid`, `data-state`, `data-page`, etc. like any other prop

Use them for **metadata or hooks** that are not part of visible content or semantics (e.g. not for styling alone or for large serialized data).

---

## Common use cases

### 1. Testing (e.g. `data-testid`)

**Industry standard:** [Testing Library](https://testing-library.com/docs/queries/about#priority) recommends querying by **role, label, or text** first. Use `data-testid` as a **fallback** when:

- There is no accessible role/label (e.g. a non-interactive wrapper)
- The visible text or label is unstable or duplicated
- You need a stable hook for E2E or integration tests

In this project we use **Vitest + Testing Library**. Prefer querying by role, label, or text; add `data-testid` only when those are impractical. In tests, avoid `document.querySelector` and other implementation-detail selectors — see [Testing strategy](./testing.md) for query best practices.

```tsx
// Prefer: query by role/label (see testing.md)
screen.getByRole('button', { name: /submit/i });
screen.getByLabelText('Email');

// Fallback: when no semantic hook is available
<div data-testid="genre-tree-form">...</div>
// In test: screen.getByTestId('genre-tree-form')
```

**Naming:** Use kebab-case, and a name that reflects the **purpose or scope** (e.g. `genre-tree-form`, `track-list`, `genre-tree-node`), not implementation details.

---

### 2. Component / UI state (e.g. `data-state`)

Libraries like **Radix UI** use `data-state` to expose component state to CSS and JS (e.g. `open`, `closed`, `selected`). This is a common pattern for headless components.

```tsx
// Radix-style: state is reflected on the DOM for styling
<div data-state={isOpen ? 'open' : 'closed'} className="..." />
// CSS: [data-state="open"] { ... }
```

In this project, UI components (e.g. Table) may use `data-state` for selected/hover; prefer existing component APIs rather than inventing new `data-state` values.

**Example (this project):** `TableRow` styles selected rows via `data-[state=selected]:bg-muted`. Use the component’s API to set that state instead of adding your own `data-state` on arbitrary elements:

```tsx
// Prefer: let the component set data-state
<TableRow data-state={isSelected ? "selected" : undefined}>...</TableRow>

// Avoid: inventing data-state on a random div
<div data-state="my-custom-thing">...</div>
```

**Rules of thumb:**

- **Existing components (Table, Radix, etc.):** Use only the `data-state` values that component defines (e.g. `TableRow` → `"selected"` or omit; Radix Accordion → `"open"` | `"closed"`). Don’t add new values those components don’t expect.
- **Your own components:** You may use `data-state` and define the allowed values for that component (e.g. a custom `Collapsible` with `"open"` | `"closed"`). Document and use that set consistently.
- **Restriction:** Don’t put `data-state` on arbitrary elements (e.g. a random `<div>`) without it being part of a component’s contract—either from a library or your own component API. That keeps state predictable and styling/tests reliable.

---

### 3. Page or section identification (e.g. `data-page`)

Use a single attribute on a root container to identify the **page or major section** for:

- E2E tests (e.g. “am I on the auth callback page?”)
- Analytics or feature flags that key off page/section

```tsx
<div data-page="auth-callback-handler">...</div>
<div data-page="google-oauth-callback">...</div>
```

Keep values **short, kebab-case, and stable** (tied to route or feature name, not to UI copy such as headings or button labels—those can change or be translated).

---

### 4. Analytics and feature flags

`data-*` can drive analytics or feature detection without leaking into visible text:

- `data-analytics-event="..."` or `data-track="..."` for event names
- `data-feature="..."` for feature-flag or experiment targeting

Avoid storing **large or sensitive payloads** in attributes; use small identifiers and resolve details in code or backend.

---

## Naming conventions

| Convention    | Example              | Notes                                      |
|---------------|----------------------|--------------------------------------------|
| **Kebab-case**| `data-testid="user-card"` | Matches HTML/JS convention; `dataset` yields camelCase in JS |
| **Stable names** | `data-page="reference-genre-tree"` | Tie to route/feature, not UI copy          |
| **Scoped**    | `data-testid="genre-tree-node-123"` | Optional suffix for lists (e.g. id) when needed |
| **Purpose, not implementation** | `data-testid="track-list"` not `data-testid="div-with-flex"` | Keeps tests meaningful if markup changes |

---

## When not to use data-*

- **Styling only:** Prefer Tailwind classes (or semantic HTML). Use `data-state` only when it’s the standard hook for a component (e.g. Radix).
- **Large or complex data:** Don’t put big JSON or sensitive data in attributes. Use React state, context, or the backend.
- **Semantics or accessibility:** Use proper elements (`<main>`, `<nav>`, `<button>`, ARIA) and visible labels; don’t replace them with `data-*`.
- **Every element:** Add `data-testid` (or similar) only where tests or tooling need a stable hook; see [Testing Strategy](./testing.md).

---

## References

- [HTML5: Custom data attributes (WHATWG)](https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
- [Testing Library – Priority of queries](https://testing-library.com/docs/queries/about#priority) (prefer role/label over testid)
- [Radix UI – Data attributes](https://www.radix-ui.com/primitives/docs/overview/styling#data-attributes) (`data-state`, etc.)
- [Project testing strategy](./testing.md)
