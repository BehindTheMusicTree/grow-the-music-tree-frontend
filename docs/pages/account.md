# Account

Route: `/account`
Access: authenticated

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Displays the user's Spotify profile information and provides account management options, including the ability to log out.

## Data

- Spotify user profile data (display name, email, profile image, country, subscription type, follower count)
- Fetched from Spotify API via backend integration

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for API calls
- `NEXT_PUBLIC_SENTRY_IS_ACTIVE` - For error tracking

## Static Generation

Cannot be statically generated - requires authenticated user session data.

## Notes

- Currently uses placeholder profile data in the implementation
- Includes logout functionality that clears the user session
- Shows loading state while fetching profile information
