import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { AuthProvider } from "@contexts/AuthContext";
import { PopupProvider } from "@contexts/PopupContext";
import { UploadedTrackProvider } from "@contexts/UploadedTrackContext";
import { GenrePlaylistProvider } from "@contexts/GenrePlaylistContext";
import { ApiAuthenticatedProvider } from "@contexts/ApiAuthenticatedContext";

import AppRoutes from "./AppRoutes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <PopupProvider>
            <ApiAuthenticatedProvider contextName="app">
              <UploadedTrackProvider>
                <GenrePlaylistProvider>
                  <AppRoutes />
                </GenrePlaylistProvider>
              </UploadedTrackProvider>
            </ApiAuthenticatedProvider>
          </PopupProvider>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
