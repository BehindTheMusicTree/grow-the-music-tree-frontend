# Artist

Route: `/?artist=<uuid>` (panel over the genre tree; `/artists/<uuid>` redirects there)
Access: public, read-only

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Shows one artist from the reference library: photo with its Commons credit, type, country, active years, external links, members (or the groups the artist belongs to), discography, and tracks that can be played.

## Data

- Artist detail from the grow API `artists/<uuid>/`, fetched client-side through `/api/grow-proxy` (`useArtist`, panel built by `useArtistPanel`); an unknown or malformed uuid shows "This artist does not exist." in the panel
- `image` is a 500 px Wikimedia Commons thumbnail (or `null`), shown by `ArtistPhoto` with the author (falling back to "Wikimedia Commons") linking to the Commons page and the license, linked when `licenseUrl` is set
- Tracks from `library/songs/?artist=<uuid>&ordering=title`, fetched client-side one page at a time (`ArtistSongs`)
- Discography is grouped from each release's primary and secondary types: live and compilation secondary types win over the primary type

## Environment Variables

- `GROW_API_ORIGIN` - Required by `/api/grow-proxy`, which both the artist and track fetches go through

## Static Generation

Not applicable - the panel is rendered client-side over the genre tree.

## Notes

- Play all queues the playable tracks of the current page; tracks without a video are listed but cannot be played
- Artist names across the app (genre tree track lists, player track list, member lists) open this panel via `renderArtistLink`
