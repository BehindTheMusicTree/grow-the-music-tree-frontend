"use client";

import { useEffect } from "react";
import { useArtist } from "@hooks/useArtist";
import ArtistHeader from "./ArtistHeader";
import ArtistLinks from "./ArtistLinks";
import ArtistMembers from "./ArtistMembers";
import ArtistDiscography from "./ArtistDiscography";
import ArtistSongs from "./ArtistSongs";

interface ArtistPanelOptions {
  uuid: string | null;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  collapsed: boolean;
  onClose: () => void;
}

export function useArtistPanel({ uuid, expanded, onExpandedChange, collapsed, onClose }: ArtistPanelOptions) {
  const result = useArtist(uuid);
  const name = result.status === "success" ? result.artist.name : undefined;

  useEffect(() => {
    if (!name) return undefined;
    const previous = document.title;
    document.title = name;
    return () => {
      document.title = previous;
    };
  }, [name]);

  const panel = { expanded, onExpandedChange, collapsed, onClose };
  switch (result.status) {
    case "idle":
      return undefined;
    case "loading":
      return {
        ...panel,
        title: "Artist",
        content: <div className="h-24 animate-pulse rounded bg-gray-200" aria-busy="true" />,
      };
    case "not-found":
      return { ...panel, title: "Artist not found", content: <p className="text-gray-600">This artist does not exist.</p> };
    case "error":
      return { ...panel, title: "Artist", content: <p className="text-red-600">Could not load this artist.</p> };
    case "success": {
      const { artist } = result;
      return {
        ...panel,
        title: artist.name,
        content: (
          <div className="flex flex-col gap-6">
            <ArtistHeader artist={artist} />
            <ArtistLinks artist={artist} />
            <ArtistMembers title="Members" memberships={artist.members} />
            <ArtistMembers title="Member of" memberships={artist.memberOf} />
            {artist.tracksCount > 0 && <ArtistSongs artist={{ uuid: artist.uuid, name: artist.name }} />}
          </div>
        ),
        extraContent: artist.albums.length > 0 ? <ArtistDiscography albums={artist.albums} /> : undefined,
      };
    }
  }
}
