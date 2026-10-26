# Artist

Route: `/artists/<uuid>`
Access: public, read-only

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Shows one artist from the reference library: type, country, active years, external links, members (or the groups the artist belongs to), discography, and tracks that can be played.

## Data

- Artist detail from the grow API `artists/<uuid>/`, fetched server-side (`fetchArtist` in `src/lib/artist.ts`); an unknown uuid renders the 404 page
- Tracks from `library/songs/?artist=<uuid>&ordering=title`, fetched client-side one page at a time (`ArtistSongs`)
- Discography is grouped from each release's primary and secondary types: live and compilation secondary types win over the primary type

## Environment Variables

- `GROW_API_ORIGIN` - Required; the server-side artist fetch calls it directly, the client-side track fetch goes through `/api/grow-proxy`

## Static Generation

Cannot be statically generated - rendered per request from live artist data.

## Notes

- `data-page="artist"` on the page root
- Play all queues the playable tracks of the current page; tracks without a video are listed but cannot be played
- Artist names across the app (genre tree track lists, player track list, member lists) link here via `renderArtistLink`
