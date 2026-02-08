"use client";

import { createContext, useState, useContext, ReactNode, useMemo } from "react";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";
import TrackList, { TrackListFromUploadedTrack, TrackListFromCriteriaPlaylist } from "@models/track-list/TrackList";
import {
  TrackListOriginFromUploadedTrack,
  TrackListOriginFromCriteriaPlaylist,
} from "@models/track-list/origin/TrackListOrigin";
import { TrackListOriginType } from "@models/track-list/origin/TrackListOriginType";
import { CriteriaPlaylistDetailed } from "@schemas/domain/playlist/criteria-playlist/detailed";
import { Scope } from "@app-types/Scope";
import { usePlayer } from "./PlayerContext";
import { useTrackListSidebarVisibility } from "./TrackListSidebarVisibilityContext";
import { useListUploadedTracks } from "@hooks/useUploadedTrack";

interface TrackListContextType {
  trackList: TrackList | null;
  selectedTrack: UploadedTrackDetailed | null;
  setSelectedTrack: (track: UploadedTrackDetailed | null) => void;
  toTrackAtPosition: (position: number) => void;
  playNewTrackListFromUploadedTrackUuid: (track: UploadedTrackDetailed, scope: Scope) => void;
  playNewTrackListFromGenrePlaylist: (genrePlaylist: CriteriaPlaylistDetailed, scope: Scope) => void;
}

const TrackListContext = createContext<TrackListContextType | undefined>(undefined);

interface TrackListProviderProps {
  children: ReactNode;
}

export function TrackListProvider({ children }: TrackListProviderProps) {
  const [trackList, setTrackList] = useState<TrackList | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<UploadedTrackDetailed | null>(null);
  const { loadTrackForPlayer } = usePlayer();
  const { showTrackListSidebar } = useTrackListSidebarVisibility();
  const scope = trackList?.origin?.scope ?? null;
  const { data: uploadedTracksResponse } = useListUploadedTracks(scope);

  // Create a memoized track list that updates when uploadedTracks changes
  const currentTrackList = useMemo(() => {
    if (!trackList) return null;

    const uploadedTracks = uploadedTracksResponse?.results || [];

    // If the current track list is from uploaded tracks, update it with fresh data
    if (trackList.origin.type === TrackListOriginType.UPLOADED_TRACK) {
      const origin = trackList.origin as TrackListOriginFromUploadedTrack;

      // Find the updated version of the original track in the fresh data
      const updatedOriginalTrack = uploadedTracks.find((track) => track.uuid === origin.uploadedTrack.uuid);

      if (updatedOriginalTrack) {
        // Create a new track list with the updated track
        return new TrackListFromUploadedTrack([updatedOriginalTrack], origin);
      }
    }
    // If the current track list is from a genre playlist, update tracks with fresh data
    else if (trackList.origin.type === TrackListOriginType.GENRE_PLAYLIST) {
      const origin = trackList.origin as TrackListOriginFromCriteriaPlaylist;

      // Update all tracks in the playlist with fresh data
      const updatedTracks = trackList.uploadedTracks.map((originalTrack) => {
        const updatedTrack = uploadedTracks.find((track) => track.uuid === originalTrack.uuid);
        return updatedTrack || originalTrack; // Use updated track if found, otherwise keep original
      });

      // Check if any tracks were actually updated
      const hasUpdates = updatedTracks.some((updatedTrack, index) => updatedTrack !== trackList.uploadedTracks[index]);

      if (hasUpdates) {
        return new TrackListFromCriteriaPlaylist(updatedTracks, origin);
      }
    }

    return trackList;
  }, [trackList, uploadedTracksResponse]);

  const toTrackAtPosition = (position: number) => {
    if (currentTrackList && position >= 0 && position < currentTrackList.uploadedTracks.length) {
      setSelectedTrack(currentTrackList.uploadedTracks[position]);
    }
  };

  const playNewTrackListFromUploadedTrackUuid = (track: UploadedTrackDetailed, scope: Scope) => {
    const origin = new TrackListOriginFromUploadedTrack(track, scope);
    const newTrackList = new TrackListFromUploadedTrack([track], origin);

    setTrackList(newTrackList);
    setSelectedTrack(track);
    showTrackListSidebar();
    loadTrackForPlayer(track, scope);
  };

  const playNewTrackListFromGenrePlaylist = (genrePlaylist: CriteriaPlaylistDetailed, scope: Scope) => {
    const tracks = genrePlaylist.uploadedTrackPlaylistRelations
      .sort((a, b) => a.position - b.position)
      .map((rel) => rel.uploadedTrack);

    if (tracks.length === 0) {
      console.warn("No tracks found in genre playlist");
      return;
    }

    const origin = new TrackListOriginFromCriteriaPlaylist(genrePlaylist, scope);
    const newTrackList = new TrackListFromCriteriaPlaylist(tracks, origin);

    setTrackList(newTrackList);
    setSelectedTrack(tracks[0]);
    showTrackListSidebar();
    loadTrackForPlayer(tracks[0], scope);
  };

  return (
    <TrackListContext.Provider
      value={{
        trackList: currentTrackList,
        selectedTrack,
        setSelectedTrack,
        toTrackAtPosition,
        playNewTrackListFromUploadedTrackUuid,
        playNewTrackListFromGenrePlaylist,
      }}
    >
      {children}
    </TrackListContext.Provider>
  );
}

export function useTrackList() {
  const context = useContext(TrackListContext);
  if (!context) {
    throw new Error("useTrackList must be used within a TrackListProvider");
  }
  return context;
}
