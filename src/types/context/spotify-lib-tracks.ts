import { SpotifyLibTrack } from "@/types/api/spotify";

export interface SpotifyLibTracksContextType {
  spotifyLibTracks: SpotifyLibTrack[] | undefined;
  loading: boolean;
  error: Error | null;
  quickSyncSpotifyLibTracks: () => void;
  isQuickSyncPending: boolean;
  fullSyncSpotifyLibTracks: () => void;
  isFullSyncPending: boolean;
  currentPage: number;
  pageSize: number;
  totalTracks: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  refreshTracks: () => void;
}

export interface SpotifyLibTracksProviderProps {
  children: React.ReactNode;
}
