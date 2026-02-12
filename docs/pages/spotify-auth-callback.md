# Spotify Auth Callback

Route: `/auth/spotify/callback`
Access: public

## Table of Contents

- [Purpose](#purpose)
- [Data](#data)
- [Environment Variables](#environment-variables)
- [Static Generation](#static-generation)
- [Notes](#notes)

## Purpose

Handles the OAuth callback from Spotify after user authorization. Processes the authorization code, authenticates with the backend, and redirects to the home page on success.

## Data

- Spotify authorization code from URL parameters
- Backend authentication API call to exchange code for session tokens

## Environment Variables

- `NEXT_PUBLIC_BACKEND_BASE_URL` - Required for backend authentication API

## Static Generation

Cannot be statically generated - handles dynamic OAuth flow and user authentication.

## Notes

- Processes URL parameters: `code` (success) or `error` (failure)
- Handles various error cases: missing code, backend auth failure, unexpected errors
- Redirects to home page (`/`) on successful authentication
- Shows loading and error states during the authentication process
