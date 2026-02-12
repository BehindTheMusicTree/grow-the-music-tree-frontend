# Spotify Library

Route: `/spotify-library`
Access: authenticated

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Displays the user's Spotify music library with track information, ratings, and sync functionality. Allows users to view and manage their Spotify tracks within the genre tree ecosystem.

## Data

- User's Spotify library tracks
- Sync status and operations
- Uses hooks: `useListSpotifyLibTracks`, `useQuickSyncSpotifyLibTracks`, `useFullSyncSpotifyLibTracks`

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls

## Static Generation

Cannot be statically generated - requires authenticated user session and personal Spotify data.

## Notes

- Supports both quick and full library synchronization
- Displays track metadata: title, artist, album, duration
- Includes rating system for tracks
- Shows sync status and handles sync errors
- Features play/pause controls for track preview
