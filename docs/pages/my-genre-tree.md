# My Genre Tree

Route: `/my-genre-tree`
Access: authenticated

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Provides an interactive visualization of the music genre taxonomy using D3.js. Displays genre playlists organized in hierarchical tree structures, allowing users to explore genre relationships and create new genres.

## Data

- Genre playlists grouped by root genres
- Reference tree data for genre hierarchy
- Uses multiple hooks: `useListFullGenrePlaylists`, `useCreateGenre`, `useLoadReferenceTreeGenre`

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires authenticated user session and dynamic genre data.

## Notes

- Features interactive tree visualization with color-coded root genres
- Supports genre creation through popup interface
- Includes loading skeletons for better UX
- Allows users to contribute to the genre taxonomy by adding new genres
