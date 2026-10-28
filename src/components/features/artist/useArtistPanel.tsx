"use client";

import { useEffect } from "react";
import { Skeleton } from "@behindthemusictree/ui";
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
        content: (
          <div aria-busy="true" className="flex flex-col gap-2.5 px-6 py-2.5">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-16 mt-2.5" />
            <Skeleton className="h-16" />
          </div>
        ),
      };
    case "not-found":
      return {
        ...panel,
        title: "Artist not found",
        content: <p className="px-6 py-2.5 text-[var(--color-text-muted)]">This artist does not exist.</p>,
      };
    case "error":
      return { ...panel, title: "Artist", content: <p className="px-6 py-2.5 text-red-600">Could not load this artist.</p> };
    case "success": {
      const { artist } = result;
      return {
        ...panel,
        title: artist.name,
        content: (
          <>
            <ArtistHeader artist={artist} />
            <ArtistLinks artist={artist} />
            <ArtistMembers title="Members" memberships={artist.members} />
            <ArtistMembers title="Member of" memberships={artist.memberOf} />
            {artist.tracksCount > 0 && <ArtistSongs artist={{ uuid: artist.uuid, name: artist.name }} />}
          </>
        ),
        extraContent: artist.albums.length > 0 ? <ArtistDiscography albums={artist.albums} /> : undefined,
      };
    }
  }
}
