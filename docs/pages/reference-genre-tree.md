# Reference Genre Tree

Route: `/reference-genre-tree`
Access: public

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Provides a public, interactive visualization of the shared music genre taxonomy using D3.js. Displays the reference genre tree that all users contribute to and evolve together, allowing exploration of genre relationships and community-driven genre classifications.

## Data

- Reference genre tree data from shared taxonomy
- Community-contributed genre classifications and relationships
- Uses hooks: `useListReferenceGenrePlaylists`

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires dynamic community data and real-time updates.

## Notes

- Public access allows non-authenticated users to explore the genre taxonomy
- Features interactive tree visualization with community-contributed data
- Supports viewing genre relationships and classifications from all users
- Serves as the foundation for the evolving music genre reference
