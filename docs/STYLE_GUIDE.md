# Style Guide

Code and UI styling conventions for this project.

## Table of Contents

- [Technology guidelines](#technology-guidelines)
- [File and module naming](#file-and-module-naming)
- [Key directories](#key-directories)
- [Tailwind & UI styling](#tailwind--ui-styling)
- [Best practices](#best-practices)

## Technology guidelines

- **TypeScript**: Use TypeScript for all new components and utilities
- **React**: Follow React best practices and hooks conventions
- **Next.js**: Leverage Next.js App Router features (Server Components, Client Components, Server Actions)
- **Styling**: Tailwind CSS only (see [Tailwind & UI styling](#tailwind--ui-styling))
- **Component structure**: Keep components focused and reusable
- **State management**: React Context for global state, React Query for server state
- **File organization**: Follow the existing project structure in `src/`

## File and module naming

| File type          | Style                 | Example                 |
| ------------------ | --------------------- | ----------------------- |
| React components   | PascalCase            | `UserCard.tsx`          |
| Next.js routes     | lowercase-with-dashes | `user-profile/page.tsx` |
| Hooks              | camelCase             | `useAuth.ts`            |
| Utils              | camelCase             | `formatDate.ts`         |
| Context providers  | PascalCase            | `AuthProvider.tsx`      |
| API route handlers | lowercase             | `route.ts`              |

## Key directories

- `src/app/` – Next.js App Router pages and layouts
- `src/components/` – Reusable React components
  - `src/components/features/` – Feature-specific components
  - `src/components/ui/` – Generic UI components
- `src/contexts/` – React Context providers
- `src/hooks/` – Custom React hooks
- `src/lib/` – Utility functions and helpers
- `src/schemas/` – Zod validation schemas
- `src/models/` – TypeScript types and interfaces
- `src/utils/` – General utility functions

## Tailwind & UI styling

- Use Tailwind utility classes only. Do **not** import or use `.module.css` files.
- Prefer semantic combinations of utilities over one-off custom CSS.

**Class order** (Layout → Typography → Visual → Interactive → States):

| Order | Category    | Examples |
| ----- | ----------- | -------- |
| 1     | Layout      | `flex`, `grid`, `block`, `relative`, `absolute`, `w-`, `h-`, `p-`, `m-`, `space-`, `overflow-` |
| 2     | Typography  | `font-`, `text-`, `leading-`, `tracking-` |
| 3     | Visual       | `bg-`, `border-`, `rounded-`, `shadow-`, `opacity-` |
| 4     | Interactive  | `cursor-`, `pointer-events-`, `select-` |
| 5     | States       | `hover:`, `focus:`, `active:`, `disabled:` |

Example:

```tsx
<button className="flex items-center justify-center w-full p-4 text-base font-medium bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 disabled:opacity-50">
  Submit
</button>
```

**Common patterns:**

| Concept         | Tailwind classes |
| --------------- | ----------------- |
| Overlay         | `fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50` |
| Popup/modal     | `bg-white rounded-lg p-6 min-w-[300px] max-w-[500px] shadow-lg` |
| Error text      | `text-red-600` |
| Success         | `text-green-600` |
| Confirm/info    | `text-blue-600` |
| Action row      | `flex justify-end gap-3 mt-4` |
| Button base     | `px-4 py-2 rounded font-medium` |
| Primary button  | `bg-blue-600 text-white hover:bg-blue-700 transition-colors` |
| Secondary button| `bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors` |

## Best practices

- Write semantic, accessible HTML
- Use TypeScript types/interfaces for props and data structures
- Follow the naming conventions above
- Keep components small and focused
- Use custom hooks to extract reusable logic
- Implement error boundaries for error handling
- Use React Query for API data fetching
- Follow the Tailwind class order in this guide
- Avoid useless comments (see `.cursor/rules/no-useless-comments.mdc`)
