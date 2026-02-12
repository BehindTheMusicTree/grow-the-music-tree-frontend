# Genre Playlists

Route: `/genre-playlists`
Access: authenticated

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Displays a comprehensive table of all genre playlists with filtering capabilities. Allows users to browse and search through the genre taxonomy.

## Data

- Full list of genre playlists from backend API
- Uses `useListFullGenrePlaylists` hook for data fetching

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires authenticated user session and dynamic playlist data.

## Notes

- Features multiple filter options: UUID, name, parent genre, root genre
- Displays playlist hierarchy with parent/child relationships
- Shows loading skeleton while data is being fetched
- Handles error states for failed API requests
