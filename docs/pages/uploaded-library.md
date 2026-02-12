# Uploaded Library

Route: `/uploaded-library`
Access: authenticated

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Allows users to upload and manage their personal music files. Displays uploaded tracks with playback controls, ratings, and metadata.

## Data

- List of user's uploaded tracks
- Uses `useListUploadedTracks` hook for data fetching

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires authenticated user session and personal uploaded content.

## Notes

- Supports file upload through drag-and-drop or file selection
- Displays track metadata: title, artist, duration
- Includes rating system for uploaded tracks
- Features integrated audio playback with player controls
- Allows creating playlists from uploaded tracks
