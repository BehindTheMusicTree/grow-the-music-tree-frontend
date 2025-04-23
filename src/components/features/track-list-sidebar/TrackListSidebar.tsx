"use client";

import { ReactNode } from "react";
import TrackList from "@components/features/track-list/TrackList";
import { usePlayer } from "@contexts/PlayerContext";

interface TrackListSidebarProps {
  className?: string;
}

interface Track {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration: string;
}

export default function TrackListSidebar({ className }: TrackListSidebarProps) {
  const { playerUploadedTrackObject, setPlayerUploadedTrackObject } = usePlayer();

  const handleTrackClick = (track: Track) => {
    setPlayerUploadedTrackObject(track);
  };

  // Example tracks - in a real app, these would come from a state or API
  const exampleTracks: Track[] = [
    {
      id: "1",
      title: "Example Track 1",
      artist: "Artist 1",
      albumArt: "/placeholder.jpg",
      duration: "3:45",
    },
    {
      id: "2",
      title: "Example Track 2",
      artist: "Artist 2",
      albumArt: "/placeholder.jpg",
      duration: "4:20",
    },
  ];

  return (
    <aside className={`w-80 bg-gray-900 h-full overflow-y-auto ${className}`}>
      <div className="p-4">
        <h2 className="text-xl font-bold text-white mb-4">Track List</h2>
        <TrackList tracks={exampleTracks} onTrackClick={handleTrackClick} />
      </div>
    </aside>
  );
}
