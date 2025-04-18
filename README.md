# Music Tree - Next.js Frontend

This project has been migrated from React + Vite to Next.js to provide server-side rendering capabilities, improved SEO, and better integration with the Django REST API backend.

## Features

- Server-side rendering with Next.js
- Client-side routing with Next.js Pages Router
- Integration with Django REST API
- Spotify authentication and library access
- Music playback and playlist management
- Genre organization and navigation

## Migration to Next.js

The application has been migrated from a Vite-based React application to Next.js while maintaining all functionality. Key changes include:

- Replaced react-router-dom with Next.js file-based routing
- Adapted API service for server-side rendering compatibility
- Environment variable configuration updated for Next.js
- Added Next.js configuration for API proxying and path aliases

## Environment Setup

Create a `.env.development.api-{local|remote}` file in the root of the project with the following variables:

```
NODE_ENV=development

NEXT_PUBLIC_BASE_URL_WITHOUT_PORT={base-url-without-port}
NEXT_PUBLIC_API_BASE_URL={api-base-url}
NEXT_PUBLIC_CONTACT_EMAIL=garcia.andreas.1991@gmail.com
NEXT_PUBLIC_SENTRY_IS_ACTIVE=false

NEXT_PUBLIC_SPOTIFY_CLIENT_ID={spotify-client-id}
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI={spotify-redirect-uri}
NEXT_PUBLIC_SPOTIFY_SCOPES=user-read-email playlist-read-private playlist-read-collaborative user-library-read user-top-read

```

Adjust the values as needed for your environment.

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Run the development server
npm run dev
```

The application will be available at http://localhost:3000. The dev server will automatically proxy API requests to the Django backend at the URL specified in your environment variables.

### Production

```bash
# Build for production
npm run build

# Start the production server
npm run start
```

## API Integration

The application integrates with a Django REST API backend. API calls are handled through the ApiService utility, which has been updated to support both client-side and server-side environments.

- In client-side rendering, the service uses XMLHttpRequest or fetch API
- In server-side rendering, the service falls back to fetch API
- API requests are proxied through Next.js rewrites configuration
- Authentication with Django is maintained across server and client environments

## Project Structure

```
├── next.config.js         # Next.js configuration
├── jsconfig.json          # Path aliases configuration
├── pages/                 # Next.js page components
│   ├── _app.js            # Application wrapper
│   ├── index.js           # Homepage (redirects to genre-playlists)
│   ├── genre-playlists.js # Genre playlists page
│   ├── spotify-library.js # Spotify library page
│   ├── uploaded-library.js # Uploaded library page
│   ├── account.js         # Account page
│   ├── 404.js             # Custom 404 page
│   └── auth/              # Authentication related pages
│       └── spotify/       # Spotify auth pages
│           └── callback.js # Spotify OAuth callback
├── src/                   # Source code
│   ├── components/        # React components
│   ├── contexts/          # React context providers
│   ├── utils/             # Utility functions and services
│   │   ├── api/           # API service and related utilities
│   │   └── config.js      # Configuration (updated for Next.js)
│   ├── hooks/             # Custom React hooks
│   ├── layouts/           # Page layouts
│   └── models/            # Data models
```

## Django Backend Integration

The application is designed to work with a Django REST API backend. The connection details are specified in the environment variables. The Next.js server proxies API requests to the Django backend through the rewrites configuration in `next.config.js`.

Ensure your Django backend is properly configured with CORS settings to accept requests from the Next.js application.
