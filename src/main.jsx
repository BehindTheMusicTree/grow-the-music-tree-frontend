import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";

import App from "./App.jsx";
import "./index.css";

import { PlayerProvider } from "./contexts/player/PlayerContext";
import { TrackListProvider } from "./contexts/track-list/TrackListContext";
import { GenrePlaylistsProvider } from "./contexts/genre-playlists/GenrePlaylistsContext";

if (import.meta.env.VITE_SENTRY_ACTIVE == true) {
  Sentry.init({
    dsn: "https://7f17fcd9feebfb634ad7ba2f638ba69a@o4507119053832192.ingest.de.sentry.io/4507119058026576",
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    // Performance Monitoring
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/bodzify\.com\/api\/v1/],
    // Session Replay
    replaysSessionSampleRate: 1.0, // Set sample at a lower rate in production (e.g. 0.1 for 10% of sessions)
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GenrePlaylistsProvider>
      <PlayerProvider>
        <TrackListProvider>
          {import.meta.env.VITE_SENTRY_ACTIVE === true ? (
            <Sentry.ErrorBoundary fallback={"An error has occurred"}>
              <App />
            </Sentry.ErrorBoundary>
          ) : (
            <App />
          )}
        </TrackListProvider>
      </PlayerProvider>
    </GenrePlaylistsProvider>
  </React.StrictMode>
);
