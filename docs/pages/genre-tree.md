# TheMusicTree

Route: `/`
Access: public, read-only

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
- Features interactive tree visualization, always read-only (no write-action UI)
- Also the logo / home link
