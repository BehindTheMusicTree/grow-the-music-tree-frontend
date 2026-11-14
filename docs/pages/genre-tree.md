# TheMusicTree

Route: `/`
Access: public, read-only (editable when signed in as admin at `/admin`)

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Provides a public, read-only, interactive visualization of the shared music genre taxonomy using D3.js. Displays the genre tree that the project maintains, allowing exploration of genre relationships and classifications.

## Data

- Genre tree data from the shared taxonomy
- Genre classifications and relationships
- Uses hooks: `useListFullGenrePlaylists`

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires dynamic data and real-time updates.

## Notes

- Public access allows non-authenticated users to explore the genre taxonomy
- Features interactive tree visualization, read-only (no write-action UI) unless signed in as admin
- The genre detail panel shows the genre's Wikimedia Commons image above its summary, with author and license credit; nothing is shown for genres without one (needs the grow API's genre `image` field)
- Also the logo / home link

## Outline view (deactivated)

The outline view is kept for later but cannot be reached: the wheel/outline toggle (`ViewModeToggle`) was removed. `@behindthemusictree/app-kit-ui` still renders `viewMode="outline"`, and `GenreTreeViewModeProvider` / `GenreTreePage` still accept it. To bring it back, restore `src/components/features/genre-tree/ViewModeToggle.tsx` (and its test) from git history, from the commit before the one that removed it, and pass it as `floatingControlsLeading={canShowPopCore ? <ViewModeToggle /> : undefined}` in `GenreTreePage`.

See [Genre selection](genre-selection.md) for the entity UUID URL contract shared with the map.

## Mobile landscape layout

On touch screens in landscape with a viewport height of at most 500px, Tree, Map and About occupy the left half of the footer, including above the 768px width breakpoint. Detail panels use the same half-width above the footer; expanding a panel increases its height without increasing its width. Portrait retains the full-width mobile footer. Mouse-driven desktop layouts retain floating navigation controls.

The app declares the occupied edge with `--detail-panel-obscured-edge: left` in the landscape rules. The shared `useObscuredInset` hook and the map use that edge for framing. The contract is provided by `@behindthemusictree/ui` 0.26.0 and later.
