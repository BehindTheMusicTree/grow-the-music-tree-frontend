"use client";

import { createContext, useState, useContext, ReactNode } from "react";
import { UploadedTrackDetailed } from "@domain/uploaded-track/response/detailed";
import TrackList, { TrackListFromUploadedTrack, TrackListFromCriteriaPlaylist } from "@models/track-list/TrackList";
import {
  TrackListOriginFromUploadedTrack,
  TrackListOriginFromCriteriaPlaylist,
} from "@models/track-list/origin/TrackListOrigin";
import { CriteriaPlaylistDetailed } from "@schemas/domain/playlist/criteria-playlist/detailed";
import { usePlayer } from "./PlayerContext";

interface TrackListContextType {
  trackList: TrackList | null;
  setTrackList: (trackList: TrackList) => void;
  selectedTrack: UploadedTrackDetailed | null;
  setSelectedTrack: (track: UploadedTrackDetailed | null) => void;
  toTrackAtPosition: (position: number) => void;
  playNewTrackListFromUploadedTrackUuid: (track: UploadedTrackDetailed) => void;
  playNewTrackListFromGenrePlaylist: (genrePlaylist: CriteriaPlaylistDetailed) => void;
}

const TrackListContext = createContext<TrackListContextType | undefined>(undefined);

interface TrackListProviderProps {
  children: ReactNode;
}

export function TrackListProvider({ children }: TrackListProviderProps) {
  const [trackList, setTrackList] = useState<TrackList | null>(null);
  const [selectedTrack, setSelectedTrack] = useState<UploadedTrackDetailed | null>(null);
  const { loadTrackForPlayer } = usePlayer();

  const toTrackAtPosition = (position: number) => {
    if (trackList && position >= 0 && position < trackList.uploadedTracks.length) {
      setSelectedTrack(trackList.uploadedTracks[position]);
    }
  };

  const playNewTrackListFromUploadedTrackUuid = (track: UploadedTrackDetailed) => {
    // Create track list origin
    const origin = new TrackListOriginFromUploadedTrack(track);

    // Create new track list with only the selected track
    const newTrackList = new TrackListFromUploadedTrack([track], origin);

    // Set the track list and selected track
    setTrackList(newTrackList);
    setSelectedTrack(track);

    // Delegate audio loading to PlayerContext
    loadTrackForPlayer(track);
  };

  const playNewTrackListFromGenrePlaylist = (genrePlaylist: CriteriaPlaylistDetailed) => {
    // Extract tracks from playlist relationships and sort by position
    const tracks = genrePlaylist.uploadedTrackPlaylistRelations
      .sort((a, b) => a.position - b.position)
      .map((rel) => rel.uploadedTrack);

    if (tracks.length === 0) {
      console.warn("No tracks found in genre playlist");
      return;
    }

    // Create track list origin
    const origin = new TrackListOriginFromCriteriaPlaylist(genrePlaylist);

    // Create new track list with all tracks from the playlist
    const newTrackList = new TrackListFromCriteriaPlaylist(tracks, origin);

    // Set the track list and selected track (first track)
    setTrackList(newTrackList);
    setSelectedTrack(tracks[0]);

    // Delegate audio loading to PlayerContext
    loadTrackForPlayer(tracks[0]);
  };

  return (
    <TrackListContext.Provider
      value={{
        trackList,
        setTrackList,
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
