# GrowTheMusicTree - Frontend

> A community-driven platform for exploring and understanding musical genres through an interactive, evolving genre tree map.

**Learn more about our vision:** [VISION.md](VISION.md)

## Table of Contents

- [Key Features](#key-features)
- [Technical Overview](#technical-overview)
- [Getting Started](#getting-started)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Key Features

- 🌳 **Interactive Genre Tree** - Explore relationships between genres from roots to microgenres
- 🎧 **Musical Essence** - Visualize your listening identity by connecting streaming accounts
- 🤖 **AI Genre Detection** - Automatic genre classification for any track
- 🎵 **Smart Playlists** - Generate personalized playlists based on your musical journey
- 🌍 **Community-Driven** - Participate in genre classifications through discussions and voting
- 📊 **Rich Context** - Historical, cultural, and technical information for each genre

## Technical Overview

**Frontend Stack:**

- **Framework**: Next.js 15 with App Router
- **UI**: React 19, Tailwind CSS
- **State Management**: React Context, TanStack Query (React Query)
- **Visualization**: D3.js for interactive genre tree
- **Audio**: React Howler for music playback
- **Type Safety**: TypeScript

**Backend Integration:**

- Requires [Bodzify API backend](https://github.com/Bodzify/bodzify-api-django)
- RESTful API integration
- Spotify OAuth authentication

## Getting Started

For detailed setup instructions, please see [CONTRIBUTING.md](CONTRIBUTING.md#1-environment-setup).

### Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
npm run setup-env-dev-local  # For local API
# OR
npm run setup-env-dev-remote # For remote API

# Run the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on:

- How to set up your development environment
- Our Git Flow workflow and branching strategy
- Code style guidelines and best practices
- How to submit pull requests
- Testing requirements

All contributors are expected to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes to this project.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.
