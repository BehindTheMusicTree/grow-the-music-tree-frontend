# Copilot Instructions

Context for GitHub Copilot (Chat, coding agent, and PR code review) working in this repository.

## Project

Next.js (App Router) + React + TypeScript frontend for Behind The Music Tree, styled with Tailwind CSS. It talks to [TheMusicTreeAPI](https://github.com/BehindTheMusicTree/bodzify-api-django) backend.

## Conventions

Full conventions live in the canonical sources below — read them before reviewing, don't rely on this summary alone:

- [`CONTRIBUTING.md`](../CONTRIBUTING.md) — Git Flow branching (`feature/*`, `fix/*`, `chore/*`, `release/*`, `hotfix/*`), commit/PR title format (`<type>(<scope>): <summary>`), PR process
- [`docs/STYLE_GUIDE.md`](../docs/STYLE_GUIDE.md) — TypeScript/React/Next.js conventions, file naming, Tailwind usage
- [`.cursor/rules/*.mdc`](../.cursor/rules) — per-topic rules (commit message format, semver, testing, no-useless-comments, Tailwind class order, etc.)

## What to flag in review

- `console.log` / debug code left in
- Deep relative imports (`../../../`) where a path alias from `tsconfig.json` (`@components/*`, `@hooks/*`, `@lib/*`, etc.) should be used
- Non-Tailwind inline styles or CSS
- Missing types / implicit `any`
- Branch or PR title naming that doesn't match the conventions above
- Deviations from `.cursor/rules/*.mdc`

## Validation

- `npm run lint`
- `npm run build`
- `npm run test`
